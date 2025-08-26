import { getDocument } from "pdfjs-dist/legacy/build/pdf.js";
import JSZip from "jszip";
import { createCanvas } from "canvas";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const data = [];
    req.on("data", (chunk) => data.push(chunk));
    req.on("end", async () => {
      const buffer = Buffer.concat(data);
      const pdf = await getDocument({ data: buffer }).promise;
      const zip = new JSZip();

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });

        const canvas = createCanvas(viewport.width, viewport.height);
        const ctx = canvas.getContext("2d");

        await page.render({ canvasContext: ctx, viewport }).promise;

        zip.file(`page-${i}.png`, canvas.toBuffer("image/png"));
      }

      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", 'attachment; filename="pages.zip"');
      res.send(zipBuffer);
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing PDF");
  }
}
