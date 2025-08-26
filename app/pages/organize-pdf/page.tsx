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
import {
  CircleXIcon,
  Loader2Icon,
  CheckCircle2Icon,
  GripVerticalIcon,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
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
import Image from "next/image";

// Component for a single draggable page
function SortablePage({ page, removePage }) {
  const { id, pageNumber, preview } = page;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative w-40 h-56 border border-gray-300 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing bg-white shadow-md flex-shrink-0 transition-all duration-200",
        isDragging && "shadow-xl border-blue-500"
      )}
    >
      <div
        className="absolute top-2 left-2 p-1 rounded-full bg-white/70 backdrop-blur-sm shadow-md cursor-grab"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="h-4 w-4 text-gray-600" />
      </div>

      <div className="absolute top-2 right-2 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removePage(id)}
          className="p-1 h-auto text-red-500 hover:bg-red-50 hover:text-red-700 transition-all rounded-full"
        >
          <CircleXIcon className="h-5 w-5" />
        </Button>
      </div>

      {preview ? (
        <Image
          src={preview}
          alt={`Page ${pageNumber} preview`}
          className="w-full h-full object-cover pointer-events-none"
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full bg-gray-100">
          <Loader2Icon className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 shadow-md">
        <span className="text-sm font-semibold text-gray-700">
          Page {pageNumber}
        </span>
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
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const [pdfjs, setPdfjs] = useState(null);
  const [isPdfjsLoaded, setIsPdfjsLoaded] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    const loadPdfjs = async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
        setPdfjs(pdfjsLib);
        setIsPdfjsLoaded(true);
      } catch (error) {
        console.error("Failed to load PDF.js:", error);
        setError("Failed to load PDF viewer. Please refresh the page.");
      }
    };
    loadPdfjs();
  }, []);

  const renderPagePreviews = async (pdfDoc) => {
    const previewPromises = [];
    const scale = 0.5;

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      previewPromises.push(
        (async () => {
          try {
            const page = await pdfDoc.getPage(i);
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement("canvas");
            const canvasContext = canvas.getContext("2d");
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext, viewport }).promise;
            return canvas.toDataURL("image/jpeg");
          } catch (err) {
            console.error(`Error rendering page ${i}:`, err);
            return null;
          }
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
        const initialPages = previews.map((preview, i) => ({
          id: `${i + 1}-${selectedFile.name}`,
          pageNumber: i + 1,
          preview: preview,
        }));

        setPages(initialPages);
      } catch (error) {
        console.error("Error processing PDF:", error);
        setError(
          "Could not process PDF completely. The page previews may not be available, but you can still reorder based on page numbers."
        );
        // Fallback to a simple page list if preview fails
        const numPages = Math.max(1, Math.floor(selectedFile.size / 50000));
        const initialPages = Array.from({ length: numPages }, (_, i) => ({
          id: `${i + 1}-${selectedFile.name}`,
          pageNumber: i + 1,
          preview: null,
        }));
        setPages(initialPages);
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
    setDragActive(false);
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
    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragActive(false);
  };

  const removeFile = () => {
    setFile(null);
    setPages([]);
    setDownloadUrl("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePage = (idToRemove) => {
    setPages((prevPages) => prevPages.filter((page) => page.id !== idToRemove));
    setError("");
    setDownloadUrl("");
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
              {pages.length > 0 ? "Organizing PDF..." : "Loading PDF..."}
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
                    Organize PDF
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <h1 className="text-4xl font-extrabold uppercase mt-6">
            PDF Hub - PDF Organizer
          </h1>
          <p className="text-xs font-semibold uppercase mt-2 mb-8 text-zinc-600">
            Reorder, delete, and manage pages in your PDF document.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Drag & Drop Zone */}
          {!file && (
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
              <p className="text-sm font-semibold uppercase">
                Click to select or drag & drop a PDF file here
              </p>
              <p className="text-xs font-semibold uppercase mt-2 text-zinc-600">
                Accepted format: .pdf
              </p>
              {!isPdfjsLoaded && (
                <p className="text-sm font-semibold mt-4 text-blue-500 animate-pulse">
                  Loading PDF viewer...
                </p>
              )}
            </div>
          )}

          {/* Organizer UI */}
          {file && (
            <div className="w-full max-w-2xl mt-8 p-6 rounded-xl bg-white shadow-lg border border-gray-200 space-y-6">
              <div className="flex items-center justify-between text-left">
                <div className="flex items-center space-x-2">
                  <CheckCircle2Icon className="w-5 h-5 text-green-500" />
                  <p className="text-sm font-semibold uppercase">
                    File Selected:{" "}
                    <span className="font-normal text-gray-700">
                      {file.name}
                    </span>
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="p-1 h-auto text-red-500 hover:bg-red-50 hover:text-red-700 transition-all"
                >
                  <CircleXIcon className="h-5 w-5" />
                </Button>
              </div>

              <Separator />

              {pages.length > 0 && (
                <div className="text-left">
                  <h3 className="text-lg font-semibold uppercase mb-4">
                    Drag and drop pages to reorder ({pages.length} pages)
                  </h3>
                  <div className="flex flex-col items-center">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={pages.map((p) => p.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="w-full flex flex-wrap gap-4 justify-center md:justify-start max-h-[60vh] overflow-y-auto p-2">
                          {pages.map((page) => (
                            <SortablePage
                              key={page.id}
                              page={page}
                              removePage={removePage}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                </div>
              )}

              {pages.length > 0 && (
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !isPdfjsLoaded}
                    variant={"outline"}
                    className="ring-2 ring-inset ring-rose-400 text-sm font-semibold uppercase"
                  >
                    {loading ? (
                      <>
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                        Organizing...
                      </>
                    ) : (
                      "Organize PDF"
                    )}
                  </Button>
                </div>
              )}
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
                PDF Organized Successfully!
              </h3>
              <p className="text-sm font-semibold uppercase text-zinc-600">
                Your reorganized PDF is ready to download.
              </p>
              <Button
                variant={"outline"}
                className="mt-4 ring-2 ring-inset ring-green-500"
              >
                <a
                  href={downloadUrl}
                  download="organized-document.pdf"
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
          <MoreToolsSidebar currentPage={"/organize-pdf"} />
        </aside>
      </div>
      <Footer />
    </>
  );
}
