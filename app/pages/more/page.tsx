"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronsLeftIcon,
  HomeIcon,
  ImageIcon,
  FileTextIcon,
  CombineIcon,
  ScissorsIcon,
  LockIcon,
  LayoutGridIcon,
  PencilIcon,
  DownloadIcon,
  ChevronRightIcon,
  LucideHopOff,
  SplitIcon,
  TableIcon,
  ImagePlusIcon,
  CropIcon,
  ScaleIcon,
  RotateCcwIcon,
  Text,
  FilterIcon,
  Trash2Icon,
  FileSearchIcon,
  AppWindowIcon,
  GanttChartSquareIcon,
  BookAIcon,
} from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const tools = [
  {
    name: "Merge PDF",
    href: "/pages/merge-pdf",
    description: "Combine multiple PDF documents into a single file.",
    icon: <CombineIcon className="h-10 w-10 text-amber-400" />,
  },
  {
    name: "Split PDF",
    href: "/pages/split-pdf",
    description:
      "Split a single PDF file into multiple documents by page ranges.",
    icon: <SplitIcon className="h-10 w-10 text-emerald-400" />,
  },
  {
    name: "Compress PDF",
    href: "/pages/compress-pdf",
    description: "Reduce the file size of your PDFs without losing quality.",
    icon: <DownloadIcon className="h-10 w-10 text-cyan-400" />,
  },
  {
    name: "PDF to Word",
    href: "/pages/pdf-word",
    description: "Convert your PDF files to editable Microsoft Word documents.",
    icon: <FileTextIcon className="h-10 w-10 text-rose-500" />,
  },
  {
    name: "PDF to Excel",
    href: "/pages/pdf-to-excel",
    description: "Turn your PDF tables into a Microsoft Excel spreadsheet.",
    icon: <TableIcon className="h-10 w-10 text-green-500" />,
  },
  {
    name: "PDF to Images",
    href: "/pages/pdf-to-images",
    description: "Convert PDF pages into high-quality image files (JPG, PNG).",
    icon: <ImagePlusIcon className="h-10 w-10 text-indigo-400" />,
  },
  {
    name: "Image to PDF",
    href: "/pages/images-to-pdf",
    description: "Turn one or more images into a single PDF document.",
    icon: <LayoutGridIcon className="h-10 w-10 text-purple-500" />,
  },
  {
    name: "Add Numbers to Pages",
    href: "/pages/add-number-to-pages",
    description: "Automatically number the pages of your PDF document.",
    icon: <BookAIcon className="h-10 w-10 text-blue-400" />,
  },
  {
    name: "Crop Image",
    href: "/pages/crop-image",
    description: "Crop your images to the desired size and aspect ratio.",
    icon: <CropIcon className="h-10 w-10 text-yellow-500" />,
  },
  {
    name: "Resize Image",
    href: "/pages/resize-image",
    description: "Resize your images to custom dimensions or a percentage.",
    icon: <ScaleIcon className="h-10 w-10 text-orange-500" />,
  },
  {
    name: "Convert Image",
    href: "/pages/convert-image",
    description:
      "Convert your images between various formats like JPG, PNG, and WebP.",
    icon: <AppWindowIcon className="h-10 w-10 text-teal-400" />,
  },
  {
    name: "Compress Image",
    href: "/pages/compress-image",
    description: "Reduce the file size of your images for faster loading.",
    icon: <DownloadIcon className="h-10 w-10 text-gray-400" />,
  },
  {
    name: "Rotate Image",
    href: "/pages/rotate-image",
    description:
      "Rotate your image by degrees or flip it horizontally/vertically.",
    icon: <RotateCcwIcon className="h-10 w-10 text-blue-500" />,
  },
  {
    name: "Add Filters to Image",
    href: "/pages/add-filters",
    description: "Apply beautiful filters and effects to your images.",
    icon: <FilterIcon className="h-10 w-10 text-pink-500" />,
  },
  {
    name: "Excel to PDF",
    href: "/pages/excel-to-pdf",
    description: "Convert your Excel spreadsheet into a PDF document.",
    icon: <TableIcon className="h-10 w-10 text-green-600" />,
  },
  {
    name: "Remove PDF Pages",
    href: "/pages/remove-pdf-pages",
    description: "Delete specific pages from a PDF file easily.",
    icon: <Trash2Icon className="h-10 w-10 text-red-500" />,
  },
  {
    name: "Extract PDF Pages",
    href: "/pages/extract-pdf-pages",
    description: "Extract specific pages from a PDF to create a new file.",
    icon: <FileSearchIcon className="h-10 w-10 text-cyan-600" />,
  },
  {
    name: "Organize PDF",
    href: "/pages/organize-pdf",
    description: "Rearrange, delete, or rotate pages within your PDF document.",
    icon: <GanttChartSquareIcon className="h-10 w-10 text-orange-400" />,
  },
];

const MoreToolsPage = () => {
  return (
    <>
      <Navbar />
      <main className="flex-1 p-4 md:p-8 flex flex-col items-center min-h-screen bg-gray-50">
        <div className="w-full max-w-4xl mx-auto text-left">
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
                  All Tools
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <section className="w-full max-w-4xl mx-auto py-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold uppercase mb-4 text-zinc-800">
            All PDF Hub Tools
          </h1>
          <p className="text-md md:text-lg font-semibold text-zinc-600 mb-12">
            Explore our full suite of powerful and easy-to-use tools.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Link key={tool.href} href={tool.href}>
                <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer border border-gray-200">
                  <div className="flex-shrink-0 mb-4">{tool.icon}</div>
                  <h2 className="text-lg font-extrabold uppercase text-zinc-800">
                    {tool.name}
                  </h2>
                  <p className="text-sm text-center text-gray-500 mt-2 font-medium uppercase">
                    {tool.description}
                  </p>
                  <Button
                    variant="link"
                    className="mt-4 text-black font-semibold uppercase text-sm group"
                  >
                    Go to tool
                    <ChevronRightIcon className="h-4 w-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default MoreToolsPage;
