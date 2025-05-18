"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import useDesigner from "./hooks/useDesigner";
import { publishFormAction } from "../actions/form";
import { MdOutlinePublish } from "react-icons/md";
import { FaSpinner } from "react-icons/fa";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";

function PublishFormBtn({ id }: { id: string }) {
  const { elements } = useDesigner();
  const [loading, startTransition] = useTransition();
  const router = useRouter();

  function handlePublish() {
    const formData = new FormData();
    formData.append("id", id);
    formData.append("content", JSON.stringify(elements));
    formData.append("shareURL", `/submit/${id}`);
    startTransition(async () => {
      try {
        await publishFormAction(formData);
        toast({
          title: "Success",
          description: "Your form is now available to the public",
          className: "bg-green-500 text-white",
        });
        router.refresh();
      } catch (error) {
        toast({
          title: "Error",
          description: "Something went wrong",
        });
      }
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="gap-2 text-white bg-gradient-to-r from-indigo-400 to-cyan-400">
          <MdOutlinePublish className="h-4 w-4" />
          Publish
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white dark:bg-neutral-900 text-black dark:text-white opacity-100 shadow-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. After publishing you will not be able to edit this form.
            <br />
            <br />
            <span className="font-medium">
              By publishing this form you will make it available to the public and you will be able to collect
              submissions.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={loading} onClick={handlePublish}>
            Proceed {loading && <FaSpinner className="animate-spin ml-2" />}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default PublishFormBtn;
