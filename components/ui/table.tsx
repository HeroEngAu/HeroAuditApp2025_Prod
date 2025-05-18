import * as React from "react";
import { cn } from "../../lib/utils";

// Factory to create table components with forwardRef
const createTableComponent = <T extends HTMLElement>(
  tag: keyof JSX.IntrinsicElements,
  baseClass: string,
) => {
  return React.forwardRef<T, React.HTMLAttributes<T>>(({ className, ...props }, ref) =>
    React.createElement(tag, {
      ref,
      className: cn(baseClass, className),
      ...props,
    }),
  );
};

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-auto">
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  ),
);
Table.displayName = "Table";

const TableHeader = createTableComponent<HTMLTableSectionElement>(
  "thead",
  "[&_tr]:border-b"
);
TableHeader.displayName = "TableHeader";

const TableBody = createTableComponent<HTMLTableSectionElement>(
  "tbody",
  "[&_tr:last-child]:border-0"
);
TableBody.displayName = "TableBody";

const TableFooter = createTableComponent<HTMLTableSectionElement>(
  "tfoot",
  "bg-primary font-medium text-primary-foreground"
);
TableFooter.displayName = "TableFooter";

const TableRow = createTableComponent<HTMLTableRowElement>(
  "tr",
  "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground " +
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = createTableComponent<HTMLTableCaptionElement>(
  "caption",
  "mt-4 text-sm text-muted-foreground"
);
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
};
