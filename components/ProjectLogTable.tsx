'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { formatDistance } from "date-fns";
import { MdPreview } from "react-icons/md";
import ResumeTestBtn from "./ResumeTestBtn";

type SubmissionEntry = {
  equipmentName: string;
  tag: string;
  submittedAt?: string;
  submissionId?: string;
  formtagId: string;
  contentTest: string[]; // assuming it's an array of submission IDs
};

export function ProjectLogTable({ submissions }: { submissions: SubmissionEntry[] }) {
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
}
