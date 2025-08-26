// Frontend Component: CompressPDF.jsx
"use client";
import { useState, useRef } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import MoreToolsSidebar from "@/components/MoreToolsSidebar";
import Footer from "@/components/Footer";

export default function CompressPDF() {
  const [file, setFile] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");
  const [compressionType, setCompressionType] = useState("preset");
  const [compressionLevel, setCompressionLevel] = useState("medium");
  const [customQuality, setCustomQuality] = useState(75);
  const [removeMetadata, setRemoveMetadata] = useState(true);
  const [downsampleImages, setDownsampleImages] = useState(true);
  const [targetSize, setTargetSize] = useState("");
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [compressionDetails, setCompressionDetails] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    setError("");
    const selectedFile = event.target.files[0];

    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setOriginalSize(selectedFile.size);
      setCompressedSize(0);
      setDownloadUrl("");
      setCompressionDetails(null);
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
      setOriginalSize(droppedFiles[0].size);
      setCompressedSize(0);
      setDownloadUrl("");
      setCompressionDetails(null);
      event.dataTransfer.clearData();
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const compressPDF = async () => {
    if (!file) {
      setError("Please select a PDF file first");
      return;
    }

    setIsCompressing(true);
    setError("");
    setDownloadUrl("");
    setCompressedSize(0);
    setCompressionDetails(null);

    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("compressionType", compressionType);

      if (compressionType === "preset") {
        formData.append("compressionLevel", compressionLevel);
      } else if (compressionType === "custom") {
        formData.append("customQuality", customQuality.toString());
        formData.append("removeMetadata", removeMetadata.toString());
        formData.append("downsampleImages", downsampleImages.toString());
      } else if (compressionType === "target") {
        formData.append("targetSize", targetSize);
      }

      const response = await fetch("/api/compress-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setCompressedSize(blob.size);

      setCompressionDetails({
        originalSize: file.size,
        compressedSize: blob.size,
        reduction: Math.round(((file.size - blob.size) / file.size) * 100),
      });
    } catch (error) {
      console.error("Error compressing PDF:", error);
      setError(error.message || "Failed to compress PDF. Please try again.");
    } finally {
      setIsCompressing(false);
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
                    Compress PDF
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <h1 className="text-4xl font-semibold uppercase">
            PDF Hub - Compress PDF
          </h1>
          <p className="text-xs font-semibold uppercase mt-2 mb-8 text-zinc-600">
            Reduce the file size of your PDF while maintaining quality
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
              "w-full max-w-2xl h-48 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors cursor-pointer",
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
              <p className="text-xs font-semibold uppercase text-zinc-600">
                Original size: {formatFileSize(originalSize)}
              </p>
            </div>
          )}

          {/* Compression Options */}
          {file && (
            <div className="w-full max-w-2xl mt-6 p-4 rounded-lg bg-white shadow-sm text-left border border-gray-200">
              <Tabs
                defaultValue="preset"
                className="w-full"
                onValueChange={setCompressionType}
              >
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger
                    value="preset"
                    className="text-sm font-semibold uppercase"
                  >
                    Preset Levels
                  </TabsTrigger>
                  <TabsTrigger
                    value="custom"
                    className="text-sm font-semibold uppercase"
                  >
                    Custom Quality
                  </TabsTrigger>
                  <TabsTrigger
                    value="target"
                    className="text-sm font-semibold uppercase"
                  >
                    Target Size
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="preset">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase mb-4">
                      Select Compression Level:
                    </h3>
                    <RadioGroup
                      defaultValue="medium"
                      onValueChange={setCompressionLevel}
                    >
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="low" id="r1" />
                        <Label
                          htmlFor="r1"
                          className="text-sm font-semibold uppercase cursor-pointer"
                        >
                          Low (Best quality, larger file)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="medium" id="r2" />
                        <Label
                          htmlFor="r2"
                          className="text-sm font-semibold uppercase cursor-pointer"
                        >
                          Medium (Balanced quality and size)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="high" id="r3" />
                        <Label
                          htmlFor="r3"
                          className="text-sm font-semibold uppercase cursor-pointer"
                        >
                          High (Smaller file, good quality)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="maximum" id="r4" />
                        <Label
                          htmlFor="r4"
                          className="text-sm font-semibold uppercase cursor-pointer"
                        >
                          Maximum (Smallest file, lower quality)
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </TabsContent>

                <TabsContent value="custom">
                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-semibold uppercase mb-2 block">
                        Quality Level: {customQuality}%
                      </Label>
                      <Slider
                        value={[customQuality]}
                        onValueChange={(value) => setCustomQuality(value[0])}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>Lower Quality</span>
                        <span>Better Quality</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <Label
                        htmlFor="metadata"
                        className="text-sm font-semibold uppercase cursor-pointer"
                      >
                        Remove Metadata
                      </Label>
                      <Switch
                        id="metadata"
                        checked={removeMetadata}
                        onCheckedChange={setRemoveMetadata}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <Label
                        htmlFor="downsample"
                        className="text-sm font-semibold uppercase cursor-pointer"
                      >
                        Downsample Images
                      </Label>
                      <Switch
                        id="downsample"
                        checked={downsampleImages}
                        onCheckedChange={setDownsampleImages}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="target">
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold uppercase mb-2 block">
                      Target File Size (MB)
                    </Label>
                    <Input
                      type="number"
                      placeholder="Enter target size in MB"
                      value={targetSize}
                      onChange={(e) => setTargetSize(e.target.value)}
                      className="w-full text-sm font-semibold uppercase"
                      min="0.1"
                      step="0.1"
                    />
                    <p className="text-xs text-muted-foreground font-semibold uppercase">
                      Current size: {formatFileSize(originalSize)}
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 w-full max-w-2xl p-4 rounded-lg bg-red-50 border border-red-300 text-red-600 text-sm font-semibold uppercase">
              <p>{error}</p>
            </div>
          )}

          {/* Compress Button */}
          {file && (
            <div className="mt-8">
              <Button
                onClick={compressPDF}
                disabled={isCompressing}
                variant={"outline"}
                className="ring-2 ring-inset ring-rose-400 text-sm cursor-pointer font-semibold uppercase"
              >
                {isCompressing ? "Compressing..." : "Compress PDF"}
              </Button>
            </div>
          )}

          {/* Results */}
          {compressionDetails && (
            <>
              <Separator className="mt-8 w-full max-w-2xl" />
              <div className="w-full max-w-2xl mt-6 p-6 rounded-lg bg-white shadow-sm text-left border border-green-200">
                <h3 className="text-lg font-semibold uppercase mb-4">
                  Compression Results:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-semibold uppercase text-gray-700">
                      Original:
                    </span>
                    <span className="text-xs font-semibold uppercase text-blue-500">
                      {formatFileSize(compressionDetails.originalSize)}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-semibold uppercase text-gray-700">
                      Compressed:
                    </span>
                    <span className="text-xs font-semibold uppercase text-green-500">
                      {formatFileSize(compressionDetails.compressedSize)}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-semibold uppercase text-gray-700">
                      Reduction:
                    </span>
                    <span className="text-xs font-semibold uppercase text-amber-800">
                      {compressionDetails.reduction}% smaller
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Download Link */}
          {downloadUrl && (
            <div className="mt-8 w-full max-w-2xl text-center">
              <Button
                variant={"outline"}
                className="ring-2 ring-inset ring-green-500"
              >
                <a
                  href={downloadUrl}
                  download={`compressed-${file.name}`}
                  className="text-sm font-semibold uppercase"
                >
                  Download Compressed PDF
                </a>
              </Button>
            </div>
          )}
        </div>
        <MoreToolsSidebar currentPage={"/compress-pdf"} />
      </div>
      <Footer />
    </>
  );
}
