import { Buffer } from "buffer";
import pd

export async function POST(request) {
  try {
    // Dynamically import PDF2Pic inside the function
    const { PDF2Pic } = await import("pdf2pic");

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const options = {
      density: 100,
      saveFilename: "output",
      savePath: "./images",
      format: "png",
      width: 600,
      height: 600,
    };

    const convert = new PDF2Pic(options);
    const result = await convert.convertBuffer(buffer);

    return Response.json({ images: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
