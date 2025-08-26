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
import Footer from "@/components/Footer";


export default function ResizeImagePage() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");
  const [resizeMethod, setResizeMethod] = useState("pixels");
  const [pixelsData, setPixelsData] = useState({ width: 800, height: 600 });
  const [percentageData, setPercentageData] = useState(50);
  const [outputFormat, setOutputFormat] = useState("png");
  const fileInputRef = useRef(null);

  // Reset values when method changes
  useEffect(() => {
    if (resizeMethod === "pixels") setPixelsData({ width: 800, height: 600 });
    else setPercentageData(50);
  }, [resizeMethod]);

  // Cleanup object URLs
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

  const handleDragOver = (event) => event.preventDefault();
  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    if (droppedFiles.length > 0 && droppedFiles[0].type.startsWith("image/")) {
      setFile(droppedFiles[0]);
      setDownloadUrl("");
    } else {
      setError("Please drop a valid image file");
    }
  };

  const handlePixelsChange = (e) => {
    const { name, value } = e.target;
    setPixelsData((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const processImage = async () => {
    if (!file) return setError("Please select an image file first.");

    if (
      resizeMethod === "pixels" &&
      (pixelsData.width <= 0 || pixelsData.height <= 0)
    ) {
      return setError("Width and height must be greater than 0.");
    }

    if (
      resizeMethod === "percentage" &&
      (percentageData <= 0 || percentageData > 200)
    ) {
      return setError("Percentage must be between 1 and 200.");
    }

    setIsProcessing(true);
    setError("");
    setDownloadUrl("");

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("method", resizeMethod);
      formData.append("outputFormat", outputFormat);
      if (resizeMethod === "pixels") {
        formData.append("width", pixelsData.width.toString());
        formData.append("height", pixelsData.height.toString());
      } else {
        formData.append("percentage", percentageData.toString());
      }

      const response = await fetch("/api/resize-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      console.error("Error resizing image:", err);
      setError(err.message || "Failed to resize image. Please try again.");
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
                Resize Image
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <h1 className="text-4xl font-semibold uppercase">
        PDF Hub - Resize Image
      </h1>
      <p className="text-xs font-semibold uppercase mt-2 mb-8 text-zinc-600">
        Resize your images by pixels or percentage.
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
          file
            ? "border-green-500 text-green-500"
            : "border-gray-400 text-gray-500 hover:border-blue-500 hover:text-blue-500"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <p className="text-sm font-semibold uppercase">
          Click to select or drag & drop an image here
        </p>
      </div>

      {file && (
        <div className="w-full max-w-2xl mt-6 p-4 rounded-lg bg-white shadow-sm text-left border border-green-200">
          <h3 className="text-sm font-semibold uppercase text-gray-700">
            Selected File: <span className="text-xs font-semibold uppercase text-rose-400">{file.name}</span>
          </h3>
        </div>
      )}

      {file && (
        <div className="w-full max-w-2xl mt-6 p-4 rounded-lg bg-white shadow-sm text-left border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold uppercase">Resizing Options</h2>

          <RadioGroup
            value={resizeMethod}
            onValueChange={setResizeMethod}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pixels" id="pixels" />
              <Label htmlFor="pixels" className="text-sm font-semibold uppercase">By Pixels</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="percentage" id="percentage" />
              <Label htmlFor="percentage" className="text-sm font-semibold uppercase">By Percentage</Label>
            </div>
          </RadioGroup>

          {resizeMethod === "pixels" ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label
                  htmlFor="width"
                  className="text-sm font-semibold uppercase"
                >
                  Width (px)
                </Label>
                <Input
                  type="number"
                  id="width"
                  name="width"
                  value={pixelsData.width}
                  onChange={handlePixelsChange}
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="height"
                  className="text-sm font-semibold uppercase"
                >
                  Height (px)
                </Label>
                <Input
                  type="number"
                  id="height"
                  name="height"
                  value={pixelsData.height}
                  onChange={handlePixelsChange}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <Label
                htmlFor="percentage"
                className="text-sm font-semibold uppercase"
              >
                Percentage (%)
              </Label>
              <Input
                type="number"
                id="percentage"
                name="percentage"
                value={percentageData}
                onChange={(e) => setPercentageData(Number(e.target.value))}
                min="1"
                max="200"
              />
            </div>
          )}

          <div className="mt-4 w-1/2">
            <Label htmlFor="format" className="text-sm font-semibold uppercase">
              Output Format
            </Label>
            <Select
              onValueChange={setOutputFormat}
              value={outputFormat}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpeg">JPEG</SelectItem>
                <SelectItem value="webp">WEBP</SelectItem>
              </SelectContent>
            </Select>
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
            variant={"outline"}
            className="ring-2 ring-inset ring-rose-400 text-sm cursor-pointer font-semibold uppercase"
          >
            {isProcessing ? "Resizing..." : "Resize Image"}
          </Button>
        </div>
      )}

      {downloadUrl && (
        <div className="w-full max-w-2xl mt-6 p-6 rounded-lg bg-white shadow-sm text-center ring-2 ring-inset ring-[#e8e8e8]">
          <h3 className="text-lg font-semibold uppercase mb-4 text-green-700">
            Success!
          </h3>
          <Button variant={"outline"} className="ring-2 ring-inset ring-green-400">

          <a
            href={downloadUrl}
            download={`resized-${file.name}`}
            className="text-sm font-semibold uppercase"
            >
            Download Resized Image
          </a>
            </Button>
        </div>
      )}
</div>
<MoreToolsSidebar currentPage={"/resize-image"} />
    </div>
    <Footer />
    </>
  );
