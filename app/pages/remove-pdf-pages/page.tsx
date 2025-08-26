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
import { Input } from "@/components/ui/input"; // Assuming you have this component
import { CircleXIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import MoreToolsSidebar from "@/components/MoreToolsSidebar";
import Footer from "@/components/Footer";

export default function PDFRemover() {
  const [file, setFile] = useState(null);
  const [pagesToRemove, setPagesToRemove] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setDownloadUrl("");
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }
    if (!pagesToRemove) {
      setError("Please enter pages to remove.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("pagesToRemove", pagesToRemove);

    try {
      const res = await axios.post("/api/remove-pdf-pages", formData, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      setDownloadUrl(url);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "Failed to remove pages. Please try again."
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
                    Remove PDF Pages
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <h1 className="text-4xl font-semibold uppercase">PDF Page Remover</h1>
          <p className="text-xs font-semibold uppercase mt-2 mb-8 text-zinc-600">
            Easily remove pages from your PDF document
          </p>

          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />

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
            <p className="text-xs font-semibold uppercase mt-2 text-zinc-600">
              Accepted format: .pdf
            </p>
          </div>

          {file && (
            <div className="mt-6 w-full max-w-2xl text-left">
              <h3 className="text-lg font-semibold uppercase mb-2">
                Selected File:
              </h3>
              <ul className="bg-white p-4 rounded-lg shadow-sm">
                <li className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <span className="text-sm text-gray-700 font-semibold uppercase">
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

          <div className="mt-6 w-full max-w-2xl">
            <label
              htmlFor="pagesToRemove"
              className="text-sm font-semibold uppercase text-zinc-600"
            >
              Pages to Remove (e.g., 1, 3-5, 8)
            </label>
            <Input
              type="text"
              id="pagesToRemove"
              value={pagesToRemove}
              onChange={(e) => setPagesToRemove(e.target.value)}
              className="mt-2 text-center"
              placeholder="e.g., 1, 3-5, 8"
            />
          </div>

          <div className="mt-8">
            <Button
              onClick={handleSubmit}
              disabled={!file || !pagesToRemove || loading}
              variant={"outline"}
              className={`ring-2 ring-inset ring-rose-400 text-sm cursor-pointer font-semibold uppercase`}
            >
              {loading ? "Removing Pages..." : "Remove Pages"}
            </Button>
          </div>

          {error && (
            <p className="text-red-500 text-sm font-semibold mt-4">{error}</p>
          )}

          {downloadUrl && (
            <>
              <Separator className="mt-8 w-full max-w-2xl" />
              <div className="mt-8 w-full max-w-2xl p-6 bg-green-50 border border-green-300 rounded-lg text-center">
                <h3 className="text-lg font-semibold uppercase mb-4 text-green-700">
                  Pages removed successfully!
                </h3>
                <Button
                  variant={"outline"}
                  className="ring-2 ring-inset ring-green-500"
                >
                  <a
                    href={downloadUrl}
                    download="modified-document.pdf"
                    className="text-sm font-semibold uppercase text-green-700"
                  >
                    Download The PDF
                  </a>
                </Button>
              </div>
            </>
          )}
        </div>
        <MoreToolsSidebar currentPage={"/remove-pdf-pages"} />
      </div>
      <Footer />
    </>
  );
}
