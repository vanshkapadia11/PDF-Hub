"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  CloudUploadIcon,
  Image as ImageIcon,
  Loader2Icon,
  XCircleIcon,
  CheckCircle2Icon,
  DownloadIcon,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import MoreToolsSidebar from "@/components/MoreToolsSidebar";
import Footer from "@/components/Footer";

export default function BackgroundRemoverPage() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setError("");
    setDownloadUrl("");
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setError("Please select a valid image file (PNG, JPG, WebP, etc.).");
      setFile(null);
      setPreviewUrl(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
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
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          // If the response is not JSON, use the status text
          errorData = { error: response.statusText };
        }
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

  const removeSelectedFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setDownloadUrl("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <Navbar />

      {/* Main Content & Sidebar Container */}
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 flex flex-col items-center text-center">
          {/* Breadcrumb */}
          <div className="w-full max-w-2xl mx-auto text-left">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">
                    <span className="text-sm font-semibold uppercase cursor-pointer">
                      Home
                    </span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-sm font-semibold uppercase">
                    Background Remover
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Header */}
          <h1 className="text-4xl font-extrabold uppercase mt-6">
            PDF Hub - Background Remover
          </h1>
          <p className="text-xs font-semibold uppercase mt-2 mb-8 text-zinc-600">
            Remove image backgrounds automatically.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Drop Zone / File Info */}
          {!file ? (
            <div
              className={cn(
                "w-full max-w-2xl h-48 border-2 rounded-lg flex flex-col items-center justify-center transition-colors cursor-pointer",
                dragActive
                  ? "border-blue-500 text-blue-500 border-dashed"
                  : "border-gray-400 text-gray-500 hover:border-blue-500 hover:text-blue-500 border-dashed"
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <CloudUploadIcon className="h-12 w-12 text-gray-400" />
              <p className="text-sm font-semibold uppercase mt-4">
                Click to select or drag & drop an image here
              </p>
              <p className="text-xs font-semibold uppercase mt-1 text-zinc-600">
                Accepted formats: PNG, JPG, WebP, etc.
              </p>
            </div>
          ) : (
            <div className="w-full max-w-2xl p-6 rounded-xl bg-white shadow-lg border border-gray-200 space-y-4 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-5 h-5 text-purple-500" />
                  <p className="text-sm font-semibold uppercase">
                    Selected File:{" "}
                    <span className="font-normal text-gray-700">
                      {file.name}
                    </span>
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeSelectedFile}
                  className="p-1 h-auto text-red-500 hover:bg-red-50 hover:text-red-700 transition-all rounded-full"
                  aria-label="Remove file"
                >
                  <XCircleIcon className="h-5 w-5" />
                </Button>
              </div>
              <Separator />
              <div className="flex justify-center">
                <Button
                  onClick={removeBackground}
                  disabled={isProcessing}
                  variant={"outline"}
                  className="ring-2 ring-inset ring-rose-400 text-sm font-semibold uppercase"
                >
                  {isProcessing ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Removing Background...
                    </>
                  ) : (
                    "Remove Background"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="w-full max-w-2xl mt-8 p-4 rounded-lg bg-red-50 border border-red-300 text-red-600 text-sm font-semibold uppercase text-left">
              <p>{error}</p>
            </div>
          )}

          {/* Image Preview and Results */}
          {(previewUrl || downloadUrl) && (
            <div className="w-full max-w-2xl mt-8 p-6 rounded-xl bg-white shadow-lg border border-gray-200 flex flex-col items-center">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full">
                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <span className="text-xs font-semibold uppercase text-gray-700 mb-2">
                    Original Image
                  </span>
                  <div className="w-full h-auto max-h-80 flex items-center justify-center bg-gray-100 rounded-md">
                    <img
                      src={previewUrl}
                      alt="Original"
                      className="object-contain max-h-80 rounded-md"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center p-4 border rounded-lg relative">
                  <span className="text-xs font-semibold uppercase text-gray-700 mb-2">
                    Result
                  </span>
                  <div className="w-full h-auto max-h-80 flex items-center justify-center rounded-md relative overflow-hidden">
                    <div className="absolute inset-0 z-0 bg-repeat checkered-pattern" />
                    <img
                      src={
                        downloadUrl ||
                        "https://placehold.co/400x400/transparent"
                      }
                      alt="Processed"
                      className="object-contain max-h-80 rounded-md z-10"
                    />
                  </div>
                  {downloadUrl && (
                    <Button
                      variant={"outline"}
                      className="ring-2 ring-inset ring-green-500 mt-4"
                      asChild
                    >
                      <a
                        href={downloadUrl}
                        download={`no-bg-${file.name}`}
                        className="text-sm font-semibold uppercase text-green-700 flex items-center"
                      >
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        Download Image
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Sidebar Container */}
        <aside className="md:w-[25%] p-4 bg-gray-100 border-l border-gray-200">
          <MoreToolsSidebar currentPage={"/remove-bg"} />
        </aside>
      </div>
      <Footer />
    </>
  );
}
