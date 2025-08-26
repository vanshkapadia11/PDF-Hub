"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

export default function RotateFlipImagePage() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");
  const [rotate, setRotate] = useState(0); // degrees
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

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
      formData.append("rotate", rotate);
      formData.append("flipH", flipH);
      formData.append("flipV", flipV);

      const response = await fetch("/api/rotate-image", {
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
      console.error("Error rotating/flipping image:", error);
      setError(error.message || "Failed to process image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="grid md:grid-cols-[6fr_1fr] grid-rows-[1fr_1fr] md:min-h-screen min-h-[150vh] bg-gray-50 p-4">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Breadcrumb */}
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
                    Rotate & Flip Image
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <h1 className="text-4xl font-semibold uppercase">
            PDF Hub - Rotate & Flip Image
          </h1>
          <p className="text-xs font-semibold uppercase mt-2 mb-8 text-zinc-600">
            Rotate by degrees or flip your image horizontally/vertically.
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
                Rotate & Flip Options
              </h2>

              <div className="space-y-2">
                <Label
                  htmlFor="rotate"
                  className="text-sm font-semibold uppercase"
                >
                  Rotate (degrees)
                </Label>
                <select
                  id="rotate"
                  value={rotate}
                  onChange={(e) => setRotate(Number(e.target.value))}
                  className="w-full border px-2 py-1 rounded"
                >
                  <option value={0}>0°</option>
                  <option value={90}>90°</option>
                  <option value={180}>180°</option>
                  <option value={270}>270°</option>
                </select>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={flipH}
                    onChange={() => setFlipH(!flipH)}
                  />
                  <span className="text-sm font-semibold uppercase">
                    Flip Horizontally
                  </span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={flipV}
                    onChange={() => setFlipV(!flipV)}
                  />
                  <span className="text-sm font-semibold uppercase">
                    Flip Vertically
                  </span>
                </label>
              </div>
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
                {isProcessing ? "Processing..." : "Rotate & Flip Image"}
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
                  download={`rotated-flipped-${file.name}`}
                  className="text-sm font-semibold uppercase"
                >
                  Download Image
                </a>
              </Button>
            </div>
          )}
        </div>
        <MoreToolsSidebar currentPage={"/rotate-image"} />
      </div>
    </>
  );
}
