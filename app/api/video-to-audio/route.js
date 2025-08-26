import { NextResponse } from "next/server";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { PassThrough } from "stream";

export const runtime = "nodejs";

ffmpeg.setFfmpegPath(ffmpegPath);

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("video");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No video uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const inputStream = new PassThrough();
    inputStream.end(buffer);

    const outputStream = new PassThrough();
    const chunks = [];
    outputStream.on("data", (chunk) => chunks.push(chunk));

    await new Promise((resolve, reject) => {
      ffmpeg(inputStream)
        .noVideo()
        .audioCodec("libmp3lame")
        .format("mp3")
        .pipe(outputStream)
        .on("finish", resolve)
        .on("error", reject);
    });

    return new Response(Buffer.concat(chunks), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": "attachment; filename=audio.mp3",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to extract audio" },
      { status: 500 }
    );
  }
}
