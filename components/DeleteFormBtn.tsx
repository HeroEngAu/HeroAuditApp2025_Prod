"use client";

import { Button } from "./ui/button";
import { fetchAuthSession } from "aws-amplify/auth";
import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { deleteForm } from "../actions/form"; // ajuste o caminho conforme necessário
import { useRouter } from "next/navigation";

interface DeleteFormBtnProps {
  id: string;
}

export default function DeleteFormBtn({ id }: DeleteFormBtnProps) {
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

  const handleDelete = async () => {
    const confirmDelete = confirm("Are you sure you want to delete this form?");
    if (!confirmDelete) return;

    try {
      await deleteForm(id);
      router.push("/");
    } catch (error) {
      console.error("Failed to delete form", error);
    }
  };

  if (!isAdmin) return null;

  return (
    <Button
      variant="destructive"
      className="w-[200px] mt-2 text-md gap-4"
      onClick={handleDelete}
    >
      Delete form <FaTrash />
    </Button>
  );
}
