"use client";

import { useState, useRef, useEffect } from "react";
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
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Navbar from "@/components/Navbar";
import MoreToolsSidebar from "@/components/MoreToolsSidebar";
import Footer from "@/components/Footer";

// Component for a single draggable page
// Now accepts a 'preview' prop
function SortablePage({ id, pageNumber, preview }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative w-40 h-56 border border-gray-300 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing bg-white shadow-lg flex-shrink-0"
    >
      {preview ? (
        <img
          src={preview}
          alt={`Page ${pageNumber} preview`}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <span className="text-xl font-bold text-gray-400">Loading...</span>
        </div>
      )}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white rounded-full px-2 py-1 shadow-md">
        <span className="text-sm font-semibold">{pageNumber}</span>
      </div>
    </div>
  );
}

export default function PDFOrganizer() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const fileInputRef = useRef(null);
  const [pdfjs, setPdfjs] = useState(null);
  const [isPdfjsLoaded, setIsPdfjsLoaded] = useState(false);

  // Dynamically import pdfjs-dist on client side
  useEffect(() => {
    const loadPdfjs = async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
        setPdfjs(pdfjsLib);
        setIsPdfjsLoaded(true); // Set state to true on successful load
      } catch (error) {
        console.error("Failed to load PDF.js:", error);
        setError("Failed to load PDF viewer. Please refresh the page.");
      }
    };

    loadPdfjs();
  }, []);

  const renderPagePreviews = async (pdfDoc) => {
    const previewPromises = [];
    const scale = 0.5; // Controls the size of the preview image

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      previewPromises.push(
        (async () => {
          const page = await pdfDoc.getPage(i);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          const canvasContext = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext, viewport }).promise;
          return canvas.toDataURL("image/jpeg");
        })()
      );
    }
    return Promise.all(previewPromises);
  };

  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError("");
      setDownloadUrl("");
      setPages([]);
      setLoading(true);

      try {
        if (!isPdfjsLoaded) {
          throw new Error("PDF viewer is still loading. Please wait a moment.");
        }

        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;

        const previews = await renderPagePreviews(pdf);
        const initialPages = Array.from({ length: numPages }, (_, i) => ({
          id: `page-${i + 1}`,
          pageNumber: i + 1,
          preview: previews[i],
        }));

        setPages(initialPages);
      } catch (error) {
        console.error("Error processing PDF:", error);
        let numPages = Math.max(1, Math.floor(selectedFile.size / 50000));
        const initialPages = Array.from({ length: numPages }, (_, i) => ({
          id: `page-${i + 1}`,
          pageNumber: i + 1,
          preview: null, // No preview if an error occurs
        }));
        setPages(initialPages);
        setError(
          "Could not process PDF completely, but you can still reorder pages. The page count might be an estimate."
        );
      } finally {
        setLoading(false);
      }
    } else {
      setFile(null);
      setPages([]);
      setError("Please select a valid PDF file.");
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setDownloadUrl("");
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }
    if (pages.length === 0) {
      setError("No pages to organize.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("pdf", file);
    const newOrder = pages.map((p) => p.pageNumber).join(",");
    formData.append("newOrder", newOrder);

    try {
      const res = await axios.post("/api/organize-pdf", formData, {
        responseType: "blob",
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      setDownloadUrl(url);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          "Failed to organize PDF pages. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      handleFileSelect({ target: { files: [droppedFile] } });
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
    setPages([]);
    setDownloadUrl("");
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
                  <BreadcrumbLink href="/">
                    <span className="text-sm font-semibold uppercase cursor-pointer">
                      Home
                    </span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-sm font-semibold uppercase">
                    Organize PDF
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <h1 className="text-4xl font-semibold uppercase">PDF Organizer</h1>
          <p className="text-xs font-semibold uppercase mt-2 mb-8 text-zinc-600">
            Reorder pages in your PDF document
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
            {!isPdfjsLoaded && (
              <p className="text-sm font-semibold mt-4 text-blue-500">
                Loading PDF viewer...
              </p>
            )}
          </div>

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
                    aria-label="Remove file"
                  >
                    <CircleXIcon className="h-5 w-5" />
                  </button>
                </li>
              </ul>
            </div>
          )}

          {pages.length > 0 && (
            <div className="mt-6 w-full max-w-2xl">
              <h3 className="text-lg font-semibold uppercase mb-4">
                Drag and drop pages to reorder ({pages.length} pages)
              </h3>
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={pages.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-wrap gap-4 justify-center">
                    {pages.map((page) => (
                      <SortablePage
                        key={page.id}
                        id={page.id}
                        pageNumber={page.pageNumber}
                        preview={page.preview}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          <div className="mt-8">
            <Button
              onClick={handleSubmit}
              disabled={
                !file || pages.length === 0 || loading || !isPdfjsLoaded
              }
              variant={"outline"}
              className={`ring-2 ring-inset ring-rose-400 text-sm cursor-pointer font-semibold uppercase`}
            >
              {loading ? "Organizing PDF..." : "Organize PDF"}
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
                  PDF organized successfully!
                </h3>
                <Button
                  variant={"outline"}
                  className="ring-2 ring-inset ring-green-500"
                >
                  <a
                    href={downloadUrl}
                    download="organized-document.pdf"
                    className="text-sm font-semibold uppercase text-green-700"
                  >
                    Download The PDF
                  </a>
                </Button>
              </div>
            </>
          )}
        </div>
        <MoreToolsSidebar currentPage={"/organize-pdf"} />
      </div>
      <Footer />
    </>
  );
}
