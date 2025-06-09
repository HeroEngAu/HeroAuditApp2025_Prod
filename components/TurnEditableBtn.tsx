"use client";

import { Button } from "./ui/button";
import { fetchAuthSession } from "aws-amplify/auth";
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { TurnEditable } from "../actions/form"; // ajuste o caminho se necessário
import { toast } from "./ui/use-toast";

interface TurnFormEditableBtnProps {
    id: string;
}

export default function EditFormBtn({ id }: TurnFormEditableBtnProps) {
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

    const handleEditableClick = async () => {
        try {
            await TurnEditable(id);
            toast({
                title: "Form is editable now!",
                className: "bg-green-500 text-white",
            });
        } catch (err) {
            console.error("Error making form editable:", err);
            toast({
                title: "Failed to turn form editable",
                variant: "destructive",
            });
        }
    };

    if (!isAdmin) return null;

    return (
        <Button
            variant="secondary"
            className="w-[200px] mt-2 text-sm gap-4 bg-yellow-400 hover:bg-yellow-500 text-black"
            onClick={handleEditableClick}
        >
            <>Turn form Editable <FaEdit /></>
        </Button>
    );
}
