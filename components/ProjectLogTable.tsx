'use client'

import { GetFormWithSubmissionDetails } from "../actions/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { formatDistance } from "date-fns";
import { MdPreview } from "react-icons/md";
import ResumeTestBtn from "./ResumeTestBtn";

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
                    return <TableRow key={i} />;
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
