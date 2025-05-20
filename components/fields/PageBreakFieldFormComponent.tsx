"use client";

import clsx from "clsx";

const pageBreakClass = clsx(
  "w-full border-t border-dashed border-gray-400 my-6",
  "print:break-before-page"
);

export function FormComponent() {
  return <div className={pageBreakClass} />;
}