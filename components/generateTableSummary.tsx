type TableData = string[][]; // Your table: rows x cols

interface TableSummary {
  checkbox: { checked: number; unchecked: number; neutral: number };
  select: Record<string, number>;
  number: { sum: number; count: number; min?: number; max?: number };
  date: { earliest?: string; latest?: string; count: number };
}

export function generateTableSummary(data: TableData): TableSummary {
  const summary: TableSummary = {
    checkbox: { checked: 0, unchecked: 0, neutral: 0 },
    select: {},
    number: { sum: 0, count: 0 },
    date: { count: 0 },
  };

  for (const row of data) {
    for (const cell of row) {
      if (cell?.startsWith("[checkbox:")) {
        if (cell === "[checkbox:true]") summary.checkbox.checked++;
        else if (cell === "[checkbox:false]") summary.checkbox.unchecked++;
        else summary.checkbox.neutral++;
      }

      else if (cell?.startsWith("[select:")) {
        const match = cell.match(/^\[select:"(.*?)":/);
        const val = match?.[1];
        if (val) summary.select[val] = (summary.select[val] || 0) + 1;
      }

      else if (cell?.startsWith("[number:")) {
        const match = cell.match(/^\[number:(.*?)\]$/);
        const num = parseFloat(match?.[1] || "");
        if (!isNaN(num)) {
          summary.number.sum += num;
          summary.number.count += 1;
          summary.number.min = summary.number.min === undefined ? num : Math.min(summary.number.min, num);
          summary.number.max = summary.number.max === undefined ? num : Math.max(summary.number.max, num);
        }
      }

      else if (cell?.startsWith("[date:")) {
        const match = cell.match(/^\[date:(.*?)\]$/);
        const dateStr = match?.[1];
        if (dateStr) {
          summary.date.count += 1;
          if (!summary.date.earliest || dateStr < summary.date.earliest) summary.date.earliest = dateStr;
          if (!summary.date.latest || dateStr > summary.date.latest) summary.date.latest = dateStr;
        }
      }
    }
  }

  return summary;
}
