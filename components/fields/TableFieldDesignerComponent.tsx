// src/components/fields/TableField.tsx
"use client";
import {
  FormElementInstance,
} from "../FormElements";
import { useEffect, useRef} from "react";
import useDesigner from "../hooks/useDesigner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { CustomInstance } from "./TableField";

export function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { rows, columns, label, data = [], columnHeaders = [] } = element.extraAttributes;
  const { updateElement } = useDesigner();

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef.current) {
      const newHeight = containerRef.current.offsetHeight;
      if (element.height !== newHeight) {
        updateElement(element.id, {
          ...element,
          height: newHeight,
        });
      }
    }
  }, [rows, columns, data]);

  return (
    <div ref={containerRef}>
      <p className="font-medium mb-2">{label}</p>
      <Table>
        <TableHeader>
          <TableRow>
            {[...Array(columns)].map((_, col) => (
              <TableHead key={col}
                style={{
                  maxWidth: "auto",
                  minWidth: "50px",
                  width: "auto",
                  whiteSpace: "normal",
                  wordWrap: "break-word",
                }}>
                {columnHeaders[col] || `Col ${col + 1}`}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(rows)].map((_, row) => (
            <TableRow key={row}>
              {[...Array(columns)].map((_, col) => (
                <TableCell key={col}
                  style={{
                    maxWidth: "auto",
                    minWidth: "50px",
                    width: "auto",
                    whiteSpace: "normal",
                    wordWrap: "break-word",
                    verticalAlign: "top",
                  }}>
                  <div
                    style={{
                      whiteSpace: "normal",
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    {data?.[row]?.[col] || " "}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}