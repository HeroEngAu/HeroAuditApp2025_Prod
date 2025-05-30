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
  const { rows, columns, label, columnHeaders = [] } = element.extraAttributes;
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
          <img
            src={src}
            alt="Captured"
            className="max-w-[50px] max-h-[50px] object-contain border rounded hover:ring-2 hover:ring-blue-500 transition"
          />
        </button>

        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={() => setIsOpen(false)}
          >
            <img
              src={src}
              alt="Full"
              className="max-w-[100%] max-h-[100%] object-contain rounded shadow-lg"
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
              <tr key={row}>
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


  return (
    <div>
      <p className="font-medium mb-2">{label}</p>
      <Table className="max-w-[100%]">
        <TableHeader>
          <TableRow>
            {Array.from({ length: columns }, (_, col) => (
              <TableHead key={col} style={{ minWidth: "50px" }}>{columnHeaders[col] || `Col ${col + 1}`}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }, (_, row) => (
            <TableRow key={row}>
              {Array.from({ length: columns }, (_, col) => {
                const cellValue = editableData[row]?.[col] || "";
                const isCheckbox = cellValue.startsWith("[checkbox");
                const isSelect = cellValue.startsWith("[select");
                const isNumber = cellValue.startsWith("[number");
                const numberValue = isNumber ? cellValue.match(/^\[number:(.*?)\]$/)?.[1] ?? "" : "";
                const isDate = cellValue.startsWith("[date:");
                const dateValue = isDate ? cellValue.match(/^\[date:(.*?)\]$/)?.[1] ?? "" : "";
                let isSelectValue = "";
                let isSelectOptionsArray: string[] = [];

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
                  <TableCell key={col} className="justify-center items-center table-cell-wrap">
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
                        readOnly={readOnly ?? true}
                      />

                    ) : cellValue.startsWith("[image:") ? (
                      <ImageCell src={cellValue.replace("[image:", "").replace("]", "")} 
                      />
                    ) : !readOnly && editableCells[row][col] ? (
                      <Input
                        value={cellValue}
                        className={"table-cell-wrap"}
                        onChange={(e) => handleCellChange(row, col, e.target.value)}
                      />
                    ) : (
                      <div>{cellValue}</div>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}