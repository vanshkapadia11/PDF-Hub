"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import Navbar from "@/components/Navbar";
import MoreToolsSidebar from "@/components/MoreToolsSidebar";

export default function AddPageNumbers() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");
  const [position, setPosition] = useState("bottom-center");
  const [startPage, setStartPage] = useState(1);
  const [pageFormat, setPageFormat] = useState("page_of_total");
  const [startNumber, setStartNumber] = useState(1);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    setError("");
    const selectedFile = event.target.files[0];

    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
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
      setDownloadUrl("");
      event.dataTransfer.clearData();
    } else {
      setError("Please drop a valid PDF file");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const processPDF = async () => {
    if (!file) {
      setError("Please select a PDF file first");
      return;
    }

    setIsProcessing(true);
    setError("");
    setDownloadUrl("");

    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("position", position);
      formData.append("startPage", startPage.toString());
      formData.append("pageFormat", pageFormat);
      formData.append("startNumber", startNumber.toString());

      const response = await fetch("/api/add-page-numbers", {
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
      console.error("Error adding page numbers:", error);
      setError(error.message || "Failed to process PDF. Please try again.");
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
                    Add Page Numbers
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <h1 className="text-4xl font-semibold uppercase">
            PDF Hub - Add Page Numbers
          </h1>
          <p className="text-xs font-semibold uppercase mt-2 mb-8 text-zinc-600">
            Easily add customizable page numbers to your PDF document
          </p>

          {/* File Input */}
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
            </div>
          )}

          {/* Options Section */}
          {file && (
            <div className="w-full max-w-2xl mt-6 p-4 rounded-lg bg-white shadow-sm text-left border border-gray-200 space-y-6">
              <h2 className="text-lg font-semibold uppercase">
                Page Numbering Options
              </h2>

              {/* Position */}
              <div>
                <Label className="text-sm font-semibold uppercase mb-2 block">
                  Position
                </Label>
                <Select
                  onValueChange={setPosition}
                  defaultValue="bottom-center"
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top-left">Top Left</SelectItem>
                    <SelectItem value="top-center">Top Center</SelectItem>
                    <SelectItem value="top-right">Top Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    <SelectItem value="bottom-center">Bottom Center</SelectItem>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Page and Start Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="start-page"
                    className="text-sm font-semibold uppercase mb-2 block"
                  >
                    Start on Page
                  </Label>
                  <Input
                    id="start-page"
                    type="number"
                    value={startPage}
                    onChange={(e) => setStartPage(Number(e.target.value))}
                    min="1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="start-number"
                    className="text-sm font-semibold uppercase mb-2 block"
                  >
                    Start with Number
                  </Label>
                  <Input
                    id="start-number"
                    type="number"
                    value={startNumber}
                    onChange={(e) => setStartNumber(Number(e.target.value))}
                    min="1"
                  />
                </div>
              </div>

              {/* Format */}
              <div>
                <Label className="text-sm font-semibold uppercase mb-2 block">
                  Format
                </Label>
                <RadioGroup
                  onValueChange={setPageFormat}
                  defaultValue="page_of_total"
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="page_only" id="format-page-only" />
                    <Label
                      htmlFor="format-page-only"
                      className="text-sm font-semibold uppercase cursor-pointer"
                    >
                      Page Only (e.g., 1, 2, 3...)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg mt-2">
                    <RadioGroupItem
                      value="page_of_total"
                      id="format-page-of-total"
                    />
                    <Label
                      htmlFor="format-page-of-total"
                      className="text-sm font-semibold uppercase cursor-pointer"
                    >
                      Page X of Y (e.g., 1 of 10, 2 of 10...)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 w-full max-w-2xl p-4 rounded-lg bg-red-50 border border-red-300 text-red-600 text-sm font-semibold uppercase">
              <p>{error}</p>
            </div>
          )}

          {/* Process Button */}
          {file && (
            <div className="mt-8">
              <Button
                onClick={processPDF}
                disabled={isProcessing}
                variant={"outline"}
                className="ring-2 ring-inset ring-rose-400 text-sm cursor-pointer font-semibold uppercase"
              >
                {isProcessing ? "Adding Numbers..." : "Add Page Numbers"}
              </Button>
            </div>
          )}

          {/* Download Link */}
          {downloadUrl && (
            <>
              <Separator className="mt-8 w-full max-w-2xl" />
              <div className="w-full max-w-2xl mt-6 p-6 rounded-lg bg-white shadow-sm text-left border border-green-200 text-center">
                <h3 className="text-lg font-semibold uppercase mb-4 text-green-700">
                  Success!
                </h3>
                <p className="text-sm font-semibold uppercase text-zinc-600">
                  Your PDF is ready to download.
                </p>
                <Button
                  variant={"outline"}
                  className="mt-4 ring-2 ring-inset ring-green-500"
                >
                  <a
                    href={downloadUrl}
                    download={`numbered-${file.name}`}
                    className="text-sm font-semibold uppercase"
                  >
                    Download Numbered PDF
                  </a>
                </Button>
              </div>
            </>
          )}
        </div>
        <MoreToolsSidebar currentPage={"/add-number-to-pages"} />
      </div>
      <Footer />
    </>
  );
}
