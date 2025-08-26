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
import { CircleXIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import MoreToolsSidebar from "@/components/MoreToolsSidebar";
import Footer from "@/components/Footer";

export default function ExcelToPdf() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setDownloadUrl("");
    if (!file) {
      setError("Please select an Excel file.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("excel", file);

    try {
      const res = await axios.post("/api/excel-to-pdf", formData, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      setDownloadUrl(url);
    } catch (err) {
      console.error(err);
      setError("Conversion failed. Please try a different file.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (
      selectedFile &&
      (selectedFile.type === "application/vnd.ms-excel" ||
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    ) {
      setFile(selectedFile);
      setError("");
    } else {
      setFile(null);
      setError("Please select a valid Excel file (.xlsx or .xls).");
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (
      droppedFile &&
      (droppedFile.type === "application/vnd.ms-excel" ||
        droppedFile.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    ) {
      setFile(droppedFile);
      setError("");
    } else {
      setFile(null);
      setError("Please drop a valid Excel file (.xlsx or .xls).");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
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
                    Excel to PDF
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <h1 className="text-4xl font-semibold uppercase">
            Excel to PDF Converter
          </h1>
          <p className="text-xs font-semibold uppercase mt-2 mb-8 text-zinc-600">
            Convert your Excel spreadsheets to a PDF document
          </p>

          {/* File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".xlsx, .xls"
            onChange={handleFileSelect}
            style={{ display: "none" }}
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
              Click to select or drag & drop an Excel file here
            </p>
            <p className="text-xs font-semibold uppercase mt-2 text-zinc-600">
              Accepted formats: .xlsx, .xls
            </p>
          </div>

          {/* File List */}
          {file && (
            <div className="mt-6 w-full max-w-2xl text-left">
              <h3 className="text-lg font-semibold uppercase mb-2">
                Selected File:
              </h3>
              <ul className="bg-white p-4 rounded-lg shadow-sm">
                <li className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <span className="text-sm text-gray-700 font-medium">
                    {file.name}
                  </span>
                  <button
                    onClick={removeFile}
                    className="text-red-400 hover:scale-105 transition-all duration-300"
                  >
                    <CircleXIcon className="h-5 w-5" />
                  </button>
                </li>
              </ul>
            </div>
          )}

          {/* Convert Button */}
          <div className="mt-8">
            <Button
              onClick={handleSubmit}
              disabled={!file || loading}
              variant={"outline"}
              className={`ring-2 ring-inset ring-rose-400 text-sm cursor-pointer font-semibold uppercase`}
            >
              {loading ? "Converting..." : "Convert to PDF"}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm font-semibold mt-4">{error}</p>
          )}

          {/* Download Link */}
          {downloadUrl && (
            <>
              <Separator className="mt-8 w-full max-w-2xl" />
              <div className="mt-8 w-full max-w-2xl p-6 bg-green-50 border border-green-300 rounded-lg text-center">
                <h3 className="text-lg font-semibold uppercase mb-4 text-green-700">
                  Conversion successful!
                </h3>
                <Button
                  variant={"outline"}
                  className="ring-2 ring-inset ring-green-500"
                >
                  <a
                    href={downloadUrl}
                    download="converted-document.pdf"
                    className="text-sm font-semibold uppercase text-green-700"
                  >
                    Download The PDF
                  </a>
                </Button>
              </div>
            </>
          )}
        </div>
        <MoreToolsSidebar currentPage={"/excel-to-pdf"} />
      </div>
      <Footer />
    </>
  );
}
