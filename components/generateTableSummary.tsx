import { useEffect, useState } from "react";
import { GetFormsContent } from "../actions/form";

type TableData = string[][];

interface ExtraAttributes {
  data?: string[][];
}

interface FormContentItem {
  type: string;
  extraAttributes?: ExtraAttributes;
}

interface ParsedContent {
  formContent: FormContentItem[];
}

interface TableSummary {
  checkbox: { checked: number; unchecked: number; neutral: number };
}

function generateTableSummary(tables: TableData[]): TableSummary {
  const summary: TableSummary = {
    checkbox: { checked: 0, unchecked: 0, neutral: 0 },
  };

  for (const table of tables) {
    for (const row of table) {
      for (const cell of row) {
        if (cell?.startsWith("[checkbox")) {
          if (cell === "[checkbox:true]") summary.checkbox.checked++;
          else if (cell === "[checkbox:false]") summary.checkbox.unchecked++;
          else summary.checkbox.neutral++;
        }
      }
    }
  }

  return summary;
}

export function SubmissionSummary({ submissionId }: { submissionId: string }) {
  const [tablesData, setTablesData] = useState<TableData[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (submissionId && submissionId.trim() !== "") {
          const contentRaw = await GetFormsContent(submissionId);
          let content: ParsedContent;

          if (typeof contentRaw === "string") {
            try {
              content = JSON.parse(contentRaw) as ParsedContent;
            } catch {
              setError("Failed to parse content");
              return;
            }
          } else {
            content = contentRaw as unknown as ParsedContent;
          }

          if (Array.isArray(content.formContent)) {
            const tableDataArrays: TableData[] = content.formContent
              .filter((item) => item.type === "TableField")
              .map((item) => item.extraAttributes?.data || []);
            setTablesData(tableDataArrays);
          } else {
            setError("Invalid content format");
          }
        }
      } catch (err) {
        console.error("Error fetching content:", err);
        setError("Failed to fetch content");
      }
    };

    fetchData();
  }, [submissionId]);

  if (error) {
    return <p className="text-red-500">⚠ {error}</p>;
  }

  if (!tablesData) {
    return <p className="text-muted-foreground text-sm">Loading summary...</p>;
  }

  const summary = generateTableSummary(tablesData);

  return (
    <div className="text-sm space-y-2 bg-muted p-4 rounded border">
      <p className="font-semibold">Checkbox Summary:</p>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded text-white bg-green-500">✔</span>
          <span>Checked: {summary.checkbox.checked}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded text-black bg-gray-300">✖</span>
          <span>Unchecked: {summary.checkbox.unchecked}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded border border-gray-500 text-gray-400 bg-white">–</span>
          <span>Neutral/Invalid: {summary.checkbox.neutral}</span>
        </div>
      </div>
    </div>
  );
}
