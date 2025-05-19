// src/components/fields/TableField.tsx
"use client";
import {
  ElementsType,
  FormElement,
  FormElementInstance,
  SubmitFunction,
} from "../FormElements";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { MdTableChart } from "react-icons/md";
import useDesigner from "../hooks/useDesigner";
import * as XLSX from "xlsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Input } from "../ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Switch } from "../ui/switch";
import { Divider } from "@aws-amplify/ui-react";
import { Button } from "../ui/button";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const type: ElementsType = "TableField";

const extraAttributes = {
  rows: 2,
  columns: 2,
  label: "Table Field",
  required: false,
  data: [["", ""], ["", ""]],
  columnHeaders: ["Col 1", "Col 2"],
};

const propertiesSchema = z.object({
  rows: z.number().min(1).max(500),
  columns: z.number().min(1).max(10),
  label: z.string().min(1).max(50),
  required: z.boolean().optional(),
  data: z.array(z.array(z.string())).optional(),
  columnHeaders: z.array(z.string()).optional(),
});

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

export const TableFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    label: extraAttributes.label,
    extraAttributes,
    height: 0, // Initialize height with a default value
  }),
  designerBtnElement: {
    icon: MdTableChart,
    label: "Table Field",
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: (
    formElement: FormElementInstance,
    currentValue: string,
  ): boolean => {
    const element = formElement as CustomInstance;
    if (element.extraAttributes.required) {
      return currentValue === "true";
    }
    return true;
  },
};

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
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

