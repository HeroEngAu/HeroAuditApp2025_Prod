"use client";

import { Button } from "./ui/button";
import { fetchAuthSession } from "aws-amplify/auth";
import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { deleteForm } from "../actions/form"; // ajuste o caminho conforme necessário
import { useRouter } from "next/navigation";
import { toast } from "./ui/use-toast";
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

interface DeleteFormBtnProps {
  id: string;
}

export default function DeleteFormBtn({ id }: DeleteFormBtnProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const [open, setOpen] = useState(false);

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

    const handleDelete = async () => {
    try {
      await deleteForm(id);
      toast({
        title: "Form deleted successfully!",
        className: "bg-green-500 text-white",
      });
      router.push("/");
    } catch (error) {
      console.error("Failed to delete form", error);
    } finally {
      setOpen(false);
    }
  };

  if (!isAdmin) return null;
return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
            <Button
      variant="destructive"
      className="w-[200px] mt-2 text-md gap-4"
    >
      Delete form <FaTrash />
    </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white dark:bg-neutral-900 text-black dark:text-white opacity-100 shadow-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this form?</AlertDialogTitle>
          <AlertDialogDescription>
            This action is permanent and cannot be undone.
            <br />
            Are you sure you want to delete it?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Yes, delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
