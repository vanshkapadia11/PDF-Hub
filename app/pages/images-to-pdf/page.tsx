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
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import MoreToolsSidebar from "@/components/MoreToolsSidebar";
import Footer from "@/components/Footer";

export default function ImagesToPDFConverter() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validImageFiles = selectedFiles.filter(
      (file) => file.type === "image/jpeg" || file.type === "image/png"
    );
    setFiles(validImageFiles);
    setError("");
    setDownloadUrl("");
    if (validImageFiles.length !== selectedFiles.length) {
      setError("Some selected files were not JPG or PNG and were ignored.");
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    const validImageFiles = droppedFiles.filter(
      (file) => file.type === "image/jpeg" || file.type === "image/png"
    );
    setFiles(validImageFiles);
    setError("");
    setDownloadUrl("");
    if (validImageFiles.length !== droppedFiles.length) {
      setError("Some dropped files were not JPG or PNG and were ignored.");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setError("Please select at least one image file.");
      return;
    }

    setLoading(true);
    setError("");
    setDownloadUrl("");

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const response = await fetch("/api/images-to-pdf", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setDownloadUrl(url);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Something went wrong.");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="grid md:grid-cols-[6fr_1fr] grid-rows-[1fr_1fr] min-h-screen bg-gray-50 p-4">
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
                    Images to PDF
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <h1 className="text-4xl font-semibold uppercase">
            PDF Hub - Images to PDF
          </h1>
          <p className="text-xs font-semibold uppercase mt-2 mb-8">
            Combine your JPG and PNG images into a single PDF document
          </p>

          {/* File Input and Drop Zone */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".jpg, .jpeg, .png"
            multiple
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <div
            className={cn(
              "w-full max-w-2xl h-48 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center transition-colors hover:border-blue-500 hover:text-blue-500 cursor-pointer",
              files.length > 0 ? "border-green-500 text-green-500" : ""
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <p className="text-sm font-semibold uppercase">
              Click to select or drag & drop images here
            </p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6 w-full max-w-2xl text-left">
              <h4 className="text-lg font-semibold uppercase mb-2">
                Selected Files:
              </h4>
              <ul className="bg-white p-4 rounded-lg shadow-sm max-h-40 overflow-y-auto">
                {files.map((file, index) => (
                  <li key={index} className="text-sm text-gray-700 font-medium">
                    {file.name}
                  </li>
                ))}
              </ul>
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
          <div className="mt-8">
            <Button
              onClick={handleSubmit}
              disabled={loading || files.length === 0}
              variant={"outline"}
              className={`ring-2 ring-inset ring-rose-400 text-sm cursor-pointer font-semibold uppercase`}
            >
              {loading ? "Converting..." : "Convert to PDF"}
            </Button>
          </div>

          {/* Download Link */}
          {downloadUrl && (
            <>
              <Separator className="mt-8 w-full max-w-2xl" />
              <div className="mt-8 w-full max-w-2xl p-6 bg-green-50 border border-green-300 rounded-lg text-center">
                <h3 className="text-medium font-semibold uppercase mb-4">
                  Conversion Complete:
                </h3>
                <Button
                  variant={"outline"}
                  className="ring-2 ring-inset ring-green-500"
                >
                  <a
                    href={downloadUrl}
                    download="images-converted.pdf"
                    className="text-sm font-semibold uppercase text-green-700"
                  >
                    Download PDF Document
                  </a>
                </Button>
              </div>
            </>
          )}
        </div>
        <MoreToolsSidebar currentPage={"/image-to-pdf"} />
      </div>
      <Footer />
    </>
  );
}
