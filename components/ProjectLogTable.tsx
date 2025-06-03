'use client'


import { Button } from "./ui/button";
import { formatDistance } from "date-fns";
import { MdPreview } from "react-icons/md";
import ResumeTestBtn from "./ResumeTestBtn";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteFormSubmissionCascade } from "../actions/form"; // ajuste o caminho
import { fetchAuthSession } from "aws-amplify/auth";
import { FaTrash } from "react-icons/fa";
import { Accordion } from "@aws-amplify/ui-react";
import { SubmissionSummary } from "./generateTableSummary";

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

    {/* Cabeçalho (Header) */}
    <div className="flex w-full bg-muted font-semibold border-y">
      <div className="flex-1 p-2 text-center uppercase border">Equipment Name</div>
      <div className="flex-1 p-2 text-center uppercase border">Equipment Tag</div>
      <div className="flex-1 p-2 text-center uppercase border">Submitted At</div>
      <div className="w-9 p-2 text-center uppercase border"></div>
    </div>

    {/* Accordion */}
    <Accordion.Container>
      {submissions.length > 0 ? (
        [...submissions]
          .sort((a, b) => {
            if (!a.submittedAt && b.submittedAt) return -1;
            if (a.submittedAt && !b.submittedAt) return 1;
            return (a.tag ?? "").localeCompare(b.tag ?? "");
          })
          .map((s, i) => {
            const wasSubmitted = Array.isArray(s.contentTest)
              ? s.contentTest.includes(s.submissionId ?? "")
              : false;

            return (
              <Accordion.Item key={i} value={`item-${i}`}>
                <Accordion.Trigger>
                  <div className="flex w-full items-center">
                    <div className="flex-1 p-2 border">{s.equipmentName}</div>
                    <div className="flex-1 p-2 border">{s.tag}</div>
                    <div className="flex-1 p-2 border">
                      {s.submittedAt
                        ? formatDistance(new Date(s.submittedAt), new Date(), {
                            addSuffix: true,
                          })
                        : "Not Submitted"}
                    </div>
                    <div className="w-8 p-2 border text-center">
                      <Accordion.Icon />
                    </div>
                  </div>
                </Accordion.Trigger>
                <Accordion.Content>
                  <div className="p-4 bg-muted rounded-md space-y-4">
                    <div className="text-sm">
                      <SubmissionSummary submissionId={s.submissionId ?? ""} />
                    </div>

                    <div className="flex gap-4 justify-between flex-wrap">
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

                      {isAdmin && (
                        <Button
                          variant="destructive"
                          className="gap-2"
                          onClick={() => handleDelete(s.submissionId ?? "")}
                          disabled={!s.submissionId}
                        >
                          <FaTrash />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            );
          })
      ) : (
        <p className="text-center p-4 text-muted-foreground">No submissions yet</p>
      )}
    </Accordion.Container>
  </div>
);


}
