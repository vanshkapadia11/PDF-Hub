"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Navbar from "@/components/Navbar";
import MoreToolsSidebar from "@/components/MoreToolsSidebar";
import Footer from "@/components/Footer";

export default function CompressImagePage() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("percentage"); // percentage or filesize
  const [quality, setQuality] = useState(80);
  const [targetSize, setTargetSize] = useState(""); // in KB

  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    setError("");
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
      setDownloadUrl("");
    } else {
      setError("Please select a valid image file (PNG, JPG, WebP, etc.)");
    }
  };

  const handleDragOver = (event) => event.preventDefault();
  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    if (droppedFiles.length > 0 && droppedFiles[0].type.startsWith("image/")) {
      setFile(droppedFiles[0]);
      setDownloadUrl("");
    } else {
      setError("Please drop a valid image file");
    }
  };

  const processImage = async () => {
    if (!file) {
      setError("Please select an image file first.");
      return;
    }

    setIsProcessing(true);
    setError("");
    setDownloadUrl("");

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("mode", mode);
      if (mode === "percentage") formData.append("quality", quality);
      if (mode === "filesize") formData.append("targetSize", targetSize);

      const response = await fetch("/api/compress-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server Error");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (error) {
      console.error("Error compressing image:", error);
      setError(error.message || "Failed to compress image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="grid md:grid-cols-[6fr_1fr] grid-rows-[1fr_1fr] md:min-h-screen min-h-[150vh] bg-gray-50 p-4">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-10 w-full max-w-2xl mx-auto text-left">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <a href="/">
                      <span className="text-sm font-semibold uppercase cursor-pointer">
                        Home
                      </span>
                    </a>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-sm font-semibold uppercase">
                    Compress Image
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <h1 className="text-4xl font-semibold uppercase">
            PDF Hub - Compress Image
          </h1>
          <p className="text-xs font-semibold uppercase mt-2 mb-8 text-zinc-600">
            Reduce file size without losing much quality.
          </p>

          {/* File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div
            className={cn(
              "w-full max-w-2xl h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors cursor-pointer",
              file
                ? "border-green-500 text-green-500"
                : "border-gray-400 text-gray-500 hover:border-blue-500 hover:text-blue-500"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <p className="text-sm font-semibold uppercase">
              Click to select or drag & drop an image here
            </p>
          </div>

          {file && (
            <div className="w-full max-w-2xl mt-6 p-4 rounded-lg bg-white shadow-sm text-left border border-green-200">
              <h3 className="text-sm font-semibold uppercase text-gray-700">
                Selected File: <span className="font-normal">{file.name}</span>
              </h3>
            </div>
          )}

          {file && (
            <div className="w-full max-w-2xl mt-6 p-4 rounded-lg bg-white shadow-sm text-left border border-gray-200 space-y-4">
              <h2 className="text-lg font-semibold uppercase">
                Compression Mode
              </h2>
              <div className="flex items-center space-x-4">
                <Button
                  variant={mode === "percentage" ? "default" : "outline"}
                  onClick={() => setMode("percentage")}
                  className="text-sm font-semibold uppercase"
                >
                  Percentage
                </Button>
                <Button
                  variant={mode === "filesize" ? "default" : "outline"}
                  onClick={() => setMode("filesize")}
                  className="text-sm font-semibold uppercase"
                >
                  Target Size
                </Button>
              </div>

              {mode === "percentage" && (
                <div className="flex items-center space-x-4 mt-2">
                  <Input
                    type="number"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    min={1}
                    max={100}
                    className="w-20"
                  />
                  <span className="text-sm font-semibold uppercase">%</span>
                </div>
              )}

              {mode === "filesize" && (
                <div className="flex items-center space-x-4 mt-2">
                  <Input
                    type="number"
                    value={targetSize}
                    onChange={(e) => setTargetSize(e.target.value)}
                    min={1}
                    placeholder="Enter size"
                    className="w-32"
                  />
                  <span className="text-sm font-semibold uppercase">KB</span>
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="mt-4 text-center text-sm font-semibold uppercase text-red-600">
              {error}
            </p>
          )}

          {file && (
            <div className="mt-8">
              <Button
                onClick={processImage}
                disabled={isProcessing}
                variant={"outline"}
                className="ring-2 ring-inset ring-rose-400 text-sm cursor-pointer font-semibold uppercase"
              >
                {isProcessing ? "Compressing..." : "Compress Image"}
              </Button>
            </div>
          )}

          {downloadUrl && (
            <div className="w-full max-w-2xl mt-6 p-6 rounded-lg bg-white shadow-sm text-center ring-2 ring-inset ring-[#e8e8e8]">
              <h3 className="text-lg font-semibold uppercase mb-4 text-green-700">
                Success!
              </h3>
              <Button className="bg-green-700 text-white hover:bg-green-800">
                <a
                  href={downloadUrl}
                  download={`compressed-${file.name}`}
                  className="text-sm font-semibold uppercase"
                >
                  Download Compressed Image
                </a>
              </Button>
            </div>
          )}
        </div>
        <MoreToolsSidebar currentPage={"/compress-image"} />
      </div>
      <Footer />
    </>
  );
}
