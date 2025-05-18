"use client";

import { useEffect } from "react";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { Dialog, DialogContent } from "./ui/dialog";
import { useRouter } from "next/navigation";


const styles = StyleSheet.create({
  page: { padding: 30 },
  section: { marginBottom: 10 },
  label: { fontWeight: "bold", fontSize: 12 },
  value: { fontSize: 12, marginBottom: 5 },
});


const PDFTemplate = ({ elements, responses }: { elements: any[]; responses: Record<string, any> }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {elements.map((element) => (
        <View style={styles.section} key={element.id}>
          <Text style={styles.label}>{element.label || element.type}</Text>
          <Text style={styles.value}>{responses[element.id] ?? "—"}</Text>
        </View>
      ))}
    </Page>
  </Document>
);

interface GeneratePdfClientProps {
  elements: any[];
  responses: Record<string, any>;
}

export default function GeneratePdfClient({ elements, responses }: GeneratePdfClientProps) {
  const router = useRouter();

  useEffect(() => {
    
  }, []);

  const handleClose = () => router.back();

  return (
    <Dialog open onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="w-screen h-screen max-h-screen max-w-full flex flex-col p-4 gap-4">
        <h1 className="text-xl font-bold">Export PDF</h1>
        <PDFDownloadLink
          document={<PDFTemplate elements={elements} responses={responses} />}
          fileName="form-response.pdf"
          className="bg-blue-500 text-white px-4 py-2 rounded w-fit"
        >
          {({ loading }) => (loading ? "Generating PDF..." : "Download PDF")}
        </PDFDownloadLink>
      </DialogContent>
    </Dialog>
  );
}
