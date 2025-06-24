"use client";

import { Button } from "./ui/button";
import { fetchAuthSession } from "aws-amplify/auth";
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { TurnEditable } from "../actions/form";
import { toast } from "./ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDescription,
} from "./ui/alert-dialog";

interface TurnFormEditableBtnProps {
  id: string;
}

export default function EditFormBtn({ id }: TurnFormEditableBtnProps) {
  const [isAdmin, setIsAdmin] = useState(false);
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

  const handleEditableClick = async () => {
    try {
      await TurnEditable(id);
      toast({
        title: "Form is now editable!",
        className: "bg-green-500 text-white",
      });
    } catch (err) {
      console.error("Error making form editable:", err);
      toast({
        title: "Failed to turn form editable",
        variant: "destructive",
      });
    } finally {
      setOpen(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="secondary"
          className="w-[140px] md:w-[200px] text-sm md:text-md font-medium mt-2 gap-4 bg-yellow-400 hover:bg-yellow-500 text-black "
        >
          <><FaEdit className="w-5 h-5 md:w-5 md:h-5" />Turn form Editable </>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white dark:bg-neutral-900 text-black dark:text-white opacity-100 shadow-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Make this form editable?</AlertDialogTitle>
          <AlertDialogDescription>
            This will unlock the form for editing. Are you sure?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleEditableClick}>Yes, unlock</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
