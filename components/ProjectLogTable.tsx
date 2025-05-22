'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { formatDistance } from "date-fns";
import { MdPreview } from "react-icons/md";
import ResumeTestBtn from "./ResumeTestBtn";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteFormSubmissionCascade } from "../actions/form"; // ajuste o caminho
import { fetchAuthSession } from "aws-amplify/auth";
import { FaTrash } from "react-icons/fa";

type SubmissionEntry = {
  formID: string;
  equipmentName: string;
  tag: string;
  submittedAt?: string;
  submissionId?: string;
  formtagId: string;
  contentTest: string[];
};

export function ProjectLogTable({ submissions }: { submissions: SubmissionEntry[] }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAdmin() {
      try {
        const session = await fetchAuthSession();
        const rawGroups = session.tokens?.accessToken.payload["cognito:groups"];
        const groups: string[] = Array.isArray(rawGroups)
          ? rawGroups.filter((g): g is string => typeof g === "string")
          : typeof rawGroups === "string"
            ? [rawGroups]
            : [];
        setIsAdmin(groups.includes("admin"));
      } catch (error) {
        console.error("Failed to fetch user groups", error);
      }
    }
    checkAdmin();
  }, []);

  const handleDelete = async (formId: string) => {
    if (!confirm("Are you sure you want to delete this form?")) return;
    try {
      await deleteFormSubmissionCascade(formId);

      router.refresh(); 
    } catch (error) {
      console.error("Failed to delete form", error);
    }
  };

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
              {isAdmin && <TableHead className="text-center border p-2 uppercase">Delete</TableHead>}
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
                    {isAdmin && (
                      <TableCell className="border p-2 text-center">
                        <Button
                          variant="destructive"
                          className="gap-2"
                          onClick={() => handleDelete(s.submissionId ?? "")}
                          disabled={!s.submissionId}
                        >
                          <FaTrash />
                          Delete
                        </Button>
                      </TableCell>
                    )}
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
