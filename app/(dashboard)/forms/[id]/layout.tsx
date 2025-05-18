"use client";
import { ReactNode } from "react";
import { Amplify } from "aws-amplify"
import outputs from "../../../../amplify_outputs.json"

Amplify.configure(outputs)

function layout({ children }: { children: ReactNode }) {
  return <div className="flex w-full flex-col flex-grow mx-auto">{children}</div>;
}

export default layout;
