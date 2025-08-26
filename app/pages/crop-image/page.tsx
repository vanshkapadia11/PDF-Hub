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
import Navbar from "@/components/Navbar";
import MoreToolsSidebar from "@/components/MoreToolsSidebar";
import Footer from "@/components/Footer";

export default function CropImagePage() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");
  const [cropData, setCropData] = useState({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Clean up object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const handleFileChange = (event) => {
    setError("");
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
      setDownloadUrl("");
    } else {
      setError("Please select a valid image file (PNG, JPG, etc.)");
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
    if (droppedFiles.length > 0 && droppedFiles[0].type.startsWith("image/")) {
      setFile(droppedFiles[0]);
      setDownloadUrl("");
    } else {
      setError("Please drop a valid image file");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numberValue = Math.max(0, Number(value)); // prevent negative
    setCropData((prev) => ({ ...prev, [name]: numberValue }));
  };

  const processImage = async () => {
    if (!file) {
      setError("Please select an image file first.");
      return;
    }

    if (cropData.width <= 0 || cropData.height <= 0) {
      setError("Width and height must be greater than 0.");
      return;
    }

    setIsProcessing(true);
    setError("");
    setDownloadUrl("");

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("x", cropData.x);
      formData.append("y", cropData.y);
      formData.append("width", cropData.width);
      formData.append("height", cropData.height);

      const response = await fetch("/api/crop-image", {
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
      console.error("Error cropping image:", error);
      setError(error.message || "Failed to crop image. Please try again.");
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
                    Crop Image
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <h1 className="text-4xl font-semibold uppercase">
            PDF Hub - Crop Image
          </h1>
          <p className="text-xs font-semibold uppercase mt-2 mb-8 text-zinc-600">
            Crop your images by specifying exact dimensions.
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
                Selected File:{" "}
                <span className="text-xs font-semibold text-rose-400">
                  {file.name}
                </span>
              </h3>
            </div>
          )}

          {file && (
            <div className="w-full max-w-2xl mt-6 p-4 rounded-lg bg-white shadow-sm text-left border border-gray-200 space-y-4">
              <h2 className="text-lg font-semibold uppercase">
                Crop Dimensions
              </h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {["x", "y", "width", "height"].map((field) => (
                  <div key={field} className="space-y-1">
                    <Label
                      htmlFor={field}
                      className="text-sm font-semibold uppercase"
                    >
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </Label>
                    <Input
                      type="number"
                      id={field}
                      name={field}
                      value={cropData[field]}
                      onChange={handleChange}
                      min={0}
                    />
                  </div>
                ))}
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
                variant="outline"
                className="ring-2 ring-inset ring-rose-400 text-sm cursor-pointer font-semibold uppercase"
              >
                {isProcessing ? "Cropping..." : "Crop Image"}
              </Button>
            </div>
          )}

          {downloadUrl && (
            <div className="w-full max-w-2xl mt-6 p-6 rounded-lg bg-white shadow-sm text-center">
              <h3 className="text-lg font-semibold uppercase mb-4 text-green-700">
                Success!
              </h3>
              <Button
                variant={"outline"}
                className="ring-2 ring-inset ring-green-400"
              >
                <a
                  href={downloadUrl}
                  download={`cropped-${file.name}`}
                  className="text-sm font-semibold uppercase"
                >
                  Download Cropped Image
                </a>
              </Button>
            </div>
          )}
        </div>
        <MoreToolsSidebar currentPage={"/crop-image"} />
      </div>
      <Footer />
    </>
  );
}
