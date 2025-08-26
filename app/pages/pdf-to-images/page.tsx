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
import Navbar from "@/components/Navbar";
import MoreToolsSidebar from "@/components/MoreToolsSidebar";
import Footer from "@/components/Footer";

export default function PdfToImagesPage() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setMessage("");
    setFile(e.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setMessage("");
    const droppedFiles = Array.from(event.dataTransfer.files);

    if (droppedFiles.length > 0 && droppedFiles[0].type === "application/pdf") {
      setFile(droppedFiles[0]);
    } else {
      setMessage("Please drop a valid PDF file.");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    setIsLoading(true);
    setMessage("Processing your PDF... Please wait.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/pdf-to-images", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // Create a download link for the zip file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "pdf-images.zip";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setMessage("Success! Your ZIP file is downloading.");
      } else {
        const errorText = await response.text();
        setMessage(`Error: ${errorText}`);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
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
                    PDF to Images
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <h1 className="text-4xl font-semibold uppercase">
            PDF Hub - Convert PDF to Images
          </h1>
          <p className="text-xs font-semibold uppercase mt-2 mb-8 text-zinc-600">
            Upload a PDF file to get a ZIP file containing each page as a JPG
            image.
          </p>

          {/* File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf"
            onChange={handleFileChange}
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
            </div>
          )}

          {/* Convert Button */}
          <div className="mt-8">
            <Button
              onClick={handleSubmit}
              disabled={!file || isLoading}
              variant={"outline"}
              className="ring-2 ring-inset ring-rose-400 text-sm cursor-pointer font-semibold uppercase"
            >
              {isLoading ? "Converting..." : "Convert to Images"}
            </Button>
          </div>

          {/* Message */}
          {message && (
            <p
              className={cn(
                "mt-4 w-full max-w-2xl text-center text-sm font-semibold uppercase",
                isLoading && "text-blue-600",
                message.includes("Error") && "text-red-600",
                message.includes("Success") && "text-green-600"
              )}
            >
              {message}
            </p>
          )}
        </div>
        <MoreToolsSidebar currentPage={"/pdf-to-images"} />
      </div>
      <Footer />
    </>
  );
}
