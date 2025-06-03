// src/components/fields/TableField.tsx
"use client";
import {
  FormElementInstance,
} from "../FormElements";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { ControllerRenderProps } from "react-hook-form";
import useDesigner from "../hooks/useDesigner";
import { read, utils } from "xlsx";
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
import { Divider } from "@aws-amplify/ui-react";
import { Button } from "../ui/button";
import "react-datepicker/dist/react-datepicker.css";
import React from "react";
import { CustomInstance, propertiesSchema } from "./TableField";

type propertiesFormSchemaType = z.infer<typeof propertiesSchema>;

export function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
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
  }, [element.extraAttributes, form]);

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
    const { label } = values;
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        label,
        rows: values.rows,
        columns: values.columns,
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
      const workbook = read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const parsedData = utils.sheet_to_json<string[]>(worksheet, { header: 1 });

      if (parsedData.length === 0) return;

      const headers = parsedData[0].map((val) => (val ? String(val) : ""));
      const rows = parsedData.slice(1).map((row) =>
        Array.from({ length: headers.length }, (_, i) =>
          row[i] ? String(row[i]) : ""
        )
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
  }, [form, element, element.extraAttributes, updateElement]);


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

  type TableFieldFormData = {
    label: string;
    rows: number;
    columns: number;
  };

  type NumberInputFieldProps = {
    field: ControllerRenderProps<TableFieldFormData, "rows" | "columns">;
    label: string;
  };

  function NumberInputField({ field, label }: NumberInputFieldProps) {
    const [localValue, setLocalValue] = React.useState(field.value);

    React.useEffect(() => {
      setLocalValue(field.value);
    }, [field.value]);

    return (
      <FormItem>
        <FormLabel>{label}</FormLabel>
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
              <FormControl>
                <Input {...field} placeholder="Enter a label (optional)" />
              </FormControl>
              <FormDescription>Displayed above the table.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rows"
          render={({ field }) => <NumberInputField field={field} label="Rows" />}
        />
        <FormField
          control={form.control}
          name="columns"
          render={({ field }) => <NumberInputField field={field} label="Columns" />}
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
              Use <code>[camera]</code> to open the camera and make register of the process performed.<br />
              Use <code>[PASS] or [FAIL]</code> to display buttons to select the overall result of the table.
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