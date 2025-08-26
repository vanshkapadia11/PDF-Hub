"use client";

import { useState, useRef } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import MoreToolsSidebar from "@/components/MoreToolsSidebar";
import Footer from "@/components/Footer";

export default function PdfToExcel() {
  const [file, setFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");
  const [originalSize, setOriginalSize] = useState(0);
  const [convertedSize, setConvertedSize] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    setError("");
    const selectedFile = event.target.files[0];

    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setOriginalSize(selectedFile.size);
      setConvertedSize(0);
      setDownloadUrl("");
    } else {
      setError("Please select a valid PDF file");
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setError("");
    const droppedFiles = Array.from(event.dataTransfer.files);

    if (droppedFiles.length > 0 && droppedFiles[0].type === "application/pdf") {
      setFile(droppedFiles[0]);
      setOriginalSize(droppedFiles[0].size);
      setConvertedSize(0);
      setDownloadUrl("");
      event.dataTransfer.clearData();
    } else {
      setError("Please drop a valid PDF file");
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

  const convertToExcel = async () => {
    if (!file) {
      setError("Please select a PDF file first");
      return;
    }

    setIsConverting(true);
    setError("");
    setDownloadUrl("");
    setConvertedSize(0);

    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const response = await fetch("/api/pdf-to-excel", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setConvertedSize(blob.size);
    } catch (error) {
      console.error("Error converting PDF to Excel:", error);
      setError(error.message || "Failed to convert PDF. Please try again.");
    } finally {
      setIsConverting(false);
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
                    PDF to Excel
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Header */}
          <h1 className="text-4xl font-semibold uppercase">
            PDF Hub - Convert PDF to Excel
          </h1>
          <p className="text-xs font-semibold uppercase mt-2 mb-8 text-zinc-600">
            Convert your PDF documents to editable Excel spreadsheets
          </p>

          {/* File Input (hidden) */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Drop Zone */}
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
              Click to select or drag & drop a PDF file here
            </p>
          </div>

          {/* File Info */}
          {file && (
            <div className="w-full max-w-2xl mt-6 p-4 rounded-lg bg-white shadow-sm text-left border border-green-200">
              <h3 className="text-sm font-semibold uppercase text-gray-700">
                Selected File: <span className="font-normal">{file.name}</span>
              </h3>
              <p className="text-xs font-semibold uppercase text-zinc-600">
                Size: {formatFileSize(originalSize)}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 w-full max-w-2xl p-4 rounded-lg bg-red-50 border border-red-300 text-red-600 text-sm font-semibold uppercase">
              <p>{error}</p>
            </div>
          )}

          {/* Convert Button */}
          {file && (
            <div className="mt-8">
              <Button
                onClick={convertToExcel}
                disabled={isConverting}
                variant={"outline"}
                className="ring-2 ring-inset ring-rose-400 text-sm cursor-pointer font-semibold uppercase"
              >
                {isConverting ? "Converting..." : "Convert to Excel"}
              </Button>
            </div>
          )}

          {/* Conversion Results */}
          {convertedSize > 0 && (
            <>
              <Separator className="mt-8 w-full max-w-2xl" />
              <div className="w-full max-w-2xl mt-6 p-6 rounded-lg bg-white shadow-sm text-left border border-green-200">
                <h3 className="text-lg font-semibold uppercase mb-4 text-green-700">
                  ✅ Conversion Complete
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-semibold uppercase text-gray-700">
                      Original PDF:
                    </span>
                    <span className="text-xs font-semibold uppercase text-blue-500">
                      {formatFileSize(originalSize)}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-semibold uppercase text-gray-700">
                      Excel Spreadsheet:
                    </span>
                    <span className="text-xs font-semibold uppercase text-green-500">
                      {formatFileSize(convertedSize)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Download Button */}
          {downloadUrl && (
            <div className="mt-6 w-full max-w-2xl text-center">
              <Button
                variant={"outline"}
                className="ring-2 ring-inset ring-green-500"
              >
                <a
                  href={downloadUrl}
                  download={`converted-${file.name.replace(".pdf", ".xlsx")}`}
                  className="text-sm font-semibold uppercase text-green-700"
                >
                  Download Excel Spreadsheet
                </a>
              </Button>
            </div>
          )}
        </div>
        <MoreToolsSidebar currentPage={"/pdf-to-excel"} />
      </div>
      <Footer />
    </>
  );
}
