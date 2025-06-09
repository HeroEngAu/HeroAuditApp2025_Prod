import { GetFormById, GetFormWithSubmissionDetails } from "../../../../actions/form";
import FormLinkShare from "../../../../components/FormLinkShare";
import VisitBtn from "../../../../components/VisitBtn";
import { StatsCard } from "../../page";
import { LuView } from "react-icons/lu";
import { FaWpforms } from "react-icons/fa";
import { HiCursorClick } from "react-icons/hi";
import { TbArrowBounce } from "react-icons/tb";
import { Amplify } from "aws-amplify"
import outputs from "../../../../amplify_outputs.json"
import { ProjectLogTable } from "../../../../components/ProjectLogTable";
import EditFormBtn from "../../../../components/EditFormBtn";
import DeleteFormBtn from "../../../../components/DeleteFormBtn";
import TurnEditableBtn from "../../../../components/TurnEditableBtn";

Amplify.configure(outputs)

type Params = Promise<{ id: string }>;

async function FormDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const form = await GetFormById(id);

  if (!form) {
    throw new Error("form not found");
  }

  const shareUrl = form?.form?.shareURL ?? '';
  const { visits, submissions: submissionCount } = form;

  let submissionRate = 0;

  if ((visits ?? 0) > 0) {
    submissionRate = ((submissionCount ?? 0) / (visits ?? 0)) * 100;
  }

  const bounceRate = 100 - submissionRate;

  const data = await GetFormWithSubmissionDetails(id);
  const { submissions } = data ?? { submissions: [] };

  const slimSubmissions = submissions.map((s) => ({
    formID: s.formId,
    equipmentName: s.equipmentName,
    tag: s.tag,
    submittedAt: s.submittedAt ?? undefined,
    submissionId: s.submissionId ?? undefined,
    formtagId: s.formtagId,
    contentTest: s.contentTest,
  }));

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
          <EditFormBtn id={id} />
        </div>
        <div className="flex justify-between container">
          <h3 className="text-sm text-muted-foreground text-wrap max-w-[500px]">{form.FormDescription}</h3>
          <DeleteFormBtn id={id} />
        </div>
        <div className="flex justify-between container">
          <TurnEditableBtn id={id} />
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
          value={(submissionCount ?? 0).toLocaleString() || ""}
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
        <div className="container pt-10">
          <ProjectLogTable submissions={slimSubmissions} />
        </div>
      </div>
    </>
  );
}

export default FormDetailPage;


