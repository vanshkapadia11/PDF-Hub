"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import MoreToolsSidebar from "@/components/MoreToolsSidebar";
import Footer from "@/components/Footer";

export default function PDFToImagesConverter() {
  const [file, setFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");
  const [originalSize, setOriginalSize] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    setError("");
    setDownloadUrl("");
    const selectedFile = event.target.files[0];

    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setOriginalSize(selectedFile.size);
    } else {
      setFile(null);
      setError("Please select a valid PDF file.");
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setError("");
    setDownloadUrl("");
    const droppedFiles = Array.from(event.dataTransfer.files);

    if (droppedFiles.length > 0 && droppedFiles[0].type === "application/pdf") {
      setFile(droppedFiles[0]);
      setOriginalSize(droppedFiles[0].size);
      event.dataTransfer.clearData();
    } else {
      setFile(null);
      setError("Please drop a valid PDF file.");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    setIsConverting(true);
    setError("");
    setDownloadUrl("");

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await fetch("/api/pdf-to-images", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setDownloadUrl(url);
      } else {
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error("Error converting PDF:", err);
      setError(err.message || "Failed to convert PDF. Please try again.");
    } finally {
      setIsConverting(false);
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
                    PDF to Images
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <h1 className="text-4xl font-semibold uppercase">
            PDF Hub - PDF to Images
          </h1>
          <p className="text-xs font-semibold uppercase mt-2 mb-8">
            Convert your PDF document pages into a ZIP file of JPG images
          </p>

          {/* File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />

          {/* Drop Zone */}
          <div
            className={cn(
              "w-full max-w-2xl h-48 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors cursor-pointer",
              file
                ? "border-green-500 text-green-500"
                : "border-gray-400 text-gray-500 hover:border-blue-500 hover:text-blue-500"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <p className="text-sm font-semibold uppercase">
              Click to select or drag & drop a PDF file here
            </p>
          </div>

          {/* File Info */}
          {file && (
            <div className="mt-6 w-full max-w-2xl text-left">
              <h3 className="text-lg font-semibold uppercase">
                Selected File: {file.name}
              </h3>
              <p className="text-sm font-semibold uppercase text-zinc-600">
                Original size: {formatFileSize(originalSize)}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 w-full max-w-2xl p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {/* Convert Button */}
          {file && (
            <div className="mt-8">
              <Button
                onClick={handleSubmit}
                disabled={isConverting}
                variant={"outline"}
                className={`ring-2 ring-inset ring-rose-400 text-sm cursor-pointer font-semibold uppercase`}
              >
                {isConverting ? "Converting..." : "Convert to Images"}
              </Button>
            </div>
          )}

          {/* Download Link */}
          {downloadUrl && (
            <>
              <Separator className="mt-8 w-full max-w-2xl" />
              <div className="mt-8 w-full max-w-2xl p-6 bg-green-50 border border-green-300 rounded-lg text-center">
                <h3 className="text-lg font-semibold uppercase mb-4">
                  Conversion Complete:
                </h3>
                <Button
                  variant={"outline"}
                  className="ring-2 ring-inset ring-green-500"
                >
                  <a
                    href={downloadUrl}
                    download="converted-images.zip"
                    className="text-sm font-semibold uppercase text-green-700"
                  >
                    Download ZIP File
                  </a>
                </Button>
              </div>
            </>
          )}

          {/* Information Box */}
          <div className="mt-10 p-6 border border-amber-300 bg-amber-50 rounded-lg w-full max-w-2xl mx-auto text-left">
            <h3 className="text-sm font-semibold uppercase text-amber-800 mb-2">
              Implementation Note:
            </h3>
            <p className="text-xs text-amber-700 font-semibold uppercase">
              This feature requires a server-side library like **Ghostscript**
              or **GraphicsMagick** to be installed on your host. It's a
              resource-intensive process.
            </p>
          </div>
        </div>
        <MoreToolsSidebar currentPage={"/pdf-word"} />
      </div>
      <Footer />
    </>
  );
}
