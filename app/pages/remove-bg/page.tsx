"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

export default function BackgroundRemoverPage() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setError("");
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setDownloadUrl("");
    } else {
      setError("Please select a valid image file (PNG, JPG, WebP, etc.)");
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    handleFileChange({ target: { files: e.dataTransfer.files } });
  };

  const removeBackground = async () => {
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    setIsProcessing(true);
    setError("");
    setDownloadUrl("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/remove-bg", {
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
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to remove background.");
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
                    <a href="/">Home</a>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Background Remover</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <h1 className="text-4xl font-semibold uppercase">
            PDF Hub - Background Remover
          </h1>
          <p className="text-xs font-semibold uppercase mt-2 mb-8 text-zinc-600">
            Remove image backgrounds automatically.
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
              "w-full max-w-2xl h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer",
              file
                ? "border-green-500 text-green-500"
                : "border-gray-400 text-gray-500 hover:border-blue-500 hover:text-blue-500"
            )}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <p className="text-sm font-semibold uppercase">
              Click to select or drag & drop an image here
            </p>
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="mt-6 w-full max-w-2xl flex justify-center">
              <img
                src={previewUrl}
                alt="preview"
                className="max-w-full max-h-96 border rounded-lg shadow"
              />
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          {file && (
            <Button
              onClick={removeBackground}
              disabled={isProcessing}
              className="mt-8"
            >
              {isProcessing ? "Removing Background..." : "Remove Background"}
            </Button>
          )}

          {downloadUrl && (
            <div className="mt-6 text-center">
              <a
                href={downloadUrl}
                download={`no-bg-${file.name}`}
                className="text-blue-600 font-semibold underline"
              >
                Download Image
              </a>
            </div>
          )}
        </div>
        <MoreToolsSidebar currentPage={"/remove-bg"} />
      </div>
      <Footer />
    </>
  );
}
