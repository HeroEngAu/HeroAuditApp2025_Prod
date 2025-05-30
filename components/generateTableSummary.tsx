type TableData = string[][]; // Your table: rows x cols

interface TableSummary {
  checkbox: { checked: number; unchecked: number; neutral: number };
}

export function generateTableSummary(data: TableData): TableSummary {
  const summary: TableSummary = {
    checkbox: { checked: 0, unchecked: 0, neutral: 0 },
  };

  for (const row of data) {
    for (const cell of row) {
      if (cell?.startsWith("[checkbox:")) {
        if (cell === "[checkbox:true]") summary.checkbox.checked++;
        else if (cell === "[checkbox:false]") summary.checkbox.unchecked++;
        else summary.checkbox.neutral++;
      }
    }
  }

  return summary;
}
