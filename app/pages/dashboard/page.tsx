"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion, stagger, useAnimate } from "framer-motion";
import {
  Image as ImageIcon,
  MergeIcon,
  SplitIcon,
  CropIcon,
  RotateCcwIcon,
  ScanSearchIcon,
  PencilRulerIcon,
  FireExtinguisher,
  Code2,
  LucideKeySquare,
  ClosedCaption,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Floating, {
  FloatingElement,
} from "@/components/fancy/image/parallax-floating";

const tools = [
  {
    name: "Merge PDF",
    description: "Combine multiple PDF files into one single document.",
    icon: (
      <MergeIcon className="h-12 w-12 text-rose-500 group-hover:text-white transition-colors duration-300" />
    ),
    href: "/merge-pdf",
  },
  {
    name: "Split PDF",
    description: "Extract specific pages or page ranges from a PDF.",
    icon: (
      <SplitIcon className="h-12 w-12 text-rose-500 group-hover:text-white transition-colors duration-300" />
    ),
    href: "/split-pdf",
  },
  {
    name: "Compress PDF",
    description: "Reduce the file size of your PDF documents.",
    icon: (
      <FireExtinguisher className="h-12 w-12 text-rose-500 group-hover:text-white transition-colors duration-300" />
    ),
    href: "/compress-pdf",
  },
  {
    name: "PDF to JPG",
    description: "Convert each page of your PDF into high-quality JPG images.",
    icon: (
      <ImageIcon className="h-12 w-12 text-rose-500 group-hover:text-white transition-colors duration-300" />
    ),
    href: "/pdf-to-jpg",
  },
  {
    name: "Rotate & Flip Image",
    description: "Easily rotate or flip your images for perfect orientation.",
    icon: (
      <RotateCcwIcon className="h-12 w-12 text-rose-500 group-hover:text-white transition-colors duration-300" />
    ),
    href: "/rotate-image",
  },
  {
    name: "Crop Image",
    description: "Crop your images to a specific size or aspect ratio.",
    icon: (
      <CropIcon className="h-12 w-12 text-rose-500 group-hover:text-white transition-colors duration-300" />
    ),
    href: "/crop-image",
  },
  {
    name: "OCR PDF",
    description: "Convert scanned PDFs into searchable and editable text.",
    icon: (
      <ScanSearchIcon className="h-12 w-12 text-rose-500 group-hover:text-white transition-colors duration-300" />
    ),
    href: "/convert-image",
  },
  {
    name: "PDF Editor",
    description: "Edit PDF content, add text, images, and annotations.",
    icon: (
      <PencilRulerIcon className="h-12 w-12 text-rose-500 group-hover:text-white transition-colors duration-300" />
    ),
    href: "/edit-pdf",
  },
];

const ToolCard = ({ name, description, icon, href }) => (
  <Link href={href} className="group">
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 rounded-xl shadow-lg border border-gray-200 bg-white transition-all duration-300 ease-in-out",
        "hover:bg-rose-500 hover:shadow-2xl hover:border-rose-500 transform hover:-translate-y-2 cursor-pointer"
      )}
    >
      <div className="flex-shrink-0 mb-4">{icon}</div>
      <h3 className="text-xl font-bold uppercase text-gray-800 group-hover:text-white text-center transition-colors duration-300">
        {name}
      </h3>
      <p className="text-sm font-medium text-center mt-2 text-zinc-600 group-hover:text-rose-100 transition-colors duration-300 uppercase">
        {description}
      </p>
    </div>
  </Link>
);

const FloatingIcon = motion(({ icon: Icon, ...props }) => <Icon {...props} />, {
  forwardMotionProps: true,
});

const LandingPage = () => {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    animate(
      "svg",
      { opacity: [0, 1] },
      { duration: 0.5, delay: stagger(0.15) }
    );
  }, [animate]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 bg-dots-pattern">
        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
          {/* Hero Section with Parallax Background */}
          <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
            {/* Parallax Icons in Background */}
            <div className="absolute inset-0 w-full h-full" ref={scope}>
              <Floating>
                <FloatingElement
                  depth={1}
                  className="top-[20%] left-[5%] opacity-10"
                >
                  <FloatingIcon
                    icon={LucideKeySquare}
                    className="w-24 h-24 text-rose-500"
                  />
                </FloatingElement>
                <FloatingElement
                  depth={2}
                  className="top-[75%] left-[80%] opacity-10"
                >
                  <FloatingIcon
                    icon={Code2}
                    className="w-24 h-24 text-rose-500"
                  />
                </FloatingElement>
                <FloatingElement
                  depth={4}
                  className="top-[60%] left-[25%] opacity-10"
                >
                  <FloatingIcon
                    icon={ClosedCaption}
                    className="w-28 h-28 text-rose-500"
                  />
                </FloatingElement>
                <FloatingElement
                  depth={3}
                  className="top-[45%] left-[50%] opacity-10"
                >
                  <FloatingIcon
                    icon={MergeIcon}
                    className="w-24 h-24 text-rose-500"
                  />
                </FloatingElement>
                <FloatingElement
                  depth={5}
                  className="top-[30%] left-[75%] opacity-10"
                >
                  <FloatingIcon
                    icon={SplitIcon}
                    className="w-24 h-24 text-rose-500"
                  />
                </FloatingElement>
              </Floating>
            </div>

            {/* Main Hero Content */}
            <div className="relative z-10 w-full max-w-4xl text-center">
              <div className="bg-white/50 backdrop-blur-sm p-8 rounded-xl">
                <h1 className="text-5xl md:text-6xl font-extrabold uppercase leading-tight text-gray-800 tracking-wide drop-shadow-md">
                  Welcome to <span className="text-rose-500">PDF Hub</span>
                </h1>
                <p className="mt-4 text-medium md:text-lg font-medium text-zinc-600 drop-shadow-sm uppercase">
                  All the tools you need to manage your documents and images, in
                  one powerful and easy-to-use platform.
                </p>
              </div>
              <Separator className="my-12 bg-gray-300" />
            </div>
          </div>

          {/* Tools Section */}
          <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
            {tools.map((tool, index) => (
              <ToolCard
                key={index}
                name={tool.name}
                description={tool.description}
                icon={tool.icon}
                href={tool.href} // Fix: Removed extra "/pages" prefix
              />
            ))}
          </div>

          <div className="w-full max-w-4xl mt-16 text-center">
            <h2 className="text-2xl font-bold uppercase text-gray-800">
              Ready to get started?
            </h2>
            <p className="text-base font-medium mt-2 text-zinc-600 uppercase">
              Select a tool above to begin your task effortlessly.
            </p>
            <Button
              asChild
              className="mt-6 text-sm font-semibold uppercase ring-2 ring-inset ring-rose-400 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors duration-300"
              variant={"outline"}
            >
              <Link href="/merge-pdf">Start with Merge PDF</Link>
            </Button>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default LandingPage;
