"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
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

export default function ConvertImagePage() {
  const [file, setFile] = useState(null);
  const [outputFormat, setOutputFormat] = useState("png");
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Clean up object URL
  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const handleFileChange = (event) => {
    setError("");
    const selectedFile = event.target.files[0];
    if (
      selectedFile &&
      [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
        "image/gif",
        "image/svg+xml",
      ].includes(selectedFile.type)
    ) {
      setFile(selectedFile);
      setDownloadUrl("");
    } else {
      setError("Please select a valid image file (JPG, PNG, WEBP, GIF, SVG)");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const droppedFiles = Array.from(event.dataTransfer.files);
    if (
      droppedFiles.length > 0 &&
      [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
        "image/gif",
        "image/svg+xml",
      ].includes(droppedFiles[0].type)
    ) {
      setFile(droppedFiles[0]);
      setDownloadUrl("");
    } else {
      setError("Please drop a valid image file (JPG, PNG, WEBP, GIF, SVG)");
    }
  };

  const convertImage = async () => {
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
      formData.append("format", outputFormat);

      const response = await fetch("/api/convert-image", {
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
    } catch (error) {
      console.error("Error converting image:", error);
      setError(error.message || "Failed to convert image. Please try again.");
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
                    <a
                      href="/"
                      className="text-sm font-semibold uppercase cursor-pointer"
                    >
                      Home
                    </a>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-sm font-semibold uppercase">
                    Convert Image
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <h1 className="text-4xl font-semibold uppercase">
            PDF Hub - Convert Image
          </h1>
          <p className="text-xs font-semibold uppercase mt-2 mb-8 text-zinc-600">
            Convert your images to PNG, JPG, WEBP, or GIF.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            accept=".jpg,.jpeg,.png,.webp,.gif,.svg"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            className={cn(
              "w-full max-w-2xl h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors cursor-pointer",
              dragActive
                ? "border-blue-500 text-blue-500"
                : file
                ? "border-green-500 text-green-500"
                : "border-gray-400 text-gray-500 hover:border-blue-500 hover:text-blue-500"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
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
              <h2 className="text-lg font-semibold uppercase">Output Format</h2>
              <Select onValueChange={setOutputFormat} value={outputFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpg">JPG</SelectItem>
                  <SelectItem value="webp">WEBP</SelectItem>
                  <SelectItem value="gif">GIF</SelectItem>
                </SelectContent>
              </Select>
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
                onClick={convertImage}
                disabled={isProcessing}
                variant="outline"
                className="ring-2 ring-inset ring-rose-400 text-sm cursor-pointer font-semibold uppercase"
              >
                {isProcessing ? "Converting..." : "Convert Image"}
              </Button>
            </div>
          )}

          {downloadUrl && (
            <div className="w-full max-w-2xl mt-6 p-6 rounded-lg bg-white shadow-sm text-center ring-2 ring-inset ring-[#e8e8e8]">
              <h3 className="text-lg font-semibold uppercase mb-4 text-green-700">
                Success!
              </h3>
              <Button className="ring-2 ring-inset bg-green-700 text-white hover:bg-green-800">
                <a
                  href={downloadUrl}
                  download={`converted-${
                    file.name.split(".")[0]
                  }.${outputFormat}`}
                  className="text-sm font-semibold uppercase"
                >
                  Download Converted Image
                </a>
              </Button>
            </div>
          )}
        </div>
        <MoreToolsSidebar currentPage={"/convert-image"} />
      </div>
      <Footer />
    </>
  );
}
