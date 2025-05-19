import { GetFormById, GetFormWithSubmissionDetails } from "../../../../actions/form";
import FormLinkShare from "../../../../components/FormLinkShare";
import VisitBtn from "../../../../components/VisitBtn";
import ResumeTestBtn from "../../../../components/ResumeTestBtn";
import { StatsCard } from "../../page";
import { LuView } from "react-icons/lu";
import { FaWpforms } from "react-icons/fa";
import { HiCursorClick } from "react-icons/hi";
import { TbArrowBounce } from "react-icons/tb";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table";
import { formatDistance } from "date-fns/formatDistance";
import { Button } from "../../../../components/ui/button";
import { MdPreview } from "react-icons/md";
//import EditFormBtn from "../../../../components/EditFormBtn";
import { Amplify } from "aws-amplify"
import outputs from "../../../../amplify_outputs.json"

Amplify.configure(outputs)

async function FormDetailPage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const { id } = await params;
  const form = await GetFormById(id);

  const shareUrl = form?.form?.shareURL ?? '';

  if (!form) {
    throw new Error("form not found");
  }
  const { visits, submissions } = form;

  let submissionRate = 0;

  if ((visits ?? 0) > 0) {
    submissionRate = ((submissions ?? 0) / (visits ?? 0)) * 100;
  }

  const bounceRate = 100 - submissionRate;

  return (
    <>
      <div className="py-10 border-b border-muted">
        <div className="flex justify-between container">
          <h1 className="text-4xl font-bold truncate">{form.form.name}</h1>
        </div>
        <div className="flex justify-between container">
          <h3 className="text-2xl font-bold truncate">{form.clientName}</h3>
          <VisitBtn shareUrl={shareUrl} />
        </div>
        <div className="flex justify-between container">
          <h3 className="text-2xl font-bold truncate">{form.projectName}</h3>
        {/*<EditFormBtn id={id} />*/}
        </div>
       <div className="flex justify-between container">
          <h3 className="text-sm text-muted-foreground text-wrap max-w-[500px]">{form.FormDescription}</h3>
        </div>
      </div>

      <div className="py-4 border-b border-muted">
        <div className="container flex gap-2 items-center justify-between">
          <FormLinkShare shareUrl={shareUrl} />
        </div>
      </div>
      <div className="w-full pt-8 gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 container">
        <StatsCard
          title="Total visits"
          icon={<LuView className="text-blue-600" />}
          helperText="All time form visits"
          value={(visits ?? 0).toLocaleString() || ""}
          loading={false}
          className="shadow-md shadow-blue-600"
        />

        <StatsCard
          title="Total submissions"
          icon={<FaWpforms className="text-yellow-600" />}
          helperText="All time form submissions"
          value={(submissions ?? 0).toLocaleString() || ""}
          loading={false}
          className="shadow-md shadow-yellow-600"
        />

        <StatsCard
          title="Submission rate"
          icon={<HiCursorClick className="text-green-600" />}
          helperText="Visits that result in form submission"
          value={submissionRate.toLocaleString() + "%" || ""}
          loading={false}
          className="shadow-md shadow-green-600"
        />

        <StatsCard
          title="Bounce rate"
          icon={<TbArrowBounce className="text-red-600" />}
          helperText="Visits that leaves without interacting"
          value={bounceRate.toLocaleString() + "%" || ""}
          loading={false}
          className="shadow-md shadow-red-600"
        />
      </div>

      <div className="container pt-10">
        <ProjectLogTable id={form.form.id} />
      </div>
    </>
  );
}

export default FormDetailPage;

export async function ProjectLogTable({ id }: { id: string }) {
  try {
    const data = await GetFormWithSubmissionDetails(id);

    if (!data) {
      return <div>Error loading project log data.</div>;
    }

    const { submissions } = data;

    return (
      <div>
        <h1 className="text-2xl font-bold my-4">Project Log</h1>
        <div className="rounded-md border">
          <Table className="min-w-full border-collapse">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center border p-2 uppercase">Equipment Name</TableHead>
                <TableHead className="text-center border p-2 uppercase">Equipment Tag</TableHead>
                <TableHead className="text-center border p-2 uppercase">Submitted At</TableHead>
                <TableHead className="text-center border p-2 uppercase">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length > 0 ? (
                submissions.map((s, i) => {
                  // Check if `tag` exists in the submission object
                  if ("tag" in s) {
                    const wasSubmitted = Array.isArray(s.contentTest)
                      ? s.contentTest.includes(s.submissionId ?? "")
                      : false;
                    return (
                      <TableRow key={i}>
                        <TableCell className="border p-2">{s.equipmentName}</TableCell>
                        <TableCell className="border p-2">{s.tag}</TableCell>
                        <TableCell className="border p-2">
                          {s.submittedAt
                            ? formatDistance(new Date(s.submittedAt), new Date(), {
                              addSuffix: true,
                            })
                            : "Not Submitted"}
                        </TableCell>
                        <TableCell className="border p-2 text-center">
                          {wasSubmitted ? (
                            <a href={`/view-submitted/${s.submissionId}`}>
                              <Button variant="outline" className="gap-2">
                                <MdPreview className="h-6 w-6" />
                                View Form
                              </Button>
                            </a>
                          ) : (
                            <ResumeTestBtn formTag2Id={s.formtagId} />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  } else {
                    // If there's an error property, show it in a row
                    return (
                      <TableRow key={i}>
                        {/*<TableCell colSpan={4} className="text-center text-sm text-muted-foreground italic">
                          {s.error}
                        </TableCell>*/}
                      </TableRow>
                    );
                  }
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No submissions yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in ProjectLogTable:", error);
    return <div>Error loading data</div>;
  }
}



