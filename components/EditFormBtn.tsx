"use client";

import { Button } from "./ui/button";
import { fetchAuthSession } from "aws-amplify/auth";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";

interface EditFormBtnProps {
  id: string;
}

export default function EditFormBtn({ id }: EditFormBtnProps) {
  const [isAdmin, setIsAdmin] = useState(false);

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

  if (!isAdmin) return null;

  return (
    <Button asChild variant="outline" className="w-[200px] mt-2 text-md gap-4">
      <Link href={`/builder/${id}`}>
        Edit form <FaEdit />
      </Link>
    </Button>
  );
}
