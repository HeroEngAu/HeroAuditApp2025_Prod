// components/PDFDocument.tsx
import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";
import { FormElementInstance } from "./FormElements";
import { renderHtmlToPDFElements } from "./converthtmlreact";

Font.register({
  family: 'DejaVuSans',
  src: '/fonts/DejaVuSans.ttf',
});

interface Props {
  elements: FormElementInstance[][];
  responses: { [key: string]: unknown };
  formName: string;
  revision: number | string;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'A3' | 'A4';
  docNumber?: string;
  docNumberRevision?: number | string;
}
const styles = StyleSheet.create({
  page: {
    wrap: true,
    paddingTop: 10,
    paddingBottom: 40,
    paddingHorizontal: 30,
    fontSize: 10,
  },
  fieldContainer: {
    marginBottom: 10,
    breakInside: 'avoid',
  },
  fieldTitle: { fontWeight: "bold", marginBottom: 4 },
  image: { width: 200, height: 150, marginTop: 5 },
  table: { borderColor: "#000", width: "100%" },
  tableCell: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 4,
    flexShrink: 0,
  },
  tableRow: {
    flexDirection: "row",
  },
  header: {
    paddingBottom: 10,
  },
  headerImage: {
    width: "100%",
    //maxHeight: 200,
    objectFit: "contain",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 10,
    color: "grey",
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#999",
    width: "100%",
    marginTop: 5,
  },
  separatorText: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#666",
  }, footerContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  footerLine: {
    height: 1,
    backgroundColor: 'grey',
    marginBottom: 5,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10,
    color: 'grey',
  },
});

