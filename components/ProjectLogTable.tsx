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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { toast } from "./ui/use-toast";
import clsx from "clsx";
import { MdSearch } from "react-icons/md";

type SubmissionEntry = {
  formID: string;
  equipmentTag: string;
  submittedAt?: string;
  submissionId?: string;
  formtagId: string;
  contentTest: string[];
  projectName: string;
  projectCode: string;
  docNumber: string;
  docRevisionNumber: string | number;
};

export function ProjectLogTable({ submissions }: { submissions: SubmissionEntry[] }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
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
    try {
      await deleteFormSubmissionCascade(formId);

      router.refresh();
    } catch (error) {
      console.error("Failed to delete form", error);
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    const text = `${s.projectName} ${s.projectCode} ${s.docNumber} ${s.docRevisionNumber} ${s.equipmentTag} ${s.submittedAt || "Not Submitted"}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
        <h1 className="text-2xl font-bold text-foreground">Project Log</h1>

        {/* Search input with icon inside */}
        <div className="relative w-full md:w-80">
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <input
            type="text"
            placeholder="Search project, doc, tag..."
            className="pl-10 pr-4 py-2 border border-border dark:border-neutral-700 bg-background dark:bg-neutral-800 text-foreground rounded-md w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Header */}
      <div className="hidden md:flex w-full bg-muted text-foreground dark:bg-neutral-800 dark:text-white font-semibold border-y border-border dark:border-neutral-700">
        <div className="flex-1 p-2 text-center uppercase border-r dark:border-neutral-700">Project</div>
        <div className="flex-1 p-2 text-center uppercase border-r dark:border-neutral-700">Project Code</div>
        <div className="flex-[1.5] p-2 text-center uppercase border-r dark:border-neutral-700">Doc Number</div>
        <div className="flex-1 p-2 text-center uppercase border-r dark:border-neutral-700">Equip. TAG</div>
        <div className="flex-1 p-2 text-center uppercase border-r dark:border-neutral-700">Submitted At</div>
        <div className="w-9 p-2 text-center uppercase"></div>
      </div>

      {/* Accordion */}
      <Accordion.Container>
        {filteredSubmissions.length > 0 ? (
          filteredSubmissions
            .sort((a, b) => {
              if (!a.submittedAt && b.submittedAt) return -1;
              if (a.submittedAt && !b.submittedAt) return 1;
              return (b.projectCode ?? "").localeCompare(a.projectCode ?? "");
            })
            .map((s, i) => {
              const wasSubmitted = !!s.submittedAt;
              return (
                <Accordion.Item
                  key={i}
                  value={`item-${i}`}
                  className="data-[state=open]:border-yellow-400 data-[state=open]:border-2 rounded-md"
                >
                  <Accordion.Trigger
                    className={clsx(
                      "flex flex-col md:flex-row w-full border-y border-border bg-muted text-foreground dark:bg-neutral-800 dark:text-white",
                      "data-[state=open]:bg-gray-200 dark:data-[state=open]:bg-neutral-700"
                    )}
                  >
                    <div className="w-full flex flex-col md:grid md:grid-cols-[1fr_1fr_1.5fr_1fr_1fr_2rem] border-y border-border bg-muted text-foreground dark:bg-neutral-800 dark:text-white dark:border-neutral-700">

                      <div className="p-2 border border-border dark:border-neutral-700 md:block">
                        <span className="block md:hidden text-xs font-semibold uppercase text-muted-foreground">Project</span>
                        <span>{s.projectName}</span>
                      </div>
                      <div className="p-2 border border-border dark:border-neutral-700 md:block">
                        <span className="block md:hidden text-xs font-semibold uppercase text-muted-foreground">Project Code</span>
                        <span>{s.projectCode}</span>
                      </div>
                      <div className="p-2 border border-border dark:border-neutral-700 md:block">
                        <span className="block md:hidden text-xs font-semibold uppercase text-muted-foreground">Doc Number</span>
                        <span>{s.docNumber} REV. {s.docRevisionNumber}</span>
                      </div>
                      <div className="p-2 border border-border dark:border-neutral-700 md:block">
                        <span className="block md:hidden text-xs font-semibold uppercase text-muted-foreground">Equipment Tag</span>
                        <span>{s.equipmentTag}</span>
                      </div>
                      <div className="p-2 border border-border dark:border-neutral-700 md:block">
                        <span className="block md:hidden text-xs font-semibold uppercase text-muted-foreground">Submitted At</span>
                        <span>
                          {s.submittedAt
                            ? formatDistance(new Date(s.submittedAt), new Date(), { addSuffix: true })
                            : "Not Submitted"}
                        </span>
                      </div>
                      <div className="p-2 border border-border dark:border-neutral-700 text-center">
                        <Accordion.Icon />
                      </div>
                    </div>

                  </Accordion.Trigger>
                  <Accordion.Content className="flex w-full bg-muted text-foreground dark:bg-neutral-800 dark:text-white border-y border-border dark:border-neutral-700">
                    <div className="p-4 bg-muted dark:bg-neutral-800 rounded-md space-y-4 text-foreground">
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

                        {isAdmin && s.submissionId && (
                          <AlertDialog open={openDialogId === s.submissionId} onOpenChange={(open) => setOpenDialogId(open ? (s.submissionId ?? null) : null)}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                className="gap-2"
                                disabled={!s.submissionId}
                              >
                                <FaTrash />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white dark:bg-neutral-900 text-black dark:text-white opacity-100 shadow-xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete submission?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove this submission. You won’t be able to recover it.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 text-white hover:bg-red-700"
                                  onClick={async () => {
                                    setOpenDialogId(null);
                                    try {
                                      await handleDelete(s.submissionId!);
                                      toast({
                                        title: "Submission deleted successfully!",
                                        className: "bg-green-500 text-white",
                                      });
                                    } catch (err) {
                                      console.error("Failed to delete", err);
                                    }
                                  }}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                      </div>
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              );
            })
        ) : (
          <p className="text-center p-4 text-muted-foreground">No submissions found</p>
        )}
      </Accordion.Container>
    </div>
  );


}