function FormComponent({
  elementInstance,
  defaultValue,
  readOnly,
  updateElement,
  pdf,
}: {
  elementInstance: FormElementInstance;
  defaultValue?: any;
  isInvalid?: boolean;
  submitValue?: SubmitFunction;
  readOnly?: boolean;
  updateElement?: (id: string, element: FormElementInstance) => void;
  pdf?: boolean;
}) {
  const element = elementInstance as CustomInstance;
  const { rows, columns, label, columnHeaders = [] } = element.extraAttributes;
  const initialData: string[][] = defaultValue || element.extraAttributes.data || [];

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

  const handleCheckboxChange = (row: number, col: number, state: "checked" | "unchecked" | "neutral") => {
    const newData = [...editableData];
    if (!newData[row]) newData[row] = [];
    newData[row][col] =
      state === "checked" ? "[checkbox:true]" :
        state === "unchecked" ? "[checkbox:false]" :
          "[checkbox:neutral]";
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

  if (pdf) {
    return (
      <div>
        <p className="font-medium mb-2">{label}</p>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "14px" }}>
          <thead>
            <tr>
              {Array.from({ length: columns }, (_, col) => (
                <th key={col} style={{ border: "1px solid #ccc", padding: "4px", backgroundColor: "#f0f0f0" }}>
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
                    <td key={col} className="table-cell-wrap" style={{ border: "1px solid #ccc", padding: "4px" }}>
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

  function DatePickerInput(props: any, ref: any) {
    return <Input ref={ref} {...props} />;
  }

  const CustomInput = React.forwardRef(DatePickerInput);

  return (
    <div>
      <p className="font-medium mb-2">{label}</p>
      <Table  className="max-w-[100%]">
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
                          const nextState =
                            cellValue === "[checkbox:true]"
                              ? "unchecked"
                              : cellValue === "[checkbox:false]"
                                ? "neutral"
                                : "checked";
                          handleCheckboxChange(row, col, nextState as any);
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
                          fontFamily: 'Arial, sans-serif',
                          lineHeight: "1",
                          fontSize: "1rem",
                          padding: "0",
                          textAlign: 'center',
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


type propertiesFormSchemaType = z.infer<typeof propertiesSchema>;

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { updateElement } = useDesigner();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const form = useForm<propertiesFormSchemaType>({
    resolver: zodResolver(propertiesSchema),
    defaultValues: {
      ...element.extraAttributes,
    },
  });

  const [data, setData] = useState<string[][]>(element.extraAttributes.data);

  useEffect(() => {
    form.reset(element.extraAttributes);
    setData(element.extraAttributes.data);

    const existingHeaders = element.extraAttributes.columnHeaders;
    const numCols = element.extraAttributes.columns;

    if (existingHeaders && existingHeaders.length === numCols) {
      setColumnHeaders(existingHeaders);
    } else {
      const newHeaders = [];
      for (let i = 0; i < numCols; i++) {
        newHeaders.push(existingHeaders?.[i] || `Col ${i + 1}`);
      }
      setColumnHeaders(newHeaders);
    }
  }, [element.extraAttributes.columns, element.extraAttributes.columnHeaders]);

  const watchRows = form.watch("rows");
  const watchColumns = form.watch("columns");

  useEffect(() => {
    setData((prevData) => {
      const newData = Array.from({ length: watchRows }, (_, row) =>
        Array.from({ length: watchColumns }, (_, col) => prevData?.[row]?.[col] || "")
      );
      return newData;
    });
  }, [watchRows, watchColumns]);

  function handleCellChange(row: number, col: number, value: string) {
    const newData = [...data];
    newData[row][col] = value;
    setData(newData);
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        ...element.extraAttributes,
        data: newData,
      },
    });
  }

  const [columnHeaders, setColumnHeaders] = useState<string[]>(
    element.extraAttributes.columnHeaders || Array.from({ length: watchColumns }, (_, i) => `Col ${i + 1}`)
  );

  useEffect(() => {
    setColumnHeaders((prev) => {
      const newHeaders = Array.from({ length: watchColumns }, (_, i) => prev?.[i] || `Col ${i + 1}`);
      return newHeaders;
    });
  }, [watchColumns]);

  function handleHeaderChange(index: number, value: string) {
    const updatedHeaders = [...columnHeaders];
    updatedHeaders[index] = value;
    setColumnHeaders(updatedHeaders);

    updateElement(element.id, {
      ...element,
      extraAttributes: {
        ...element.extraAttributes,
        data,
        columnHeaders: updatedHeaders,
      },
    });
  }

  function applyChanges(values: propertiesFormSchemaType) {
    const { label, required } = values;
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        label,
        rows: values.rows,
        columns: values.columns,
        required,
        data,
        columnHeaders,
      },
    });
  }
  function handleImportClick() {
    fileInputRef.current?.click();
  }
  useEffect(() => {
    const input = fileInputRef.current;
    if (!input) return;

    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });

      if (parsedData.length === 0) return;

      const headers = parsedData[0].map((val) => (val ? String(val) : ""));
      const rows = parsedData.slice(1).map((row) =>
        Array.from({ length: headers.length }, (_, i) => row[i] ? String(row[i]) : "")
      );

      setColumnHeaders(headers);
      setData(rows);

      form.setValue("rows", rows.length);
      form.setValue("columns", headers.length);

      updateElement(element.id, {
        ...element,
        extraAttributes: {
          ...element.extraAttributes,
          rows: rows.length,
          columns: headers.length,
          data: rows,
          columnHeaders: headers,
        },
      });
    };
  }, [form, element, updateElement]);

  function deleteRow(rowIndex: number) {
    const newData = data.filter((_, i) => i !== rowIndex);
    form.setValue("rows", newData.length);
    setData(newData);
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        ...element.extraAttributes,
        rows: newData.length,
        data: newData,
      },
    });
  }

  function deleteColumn(colIndex: number) {
    const newData = data.map(row => row.filter((_, i) => i !== colIndex));
    const newHeaders = columnHeaders.filter((_, i) => i !== colIndex);
    form.setValue("columns", newHeaders.length);
    setData(newData);
    setColumnHeaders(newHeaders);
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        ...element.extraAttributes,
        columns: newHeaders.length,
        data: newData,
        columnHeaders: newHeaders,
      },
    });
  }

  return (
    <Form {...form}>
      <form onBlur={form.handleSubmit(applyChanges)}
        onSubmit={(e) => e.preventDefault()}
        className="space-y-3">
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormDescription>Displayed above the table.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rows"
          render={({ field }) => {
            const [localValue, setLocalValue] = useState(field.value);

            useEffect(() => {
              setLocalValue(field.value);
            }, [field.value]);

            return (
              <FormItem>
                <FormLabel>Rows</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={localValue}
                    onChange={(e) => setLocalValue(Number(e.target.value))}
                    onBlur={() => {
                      if (!isNaN(localValue)) field.onChange(localValue);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="columns"
          render={({ field }) => {
            const [localValue, setLocalValue] = useState(field.value);

            useEffect(() => {
              setLocalValue(field.value);
            }, [field.value]);

            return (
              <FormItem>
                <FormLabel>Columns</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={localValue}
                    onChange={(e) => setLocalValue(Number(e.target.value))}
                    onBlur={() => {
                      if (!isNaN(localValue)) field.onChange(localValue);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="required"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Required</FormLabel>
                <FormDescription>Marks the table field as required.</FormDescription>
              </div>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Divider orientation="horizontal" size="small" color="gray" marginTop="1rem" marginBottom="1rem" />
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <FormLabel>Table Content</FormLabel>
            <FormDescription>
              Use <code>[checkbox]</code> as the cell value to display a checkbox. <br />
              Use <code>[select:"Option1":["Option1","Option2"]]</code> to display a dropdown with options.<br />
              Use <code>[number:]</code> to display a number input field.<br />
              Use <code>[date:]</code> to display a date picker.<br />
              For a regular editable text field, leave the cell blank.
            </FormDescription>
          </div>


          <Button type="button" onClick={handleImportClick}>
            Import Excel
          </Button>
          <input
            type="file"
            accept=".xlsx, .xls"
            style={{ display: "none" }}
            ref={fileInputRef}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {[...Array(watchColumns)].map((_, col) => (
                <TableHead key={col}>
                  <Button variant="ghost" size="icon" onClick={() => deleteColumn(col)}>
                    ✕
                  </Button>
                  <Input
                    className="w-full"
                    value={columnHeaders[col] || ""}
                    onChange={(e) => handleHeaderChange(col, e.target.value)}
                  />

                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(watchRows)].map((_, row) => (
              <TableRow key={row}>
                {[...Array(watchColumns)].map((_, col) => (
                  <TableCell key={col}>
                    <Input
                      value={data?.[row]?.[col] || ""}
                      onChange={(e) => handleCellChange(row, col, e.target.value)}
                    />
                  </TableCell>
                ))}
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => deleteRow(row)}>
                    ✕
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </form>
    </Form>
  );
}
