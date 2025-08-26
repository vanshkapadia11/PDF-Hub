import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { writeFile, unlink } from "fs/promises";
import { exec } from "child_process";
import { tmpdir } from "os";
import { join } from "path";

function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) return reject(error);
      resolve(stdout);
    });
  });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const password = formData.get("password");
    const action = formData.get("action");

    if (!file) {
      return NextResponse.json(
        { error: "No PDF file provided." },
        { status: 400 }
      );
    }
    if (!password) {
      return NextResponse.json(
        { error: "No password provided." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const tempInputPath = join(tmpdir(), `input-${Date.now()}.pdf`);
    const tempOutputPath = join(tmpdir(), `output-${Date.now()}.pdf`);

    await writeFile(tempInputPath, Buffer.from(arrayBuffer));

    if (action === "protect") {
      // Protect using qpdf
      const cmd = `qpdf --encrypt ${password} ${password} 256 -- "${tempInputPath}" "${tempOutputPath}"`;
      await runCommand(cmd);
    } else if (action === "unprotect") {
      // Unprotect using pdf-lib
      const pdfDoc = await PDFDocument.load(arrayBuffer, { password });
      const modifiedPdfBytes = await pdfDoc.save();
      await writeFile(tempOutputPath, modifiedPdfBytes);
    } else {
      return NextResponse.json(
        { error: "Invalid action specified." },
        { status: 400 }
      );
    }

    const protectedPdf = await import("fs/promises").then(({ readFile }) =>
      readFile(tempOutputPath)
    );

    // Clean up temp files
    await unlink(tempInputPath).catch(() => {});
    await unlink(tempOutputPath).catch(() => {});

    return new NextResponse(protectedPdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${action}-${file.name}"`,
      },
    });
  } catch (error) {
    console.error("Server-side PDF processing error:", error);
    if (error.message.includes("incorrect password")) {
      return NextResponse.json(
        { error: "Incorrect password." },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Failed to process PDF." },
      { status: 500 }
    );
  }
}
