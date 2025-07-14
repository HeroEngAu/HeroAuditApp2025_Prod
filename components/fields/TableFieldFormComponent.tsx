// src/components/fields/TableField.tsx
"use client";
import {
  FormElementInstance,
  SubmitFunction,
} from "../FormElements";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Input } from "../ui/input";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { CustomInstance } from "./TableField";
import { CameraCell } from "../CameraCell"
import { Textarea } from "../ui/textarea";
import Image from "next/image"; // ✅ Import next/image

export function FormComponent({
  elementInstance,
  defaultValue,
  readOnly,
  updateElement,
  pdf,
}: {
  elementInstance: FormElementInstance;
  defaultValue?: unknown;
  isInvalid?: boolean;
  submitValue?: SubmitFunction;
  readOnly?: boolean;
  updateElement?: (id: string, element: FormElementInstance) => void;
  pdf?: boolean;
}) {
  const element = elementInstance as CustomInstance;
  const { rows, columns, label, columnHeaders = [], headerRowIndexes = [] as number[] } = element.extraAttributes; //test
  const initialData: string[][] = Array.isArray(defaultValue)
    ? (defaultValue as string[][])
    : Array.isArray(element.extraAttributes.data)
      ? element.extraAttributes.data
      : [];
  const [editableData, setEditableData] = useState<string[][]>(initialData);

  const [editableCells] = useState(() =>
    Array.from({ length: rows }, (_, row) =>
      Array.from({ length: columns }, (_, col) => !initialData[row]?.[col])
    )
  );

  const updateData = (newData: string[][]) => {
    setEditableData(newData);
    if (!readOnly && updateElement) {
      updateElement(element.id, {
        ...element,
        extraAttributes: {
          ...element.extraAttributes,
          data: newData,
        },
      });
    }
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    const newData = [...editableData];
    if (!newData[row]) newData[row] = [];
    newData[row][col] = value;
    updateData(newData);
  };

  type CheckboxState = "checked" | "unchecked" | "neutral";

  const handleCheckboxChange = (row: number, col: number, state: CheckboxState) => {
    const newData = [...editableData];
    if (!newData[row]) newData[row] = [];

    const checkboxValue =
      state === "checked"
        ? "[checkbox:true]"
        : state === "unchecked"
          ? "[checkbox:false]"
          : "[checkbox:neutral]";

    newData[row][col] = checkboxValue;
    updateData(newData);
  };

  const parseCell = (cellValue: string): string => {
    if (cellValue === "[PASS]") return "PASS";
    if (cellValue === "[FAIL]") return "FAIL";

    if (cellValue.startsWith("[checkbox")) {
      return cellValue === "[checkbox:true]" ? "✔" :
        cellValue === "[checkbox:false]" ? "✖" : "-";
    }
    if (cellValue.startsWith("[select")) {
      const match = cellValue.match(/^\[select:"(.*?)":/);
      return match?.[1] || "-";
    }
    if (cellValue.startsWith("[number:")) {
      return cellValue.match(/^\[number:(.*?)\]$/)?.[1] || "-";
    }
    if (cellValue.startsWith("[date:")) {
      const isoDate = cellValue.match(/^\[date:(.*?)\]$/)?.[1];
      if (!isoDate) return "-";

      const dateObj = new Date(isoDate);
      if (isNaN(dateObj.getTime())) return "-";

      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const year = dateObj.getFullYear();

      return `${day}.${month}.${year}`;
    }
    return cellValue || "-";
  };

  function ImageCell({ src }: { src: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <button onClick={() => setIsOpen(true)}>
          <Image
            src={src}
            alt="Captured"
            width={50}
            height={50}
            unoptimized
            className="object-contain border rounded hover:ring-2 hover:ring-blue-500 transition"
          />
        </button>

        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={() => setIsOpen(false)}
          >
           <Image
            src={src}
            alt="Captured"
            width={50}
            height={50}
            unoptimized
            className="object-contain border rounded hover:ring-2 hover:ring-blue-500 transition"
          />
          </div>
        )}
      </>
    );
  }

  const minWidth = 1;
  const maxWidth = 200;

  if (pdf) {
    return (
      <div>
        <p className="font-medium mb-2">{label}</p>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "14px" }}>
          <thead>
            <tr>
              {Array.from({ length: columns }, (_, col) => (
                <th
                  key={col}
                  style={{
                    border: "1px solid #ccc",
                    padding: "4px",
                    backgroundColor: "#f0f0f0",
                    minWidth: `${minWidth}px`,
                    maxWidth: `${maxWidth}px`,
                    wordBreak: "break-word",
                  }}
                >
                  {columnHeaders[col] || `Col ${col + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, row) => (
              <tr
                key={row}
                style={{
                  backgroundColor: headerRowIndexes.includes(row) ? "#f0f0f0" : "transparent",
                  fontWeight: headerRowIndexes.includes(row) ? "bold" : "normal",
                }}
              >
                {Array.from({ length: columns }, (_, col) => {
                  const cellValue = editableData[row]?.[col] || "";
                  return (
                    <td
                      key={col}
                      className="table-cell-wrap"
                      style={{
                        border: "1px solid #ccc",
                        padding: "4px",
                        minWidth: `${minWidth}px`,
                        maxWidth: `${maxWidth}px`,
                        wordBreak: "break-word",
                      }}
                    >
                      {parseCell(cellValue)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function parseLocalDate(dateStr: string) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
  }

  function DatePickerInput(
    props: React.InputHTMLAttributes<HTMLInputElement>,
    ref: React.Ref<HTMLInputElement>
  ) {
    return <Input ref={ref} {...props} />;
  }

  const CustomInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(DatePickerInput);
  // ← fora do return
  const occupiedMap: Record<number, Record<number, boolean>> = {};


  return (
    <div>
      <p className="font-medium mb-2">{label}</p>
      <Table className="max-w-[100%]">
        <TableHeader>
          <TableRow>
            {(() => {
              const occupiedCols: Set<number> = new Set();
              return Array.from({ length: columns }, (_, col) => {
                if (occupiedCols.has(col)) return null;

                const headerValue = columnHeaders[col] || `Col ${col + 1}`;
                const match = headerValue.replace(/\r\n/g, "\n").match(/^\[merge:right:(\d+)\]([\s\S]*)/);

                const span = match ? parseInt(match[1], 10) : 1;
                const text = match ? match[2].trim() : headerValue;

                for (let i = 1; i < span; i++) {
                  occupiedCols.add(col + i);
                }

                return (
                  <TableHead
                    key={col}
                    colSpan={span}
                    className="bg-gray-100 break-words text-left align-top"
                    style={{
                      minWidth: "50px",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      lineHeight: "1.2",
                      fontWeight: "600",
                    }}
                  >
                    {text}
                  </TableHead>
                );
              });
            })()}
          </TableRow>
        </TableHeader>

        <TableBody>
          {Array.from({ length: rows }, (_, row) => (
            <TableRow
              key={row}
              className={`whitespace-pre-wrap break-words ${headerRowIndexes.includes(row) ? "whitespace-pre-wrap break-words bg-gray-100 text-muted-foreground font-medium" : " whitespace-pre-wrap break-words"
                }`}
            >
              {Array.from({ length: columns }, (_, col) => {
                const cellValue = editableData[row]?.[col] || "";
                let isSelectValue = "";
                let isSelectOptionsArray: string[] = [];
                if (occupiedMap[row]?.[col]) {
                  return null;
                }

                const mergeMatch = cellValue.replace(/\r\n/g, "\n").match(/^\[merge:(right|down):(\d+)\]([\s\S]*)/);
                const direction = mergeMatch?.[1];
                const span = mergeMatch ? parseInt(mergeMatch[2]) : 1;
                const content = mergeMatch ? mergeMatch[3] : cellValue;
                const rowSpan = direction === "down" ? span : 1;
                const colSpan = direction === "right" ? span : 1;
                if (mergeMatch) {
                  for (let r = row; r < row + rowSpan; r++) {
                    for (let c = col; c < col + colSpan; c++) {
                      if (r === row && c === col) continue;
                      if (!occupiedMap[r]) occupiedMap[r] = {};
                      occupiedMap[r][c] = true;
                    }
                  }
                }
                const rawContent = content.trim();
                const isCheckbox = rawContent.startsWith("[checkbox");
                const isSelect = rawContent.startsWith("[select");
                const isNumber = rawContent.startsWith("[number");
                const numberValue = isNumber ? rawContent.match(/^\[number:(.*?)\]$/)?.[1] ?? "" : "";
                const isDate = rawContent.startsWith("[date:");
                const dateValue = isDate ? rawContent.match(/^\[date:(.*?)\]$/)?.[1] ?? "" : "";
                const isPassFailOrSummary = ["[PASS]", "[FAIL]", "[SUMMARY]"].includes(rawContent);
                const isOnlyMergeTag = mergeMatch && content.trim() === "";

                if (isSelect) {
                  try {
                    const match = cellValue.match(/^\[select:"(.*?)":(\[.*\])\]$/);
                    if (match) {
                      isSelectValue = match[1];
                      isSelectOptionsArray = JSON.parse(match[2]);
                    } else {
                      console.warn("Select format didn't match:", cellValue);
                    }
                  } catch (error) {
                    console.warn("Failed to parse select options from cellValue:", cellValue, error);
                    isSelectValue = "";
                    isSelectOptionsArray = [];
                  }
                }
                return (
                  <TableCell key={col} rowSpan={rowSpan} colSpan={colSpan} className="justify-center items-center table-cell-wrap break-words whitespace-normal">
                    {isCheckbox ? (
                      <div
                        onClick={() => {
                          if (readOnly) return;

                          const getNextCheckboxState = (currentValue: string): CheckboxState => {
                            switch (currentValue) {
                              case "[checkbox:true]":
                                return "unchecked";
                              case "[checkbox:false]":
                                return "neutral";
                              default:
                                return "checked";
                            }
                          };

                          const nextState = getNextCheckboxState(cellValue);
                          handleCheckboxChange(row, col, nextState);
                        }}
                        className={`flex justify-center items-center h-7 w-7 border rounded-sm
                text-sm leading-none select-none
                ${readOnly ? "cursor-default" : "cursor-pointer"}
                ${cellValue === "[checkbox:true]"
                            ? "bg-green-500 text-white"
                            : cellValue === "[checkbox:false]"
                              ? "bg-gray-300 text-black"
                              : "bg-white text-gray-400 border-gray-500"
                          }`}
                        style={{
                          fontFamily: "Arial, sans-serif",
                          lineHeight: "1",
                          fontSize: "1rem",
                          padding: "0",
                          textAlign: "center",
                        }}
                      >
                        {cellValue === "[checkbox:true]"
                          ? "✔"
                          : cellValue === "[checkbox:false]"
                            ? "✖"
                            : ""}
                      </div>
                    ) : isSelect ? (
                      <Select
                        value={isSelectValue}
                        onValueChange={(val) => {
                          const newValue = `[select:"${val}":${JSON.stringify(isSelectOptionsArray)}]`;
                          handleCellChange(row, col, newValue);
                        }}
                        disabled={readOnly}
                      >
                        <SelectTrigger
                          className="border rounded px-2 py-1"
                          style={{
                            minWidth: "100px",
                            maxWidth: "300px",
                            width: "100%",
                          }}
                        >
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          {isSelectOptionsArray.map((option: string, index: number) => (
                            <SelectItem key={index} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : isNumber ? (
                      readOnly ? (
                        <div
                          className="px-2 py-1 text-sm"
                          style={{
                            minWidth: "100px",
                            maxWidth: "200px",
                            wordWrap: "break-word",
                            overflowWrap: "break-word",
                            whiteSpace: "normal",
                          }}
                        >
                          {numberValue || "-"}
                        </div>
                      ) : (
                        <Input
                          type="number"
                          className="border rounded px-2 py-1 w-full "
                          value={numberValue}
                          onChange={(e) =>
                            handleCellChange(row, col, `[number:${e.target.value}]`)
                          }
                          disabled={readOnly}
                        />
                      )
                    ) : isDate ? (
                      <ReactDatePicker
                        selected={dateValue ? parseLocalDate(dateValue) : null}
                        onChange={(date: Date | null) => {
                          if (date) {
                            const safeDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12));
                            handleCellChange(row, col, `[date:${safeDate.toISOString().split("T")[0]}]`);
                          }
                        }}
                        disabled={readOnly}
                        dateFormat="dd.MM.yyyy"
                        customInput={<CustomInput />}
                      />
                    ) : cellValue === "[camera]" ? (
                      <CameraCell
                        row={row}
                        col={col}
                        handleCellChange={handleCellChange}
                        readOnly={readOnly ?? false}
                      />

                    ) : cellValue.startsWith("[image:") ? (
                      <ImageCell src={cellValue.replace("[image:", "").replace("]", "")}
                      />
                    ) : isPassFailOrSummary ? (
                      <div className="flex justify-center items-center">
                        <button
                          onClick={() => {
                            if (readOnly) return;

                            let newValue: string;
                            if (cellValue === "[SUMMARY]") {
                              newValue = "[PASS]";
                            } else if (cellValue === "[PASS]") {
                              newValue = "[FAIL]";
                            } else {
                              newValue = "[SUMMARY]";
                            }

                            handleCellChange(row, col, newValue);
                          }}
                          className={`px-2 py-1 rounded text-white text-sm font-semibold
                            ${cellValue === "[PASS]"
                              ? "bg-green-600"
                              : cellValue === "[FAIL]"
                                ? "bg-red-600"
                                : "bg-gray-500"}`}
                        >
                          {cellValue === "[PASS]"
                            ? "PASS"
                            : cellValue === "[FAIL]"
                              ? "FAIL"
                              : "SUMMARY"}
                        </button>
                      </div>

                    ) : (!readOnly && (editableCells[row][col] || isOnlyMergeTag)) ? (
                      <Textarea
                        className="whitespace-pre-wrap break-words w-full min-h-[60px] p-2 border rounded resize-y"
                        value={content}
                        onChange={(e) => handleCellChange(row, col, e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div
                        className="break-words"
                        style={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          lineHeight: "1.2",
                          fontWeight: headerRowIndexes.includes(row) ? "600" : undefined,
                          textAlign: headerRowIndexes.includes(row) ? "center" : "left"
                        }}
                      >
                        {headerRowIndexes.includes(row)
                          ? content.split("\n").map((line, i) => <div key={i}>{line}</div>)
                          : content}
                      </div>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div >
  );
}