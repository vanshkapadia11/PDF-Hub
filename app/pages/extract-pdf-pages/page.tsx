"use client";

import { useState, useRef } from "react";
import axios from "axios";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CircleXIcon, Loader2Icon, CheckCircle2Icon } from "lucide-react";
import Navbar from "@/components/Navbar";
import MoreToolsSidebar from "@/components/MoreToolsSidebar";
import Footer from "@/components/Footer";

export default function PDFExtractor() {
  const [file, setFile] = useState(null);
  const [pagesToKeep, setPagesToKeep] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setDownloadUrl("");
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }
    if (!pagesToKeep.trim()) {
      setError("Please enter pages to extract.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("pagesToKeep", pagesToKeep);

    try {
      const res = await axios.post("/api/extract-pdf-pages", formData, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      setDownloadUrl(url);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          "Failed to extract pages. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError("");
    } else {
      setFile(null);
      setError("Please select a valid PDF file.");
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      setError("");
    } else {
      setFile(null);
      setError("Please drop a valid PDF file.");
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

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <Navbar />

      {/* Full-screen Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <Loader2Icon className="h-12 w-12 animate-spin text-rose-400" />
            <p className="mt-4 text-sm font-semibold uppercase text-gray-700">
              Extracting pages, please wait...
            </p>
          </div>
        </div>
      )}

      {/* Main content container */}
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        {/* Main content area */}
        <main className="flex-1 p-4 md:p-8 flex flex-col items-center text-center">
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
                    Extract PDF Pages
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <h1 className="text-4xl font-extrabold uppercase mt-6">
            PDF Hub - Extract PDF Pages
          </h1>
          <p className="text-xs font-semibold uppercase mt-2 mb-8 text-zinc-600">
            Extract specific pages from your PDF document.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Drag & Drop Zone */}
          <div
            className={cn(
              "w-full max-w-2xl h-48 border-2 rounded-lg flex flex-col items-center justify-center transition-colors cursor-pointer",
              dragActive
                ? "border-blue-500 text-blue-500 border-dashed"
                : file
                ? "border-green-500 text-green-500"
                : "border-gray-400 text-gray-500 hover:border-blue-500 hover:text-blue-500 border-dashed"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <p className="text-sm font-semibold uppercase">
              Click to select or drag & drop a PDF file here
            </p>
            <p className="text-xs font-semibold uppercase mt-2 text-zinc-600">
              Accepted format: .pdf
            </p>
          </div>

          {/* Options & Action Section */}
          {file && (
            <div className="w-full max-w-2xl mt-8 p-6 rounded-xl bg-white shadow-lg border border-gray-200 space-y-6">
              {/* File Info */}
              <div className="flex items-center text-left">
                <CheckCircle2Icon className="w-5 h-5 text-green-500 mr-2" />
                <p className="text-sm font-semibold uppercase">
                  File Selected:{" "}
                  <span className="font-normal text-gray-700">{file.name}</span>
                </p>
              </div>
              <Separator />

              {/* Pages to Extract Section */}
              <div className="text-left space-y-2">
                <Label
                  htmlFor="pagesToKeep"
                  className="text-sm font-semibold uppercase"
                >
                  Pages to Extract (e.g., 1, 3-5, 8)
                </Label>
                <Input
                  type="text"
                  id="pagesToKeep"
                  value={pagesToKeep}
                  onChange={(e) => setPagesToKeep(e.target.value)}
                  placeholder="e.g., 1, 3-5, 8"
                  className="mt-2 text-center"
                />
              </div>

              {/* Extract Button */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={!file || !pagesToKeep.trim() || loading}
                  variant={"outline"}
                  className="ring-2 ring-inset ring-rose-400 text-sm font-semibold uppercase"
                >
                  {loading ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    "Extract Pages"
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

          {/* Download Link */}
          {downloadUrl && (
            <div className="w-full max-w-2xl mt-8 p-6 rounded-lg bg-white shadow-lg border border-green-200 text-center">
              <h3 className="text-lg font-semibold uppercase mb-4 text-green-700">
                Pages Extracted Successfully!
              </h3>
              <p className="text-sm font-semibold uppercase text-zinc-600">
                Your new PDF is ready to download.
              </p>
              <Button
                variant={"outline"}
                className="mt-4 ring-2 ring-inset ring-green-500"
              >
                <a
                  href={downloadUrl}
                  download="extracted-document.pdf"
                  className="text-sm font-semibold uppercase"
                >
                  Download The PDF
                </a>
              </Button>
            </div>
          )}
        </main>

        {/* Sidebar Container */}
        <aside className="md:w-[25%] p-4 bg-gray-100 border-l border-gray-200">
          <MoreToolsSidebar currentPage={"/extract-pdf-pages"} />
        </aside>
      </div>
      <Footer />
    </>
  );
}
