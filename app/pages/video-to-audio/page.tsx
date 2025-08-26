"use client";
import { useState } from "react";

export default function VideoToAudio() {
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Select a video");

    const formData = new FormData();
    formData.append("video", file);

    const res = await fetch("/api/video-to-audio", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) return alert("Conversion failed");

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audio.mp3";
    a.click();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button type="submit">Convert to MP3</button>
    </form>
  );
}