function renderFieldValue(element: FormElementInstance, value: unknown) {

  switch (element.type) {
    case "ImageField": {
      const imageUrl =
        typeof value === "string" ? value : element.extraAttributes?.imageUrl;

      if (!imageUrl) return <Text>[Invalid image]</Text>;

      const width = element.extraAttributes?.width;
      const height = element.extraAttributes?.height;
      const alignment = element.extraAttributes?.position ?? "left";
      const preserveOriginalSize = element.extraAttributes?.preserveOriginalSize;

      let alignStyle = {};
      if (alignment === "center") {
        alignStyle = { alignSelf: "center" };
      } else if (alignment === "right") {
        alignStyle = { alignSelf: "flex-end" };
      } else {
        alignStyle = { alignSelf: "flex-start" };
      }

      const imageStyle = preserveOriginalSize
        ? {
          objectFit: "contain",
          width: "200px",
          height: "80px",
          ...alignStyle,
        }
        : {
          objectFit: "contain",
          width,
          height,
          ...alignStyle,
        };

      return <Image src={imageUrl} style={imageStyle} />;
    }

    case "TableField": {
      const tableData = value || element.extraAttributes?.data;
      const headerRowIndexes: number[] = element.extraAttributes?.headerRowIndexes || [];

      if (!tableData || !Array.isArray(tableData)) return <Text>[Invalid table]</Text>;

      const rows = tableData.length;
      const columns = Math.max(...tableData.map((row: string[]) => row.length));
      const columnHeaders = element.extraAttributes?.columnHeaders || [];

      const parseCell = (cellValue: string): string => {
        const trimmed = cellValue?.trim() || "";
        if (trimmed === "[camera]") return "No picture was taken";
        if (trimmed.startsWith("[checkbox")) {
          if (trimmed === "[checkbox:true]") return "✔";
          if (trimmed === "[checkbox:false]") return "✖";
          return "☐";
        }

        if (trimmed.startsWith("[select")) {
          const match = trimmed.match(/^\[select:"(.*?)":/);
          return match?.[1] || "";
        }

        if (trimmed.startsWith("[number:")) {
          return trimmed.match(/^\[number:(.*?)\]$/)?.[1] || "";
        }

        if (trimmed.startsWith("[date:")) {
          const isoDate = trimmed.match(/^\[date:(.*?)\]$/)?.[1];
          if (!isoDate) return "";

          const dateObj = new Date(isoDate);
          if (isNaN(dateObj.getTime())) return " ";

          const day = String(dateObj.getDate()).padStart(2, "0");
          const month = String(dateObj.getMonth() + 1).padStart(2, "0");
          const year = dateObj.getFullYear();

          return `${day}.${month}.${year}`;
        }

        return trimmed || "";
      };

      // Get the column widths based on the content
      const estimateColumnWidths = (
        tableData: string[][],
        columnCount: number,
        columnHeaders: string[] = []
      ): number[] => {
        const maxCharPerColumn = Array(columnCount).fill(0);

        const allRows = [columnHeaders.slice(0, columnCount), ...tableData];

        allRows.forEach((row) => {
          row.forEach((cell, colIndex) => {
            const parsed = parseCell(cell);
            const length = parsed.length;
            const lengthWithMin = Math.max(length, parsed.length + 4);
            let px = 13;
            if (/^[A-Z0-9]+$/.test(parsed)) {
              px = 15;
            } else if (parsed.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
              px = 19;
            } else if (!isNaN(Number(parsed))) {
              px = 14;
            }

            maxCharPerColumn[colIndex] = Math.max(
              maxCharPerColumn[colIndex],
              lengthWithMin * px
            );
          });
        });

        const minWidth = 50;
        const maxWidth = 1200;

        return maxCharPerColumn.map((w) =>
          Math.min(Math.max(w, minWidth), maxWidth)
        );
      };

      const columnWidths = estimateColumnWidths(tableData, columns, columnHeaders);

      return (
        <View style={styles.table} >
          {/* Header */}
          <View style={styles.tableRow} wrap={false}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <View
                key={colIndex}
                style={[
                  styles.tableCell,
                  {
                    backgroundColor: "#eee",
                    width: columnWidths[colIndex],
                    flexShrink: 0,
                  },
                ]}
                wrap={false}
              >
                <Text style={{ fontSize: 10, textAlign: "center" }}>
                  {columnHeaders[colIndex] || `Col ${colIndex + 1}`}
                </Text>
              </View>
            ))}
          </View>

          {/* Body */}
          {Array.from({ length: rows }).map((_, rowIndex) => {
            const isHeaderRow = headerRowIndexes.includes(rowIndex);
            return (
              <View
                key={rowIndex}
                style={[
                  styles.tableRow,
                  isHeaderRow ? { backgroundColor: "#eee" } : {},
                ]}
                wrap={false}
              >
                {Array.from({ length: columns }).map((_, colIndex) => {
                  const cellText = parseCell(tableData[rowIndex]?.[colIndex] || "");
                  const rawCellValue = tableData[rowIndex]?.[colIndex] || "";
                  const rawTrimmed = rawCellValue.trim();
                  const isEuropeanNumber =
                    /^[0-9]{1,3}(\.[0-9]{3})*,[0-9]+$/.test(rawTrimmed) ||
                    /^[0-9]+,[0-9]+$/.test(rawTrimmed) ||
                    /^[0-9]+,[0-9]{3}$/.test(rawTrimmed) ||
                    /^-?\d+(?:\.\d{3})*,\d+$/.test(rawTrimmed);
                  const isImage = rawTrimmed.startsWith("[image:");
                  const imageBase64 = rawTrimmed.match(/^\[image:(data:image\/[a-zA-Z]+;base64,.*?)\]$/)?.[1];
                  const isCenteredCell =
                    ["[checkbox:true]", "[checkbox:false]", "[checkbox]"].includes(rawTrimmed) ||
                    rawTrimmed.startsWith("[select") ||
                    rawTrimmed.startsWith("[number:") ||
                    rawTrimmed.startsWith("[date:") ||
                    !isNaN(Number(rawTrimmed)) ||
                    isEuropeanNumber ||
                    /^[0-9]+(\.[0-9]+)?\s*[a-zA-Z]{1,3}$/.test(rawTrimmed) ||
                    /^[0-9]+(,[0-9]+)?\s*[a-zA-Z]{1,3}$/.test(rawTrimmed) ||
                    /^-?\d+(\.\d+)?\s*[a-zA-Z]{1,3}$/.test(rawTrimmed) ||
                    /^-?\d+,\d+\s*[a-zA-Z]{1,3}$/.test(rawTrimmed) ||
                    !isNaN(Number(rawTrimmed)) ||
                    /^[0-9]+(\.[0-9]+)?\s*[a-zA-Z]{1}$/.test(rawTrimmed) ||
                    /^[0-9]+(\.[0-9]+)?\s*[a-zA-Z]{2}$/.test(rawTrimmed) ||
                    /^[0-9]+(\.[0-9]+)?\s*[a-zA-Z]{3}$/.test(rawTrimmed);

                  return (
                    <View
                      key={colIndex}
                      style={[
                        styles.tableCell,
                        { width: columnWidths[colIndex] },
                      ]}
                    >
                      {isImage && imageBase64 ? (
                        <Image
                          src={imageBase64}
                          style={{
                            height: 60,
                            objectFit: "contain",
                            marginVertical: 2,
                          }}
                        />
                      ) : (
                        <Text
                          style={{
                            fontFamily: 'DejaVuSans',
                            textAlign: isCenteredCell ? "center" : "justify",
                            ...(isHeaderRow && {
                              textAlign: "center",
                              fontWeight: 600,
                              color: "#000",
                            }),
                          }}
                        >
                          {cellText}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })}

        </View>
      );
    }
    case "SeparatorField":
      return (
        <View style={styles.separator}>
          <Text style={styles.separatorText}>

          </Text>
        </View>
      );
    case "NumberField": {
      const { required } = element.extraAttributes ?? {};
      return (
        <View style={{ padding: 2, borderWidth: 1, borderRadius: 4 }} wrap={false}>
          <Text style={{ fontSize: 10, fontWeight: "bold", marginBottom: 4 }}>
            {required ? "*" : ""}
          </Text>
          <Text style={{ fontSize: 10, minHeight: 20 }}>
            {value !== undefined && value !== null && value !== "" ? String(value) : "-"}
          </Text>
        </View>
      );
    }
    case "CheckboxField": {
      const checked = Boolean(value);
      const label = element.extraAttributes?.label ?? "";

      return (
        <View style={{ padding: 2, borderWidth: 1, borderRadius: 4, flexDirection: "row", alignItems: "center" }} wrap={false}>
          <Text style={{ fontSize: 10, marginRight: 8, fontFamily: 'DejaVuSans' }}>
            {checked ? "☑" : "☐"}
          </Text>
          <Text style={{ fontSize: 10, fontFamily: 'DejaVuSans' }}>
            {label}
          </Text>
        </View>
      );
    }

    case "TitleField": {
      const {
        title,
        backgroundColor = "#ffffff",
        textColor = "#000000",
        textAlign = "left",
      } = element.extraAttributes ?? {};

      const isTransparent = backgroundColor === "transparent";

      return (
        <View
          style={{
            padding: 2,
            backgroundColor: isTransparent ? undefined : backgroundColor,
            borderRadius: 4,
          }}
          wrap={false}
        >
          <Text
            style={{
              fontSize: 14,
              textAlign: textAlign as "left" | "center" | "right",
              color: textColor,
            }}
          >
            {title || "-"}
          </Text>
        </View>

      );
    }

    case "ParagraphField": {
      const { text } = element.extraAttributes ?? {};
      const html = typeof text === "string" ? text.trim() : "";

      return (
        <View style={{ padding: 2, borderWidth: 1, borderRadius: 4 }}>
          <Text
            style={{
              fontSize: 10,
              lineHeight: 1.5,
              flexWrap: "wrap",
            }}
            wrap={false}
          >
            {renderHtmlToPDFElements(html)}
          </Text>

        </View>
      );
    }

    case "DateField": {
      let dateOnly = "";
      if (
        value &&
        (typeof value === "string" ||
          typeof value === "number" ||
          value instanceof Date)
      ) {
        const dateObj = new Date(value);
        if (!isNaN(dateObj.getTime())) {
          dateOnly = dateObj.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        }
      }

      return (
        <View style={{ padding: 2, borderWidth: 1, borderRadius: 4 }} wrap={false}>
          <Text>{dateOnly}</Text>
        </View>
      );
    }
    case "TextAreaField": {
      const cleanText =
        typeof value === "string" ? value.trim() : "";

      return (
        <View style={{ padding: 2, borderWidth: 1, borderRadius: 4 }} wrap={false}>
          <Text style={{ fontSize: 10 }}>
            {cleanText || "-"}
          </Text>
        </View>
      );
    }
    case "TextField": {
      const cleanText =
        typeof value === "string" ? value.trim() : "";

      return (
        <View style={{ padding: 2, borderWidth: 1, borderRadius: 4 }}>
          <Text style={{ fontSize: 10 }}>
            {cleanText || "-"}
          </Text>
        </View>
      );
    }

    case "CameraField": {
      const imageUrl = typeof value === "string" ? value : element.extraAttributes?.content;
      if (!imageUrl) return <Text>[No image]</Text>;

      return (
        <View style={{ marginBottom: 10 }}>
          <Text style={{ marginBottom: 4 }}>{element.extraAttributes?.label}</Text>
          <Image
            src={imageUrl}
            style={{ width: 500, height: "auto", objectFit: "cover", alignSelf: "center" }}
          />
        </View>
      );
    }
    case "SpacerField": {
      const height = element.extraAttributes?.height || 10;
      return <View style={{ height, width: "100%" }} />;
    }

    default:
      return (
        <View style={{ padding: 2, borderWidth: 1, borderRadius: 4 }}>
          <Text>{String(value)}</Text>
        </View>
      );
  }
}

export default function PDFDocument({ elements, responses, formName, revision, orientation, pageSize, docNumber, docNumberRevision }: Props) {
  const repeatablesInOrder = elements[0]?.filter(el => el.extraAttributes?.repeatOnPageBreak) || [];
  const repeatHeaderImage = repeatablesInOrder.find(el => el.type === "ImageField");
  const headerImagePosition = repeatHeaderImage?.extraAttributes?.position ?? "left";
  const preserveOriginalSize = repeatHeaderImage?.extraAttributes?.preserveOriginalSize;
  const height = repeatHeaderImage?.extraAttributes?.height ?? 80;
  const width = repeatHeaderImage?.extraAttributes?.width;

  let alignStyle = {};
  if (headerImagePosition === "center") {
    alignStyle = { alignSelf: "center" };
  } else if (headerImagePosition === "right") {
    alignStyle = { alignSelf: "flex-end" };
  } else {
    alignStyle = { alignSelf: "flex-start" };
  }

  const imageStyle = preserveOriginalSize
    ? { width, height: "auto", objectFit: "contain", ...alignStyle }
    : { width: 150, height, objectFit: "contain", ...alignStyle };

  return (
    <Document>
      {elements.map((group, pageIndex) => (
        <Page key={pageIndex} style={styles.page} wrap orientation={orientation || "portrait"} size={pageSize || "A3"}>
          {/* Header */}
          <View fixed style={styles.header}>
            {repeatablesInOrder.map((el) => {
              if (el.type === "ImageField") {
                return <Image key={el.id} src={el.extraAttributes?.imageUrl} style={imageStyle} />;
              }
              return (
                <View key={`header-el-${el.id}`}>
                  {renderFieldValue(el, responses[el.id])}
                </View>
              );
            })}
          </View>

          {/* Footer */}
          <View fixed style={styles.footerContainer}>
            <View style={styles.footerLine} />
            <View style={styles.footerContent}>
              <Text>{formName} REV. {revision} | {docNumber} REV. {docNumberRevision} </Text>
              <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
            </View>
          </View>

          {/* Page Content */}
          {group.map((element, index) => {
            if (repeatablesInOrder.find(r => r.id === element.id)) return null;

            const nextElement = group[index + 1];
            const isTitleFollowedByParagraph =
              element.type === "TitleField" &&
              (nextElement?.type === "ParagraphField" || nextElement?.type === "TableField");

            if (isTitleFollowedByParagraph) {
              const titleValue = responses[element.id];
              const nextValue = responses[nextElement.id];

              return (
                <View key={`combo-${element.id}-${nextElement.id}`} wrap={false} style={styles.fieldContainer}>
                  <Text style={styles.fieldTitle}>{element.extraAttributes?.label}</Text>
                  {renderFieldValue(element, titleValue)}
                  <Text style={styles.fieldTitle}>{nextElement.extraAttributes?.label}</Text>
                  {renderFieldValue(nextElement, nextValue)}
                </View>
              );
            }

            if (
              index > 0 &&
              group[index - 1].type === "TitleField" &&
              (element.type === "ParagraphField" || element.type === "TableField")
            ) {
              return null;
            }

            const value = responses[element.id];

            return (
              <View key={element.id} wrap={false} style={styles.fieldContainer}>
                {element.type !== "SeparatorField" && element.type !== "CheckboxField" && (
                  <Text style={styles.fieldTitle}>{element.extraAttributes?.label}</Text>
                )}
                {renderFieldValue(element, value)}
              </View>
            );
          })}
        </Page>
      ))}
    </Document>
  );
}


