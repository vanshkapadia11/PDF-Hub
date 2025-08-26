"use client";

import { useState, useRef, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import MoreToolsSidebar from "@/components/MoreToolsSidebar";
import Footer from "@/components/Footer";

export default function FilterImagePage() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    brightness: 1,
    contrast: 1,
    saturate: 1,
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: parseFloat(value) }));
  };

  const processImage = async () => {
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
      formData.append("brightness", filters.brightness);
      formData.append("contrast", filters.contrast);
      formData.append("saturate", filters.saturate);

      const response = await fetch("/api/add-filters", {
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
      setError(err.message || "Failed to apply filters.");
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
                    <a href="/" className="text-sm font-semibold uppercase">
                      Home
                    </a>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-sm font-semibold uppercase">
                    Filters
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <h1 className="text-4xl font-semibold uppercase">
            PDF Hub - Add Filters
          </h1>
          <p className="text-xs font-semibold uppercase mt-2 mb-8 text-zinc-600">
            Adjust brightness, contrast, and saturation with live preview.
          </p>

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
            onDrop={(e) => {
              e.preventDefault();
              handleFileChange({ target: { files: e.dataTransfer.files } });
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <p className="text-sm font-semibold uppercase">
              Click to select or drag & drop an image here
            </p>
          </div>

          {file && (
            <div className="w-full max-w-2xl text-sm font-semibold uppercase mt-6 p-4 rounded-lg bg-white shadow-sm text-left border border-green-200">
              Selected File: <span className="text-red-400">{file.name}</span>
            </div>
          )}

          {file && (
            <div className="w-full max-w-2xl mt-6 p-4 rounded-lg bg-white shadow-sm text-left border border-gray-200 space-y-4">
              <h2 className="text-lg font-semibold uppercase">Filters</h2>
              {["brightness", "contrast", "saturate"].map((filter) => (
                <div key={filter} className="flex items-center space-x-2">
                  <Label className="text-sm font-semibold uppercase">
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Label>
                  <Input
                    type="range"
                    name={filter}
                    min="0"
                    max="2"
                    step="0.01"
                    value={filters[filter]}
                    onChange={handleChange}
                    className="flex-1 accent-zinc-800" // Add this class
                  />
                  <span className="text-sm font-semibold uppercase">
                    {filters[filter]}
                  </span>
                </div>
              ))}

              {/* Live Preview */}
              {previewUrl && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="max-w-full max-h-96 border rounded-lg shadow"
                    style={{
                      filter: `brightness(${filters.brightness}) contrast(${filters.contrast}) saturate(${filters.saturate})`,
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          {file && (
            <Button
              onClick={processImage}
              disabled={isProcessing}
              className="bg-blue-700 text-white hover:bg-blue-800 text-sm font-semibold uppercase mt-8 mb-4 cursor-pointer"
            >
              {isProcessing ? "Applying Filters..." : "Apply Filters"}
            </Button>
          )}

          {downloadUrl && (
            <>
              <Separator />
              <div className="mt-6 text-center w-6/12">
                <div className="w-full max-w-2xl mt-6 p-6 rounded-lg bg-white shadow-sm text-center ring-2 ring-inset ring-[#e8e8e8]">
                  <h3 className="text-lg font-semibold uppercase mb-4 text-green-700">
                    Success!
                  </h3>
                  <Button className="w-full bg-green-700 text-white hover:bg-green-800">
                    <a
                      href={downloadUrl}
                      download={`filtered-${file.name}`}
                      className="font-semibold text-sm uppercase w-full"
                    >
                      Download Filtered Image
                    </a>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
        <MoreToolsSidebar currentPage="/add-filters" />
      </div>
      <Footer />
    </>
  );
}
