// app/api/organize-pdf/route.ts
import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export const runtime = "nodejs";

// Helper function to parse the new page order string
function parsePageOrder(orderString) {
  const pages = orderString.split(",").map((part) => Number(part.trim()));
  // We will allow deleting pages, so no strict length check here
  if (pages.some(isNaN) || pages.some((num) => num <= 0)) {
    throw new Error(
      "Invalid page order format. Please use comma-separated numbers."
    );
  }
  return pages;
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const pdfFile = formData.get("pdf");
    const newOrderStr = formData.get("newOrder");

    if (!pdfFile || !newOrderStr) {
      return NextResponse.json(
        { error: "PDF file and new page order are required." },
        { status: 400 }
      );
    }

    const newOrder = parsePageOrder(newOrderStr);
    const pdfBytes = Buffer.from(await pdfFile.arrayBuffer());

    const originalPdfDoc = await PDFDocument.load(pdfBytes);
    const numOriginalPages = originalPdfDoc.getPages().length;

    // We no longer validate against the original page count
    // The new order can contain a subset of pages.
    const newPdfDoc = await PDFDocument.create();

    // Copy pages into the new document in the specified order
    // We only copy pages that exist in the newOrder array
    for (const pageNum of newOrder) {
      const pageIndex = pageNum - 1;
      // Add a check to prevent out-of-bounds access
      if (pageIndex < 0 || pageIndex >= numOriginalPages) {
        return NextResponse.json(
          { error: `Page number ${pageNum} is out of bounds.` },
          { status: 400 }
        );
      }
      const [copiedPage] = await newPdfDoc.copyPages(originalPdfDoc, [
        pageIndex,
      ]);
      newPdfDoc.addPage(copiedPage);
    }

    const reorganizedPdfBytes = await newPdfDoc.save();

    return new Response(reorganizedPdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=organized.pdf",
      },
    });
  } catch (err) {
    console.error(err);
    const errorMessage = err.message || "Failed to organize PDF pages.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
