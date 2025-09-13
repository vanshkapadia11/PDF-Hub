// lib/pdfjs-init.js
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

if (process.env.NEXT_RUNTIME === "nodejs") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve(
    "pdfjs-dist/legacy/build/pdf.worker.mjs"
  );
}

export default pdfjsLib;
