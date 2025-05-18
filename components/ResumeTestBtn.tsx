"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ResumeTest } from "../actions/form";
import { Button } from "./ui/button";
import { MdEdit } from "react-icons/md";

type Props = {
  formTag2Id: string;
};

export default function ResumeTestBtn({ formTag2Id }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setLoading(true);

    try {
      const result = await ResumeTest(formTag2Id);
      if (!result) throw new Error("Fail to load test information.");

      const {formId } = result;

      router.push(`/submit/${formId}?resume=true&formtag2Id=${formTag2Id}`);



    } catch (error) {
      console.error("Error to resume test:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="default" className="gap-2" onClick={handleClick} disabled={loading}>
        <MdEdit className="h-6 w-6" />
      {loading ? "Loading..." : "Resume Test"}
    </Button>
  );
}
