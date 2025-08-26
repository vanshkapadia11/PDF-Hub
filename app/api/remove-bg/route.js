import { NextResponse } from "next/server";
import sharp from "sharp";
// import Human from "@vladmandic/human";
import Human from "@vladmandic/human"; // <-- forces WASM / web build

// configure human to use WASM (no tfjs-node needed)
const human = new Human.Human({
  backend: "wasm", // force WASM, avoids tfjs-node
  modelBasePath: "node_modules/@vladmandic/human/models",
  cacheModels: true,
  body: { enabled: true, segmentation: { enabled: true, part: false } },
});

await human.load(); // load models once

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    const image = sharp(inputBuffer).ensureAlpha();

    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Run segmentation
    const seg = await human.segment(image);
    const mask = seg?.canvas; // canvas with background removed

    let outputBuffer;
    if (mask) {
      outputBuffer = await sharp(mask).png().toBuffer();
    } else {
      // fallback: remove white
      const rgbaBuffer = Buffer.alloc(data.length);
      for (let i = 0; i < info.width * info.height; i++) {
        const r = data[i * 4];
        const g = data[i * 4 + 1];
        const b = data[i * 4 + 2];

        rgbaBuffer[i * 4] = r;
        rgbaBuffer[i * 4 + 1] = g;
        rgbaBuffer[i * 4 + 2] = b;
        rgbaBuffer[i * 4 + 3] = r > 240 && g > 240 && b > 240 ? 0 : 255;
      }

      outputBuffer = await sharp(rgbaBuffer, {
        raw: { width: info.width, height: info.height, channels: 4 },
      })
        .png()
        .toBuffer();
    }

    return new Response(outputBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": "attachment; filename=no-bg.png",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to remove background" },
      { status: 500 }
    );
  }
}
