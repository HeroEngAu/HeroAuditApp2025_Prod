"use client";

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { useState } from 'react';

// Function to render data on a PDF template
async function renderFormToPdf(pdfUrl: string, formData: any) {
  try {
    // Fetch the existing PDF template
    const existingPdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());

    if (!existingPdfBytes) {
      console.error('Failed to load PDF template.');
      return;
    }

    // Load the PDF template
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Add text for form data to the first page (you can customize the coordinates)
    const font = await pdfDoc.embedStandardFont(StandardFonts.Helvetica);
    
    let yOffset = 700; // Start from a certain Y position on the page

    // Loop through formData and add text to the PDF at different Y positions
    for (const [key, value] of Object.entries(formData)) {
      const text = `${key}: ${value}`;

      firstPage.drawText(text, {
        x: 50, // X position
        y: yOffset, // Y position
        font: font,
        size: 12,
        color: rgb(0, 0, 0),
      });

      yOffset -= 20; // Move down the Y position for the next line
    }

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();

    // Create a blob from the PDF and trigger the download
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `filled_form.pdf`;
    link.click();
  } catch (error) {
    console.error('Error rendering PDF:', error);
  }
}

const PDFRenderer = ({ pdfUrl, formData }: { pdfUrl: string, formData: any }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    await renderFormToPdf(pdfUrl, formData);
    setIsDownloading(false);
  };

  return (
    <div>
      <button onClick={handleDownload} disabled={isDownloading}>
        {isDownloading ? 'Downloading...' : 'Download PDF'}
      </button>
    </div>
  );
};

export default PDFRenderer;
