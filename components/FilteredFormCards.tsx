'use client'

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import Badge from "../components/ui/badge";
import { formatDistance } from "date-fns/formatDistance";
import { LuView } from "react-icons/lu";
import { FaWpforms } from "react-icons/fa";
import Link from "next/link";
import { BiRightArrowAlt } from "react-icons/bi";
import { FaEdit } from "react-icons/fa";
import { Button } from "../components/ui/button";
import { GetFormsInformation } from "../actions/form";
import { fetchAuthSession } from "aws-amplify/auth";
import Loading from "../app/(dashboard)/forms/[id]/loading";
import useUserAttributes from "./userAttributes";
import CreateFormDialog from "./CreateFormDialog";

type CustomForm = {
    id: string;
    name: string | null;
    description?: string | null;
    published: boolean | null;
    content?: string | null;
    clientName: string;
    projectName: string;
    projectID: string;
    createdAt?: string | null;
    visits?: number | null;
    submissions?: number | null;
};


function FormCard({ form }: { form: CustomForm }) {
    const [userGroup, setUserGroup] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserGroup = async () => {
            try {
                const session = await fetchAuthSession();
                const rawGroups = session.tokens?.accessToken.payload["cognito:groups"];
                if (Array.isArray(rawGroups) && typeof rawGroups[0] === "string") {
                    setUserGroup(rawGroups[0]);
                } else {
                    setUserGroup(null);
                }
            } catch (error) {
                console.error("Error fetching user group:", error);
                setUserGroup(null);
            }
        };
        fetchUserGroup();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-between">
                    <span className="truncate font-bold">{form.name}</span>
                    {form.published && <Badge>Published</Badge>}
                    {!form.published && <Badge variant={"destructive"}>Draft</Badge>}
                </CardTitle>
                <CardDescription className="flex items-center justify-between text-muted-foreground text-sm">
                    {form.createdAt ? (
                        formatDistance(new Date(form.createdAt), new Date(), { addSuffix: true })
                    ) : (
                        "No date"
                    )}
                    {form.published && (
                        <span className="flex items-center gap-2">
                            <LuView className="text-muted-foreground" />
                            <span>{form.visits ?? "[]".toLocaleString()}</span>
                            <FaWpforms className="text-muted-foreground" />
                            <span>{form.submissions ?? "[]".toLocaleString()}</span>
                        </span>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[20px] truncate text-sm text-muted-foreground">
                <p>Client: {form.clientName}</p>
            </CardContent>
            <CardContent className="h-[20px] truncate text-sm text-muted-foreground text-wrap ">
                <p>Project: {form.projectName} </p>
            </CardContent>
            {<CardContent className="h-[20px] truncate text-sm text-muted-foreground text-wrap">
                <p>Project ID: {form.projectID}</p>
            </CardContent>}
            <CardFooter>
                {form.published && (

                    <Button asChild className="w-full mt-2 text-md gap-4">
                        <Link href={`/forms/${form.id}`}>
                            View submissions <BiRightArrowAlt />
                        </Link>
                    </Button>

                )}
                {!form.published && userGroup !== "viewer" && (

                    <Button asChild variant={"secondary"} className="w-full mt-2 text-md gap-4">
                        <Link href={`/builder/${form.id}`}>
                            Edit form <FaEdit />
                        </Link>
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}

type Form = {
    id: string;
    name: string | null;
    description?: string | null;
    published?: boolean | null;
    content?: string | null;
    createdAt?: string | null;
    visits?: number | null;
    submissions?: number | null;
};

type FormInfoEntry = {
    clientName: string;
    projectName: string;
    projectID: string;
    forms: Form[];
};

export default function FilteredFormCards({ searchTerm }: { searchTerm: string }) {
    const [formsInfo, setFormsInfo] = useState<FormInfoEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const { attributes } = useUserAttributes();
    const userId = attributes?.sub;
    const [userGroup, setUserGroup] = useState<string | null>(null);
    const [groupChecked, setGroupChecked] = useState(false);

    useEffect(() => {
        async function fetchUserGroup() {
            try {
                const session = await fetchAuthSession();
                const rawGroups = session.tokens?.accessToken.payload["cognito:groups"];
                const groups: string[] = Array.isArray(rawGroups)
                    ? rawGroups.filter((g): g is string => typeof g === "string")
                    : typeof rawGroups === "string"
                        ? [rawGroups]
                        : [];

                setUserGroup(groups[0] ?? null);
            } catch (error) {
                console.error("Failed to fetch user group", error);
            } finally {
                setGroupChecked(true);
            }
        }

        fetchUserGroup();
    }, []);

    const company = attributes?.["custom:Company"];

    useEffect(() => {
        if (!userId || !groupChecked || !company || !userGroup) return;

        async function fetchData() {
            try {
                if (typeof userId === "string") {
                    const data = await GetFormsInformation(userId, userGroup!, company!);
                    setFormsInfo(data);
                }
            } catch (err) {
                console.error("Error loading forms", err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [userId, userGroup, groupChecked, company]);



    if (!userId || !groupChecked || loading) {
        return (
            <Loading />
        );
    }

    const filteredForms = formsInfo.flatMap(entry =>
        entry.forms
            .filter((form: { name: string | null; clientName?: string }) =>
                (form.name && form.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                entry.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entry.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entry.projectID?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((form: Form): CustomForm => ({
                ...form,
                published: form.published ?? null, // substitui undefined por null
                clientName: entry.clientName,
                projectName: entry.projectName,
                projectID: entry.projectID,
            }))
    );
    return (
        <>
            {userGroup !== "viewer" && (
                <CreateFormDialog />
            )}
            {filteredForms.length === 0 && <p>No forms found.</p>}
            {filteredForms.map((form) => (
                <FormCard key={form.id} form={form} />
            ))}
        </>
    );
}

