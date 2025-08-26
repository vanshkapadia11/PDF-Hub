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
import Navbar from "@/components/Navbar";

export default function PasswordProtectPage() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProtecting, setIsProtecting] = useState(true); // true for protect, false for unprotect
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      setFile(droppedFiles[0]);
      setMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    if (isProtecting && !password) {
      setMessage("Please enter a password.");
      return;
    }

    setIsLoading(true);
    setMessage(
      isProtecting ? "Protecting your PDF..." : "Unprotecting your PDF..."
    );

    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);
    formData.append("action", isProtecting ? "protect" : "unprotect");

    try {
      const response = await fetch("/api/password-protect", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const filename = isProtecting
          ? `protected-${file.name}`
          : `unprotected-${file.name}`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setMessage("Success! Your file is ready.");
      } else {
        const errorText = await response.text();
        setMessage(`Error: ${errorText}`);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 text-center">
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
                  Password Protect
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <h1 className="text-4xl font-semibold uppercase">
          PDF Hub - {isProtecting ? "Password Protect" : "Unprotect"}
        </h1>
        <p className="text-xs font-semibold uppercase mt-2 mb-8 text-zinc-600">
          {isProtecting
            ? "Add a password to your PDF document."
            : "Remove the password from your PDF document."}
        </p>

        <div className="flex justify-center space-x-4 mb-6">
          <Button
            variant={isProtecting ? "default" : "outline"}
            onClick={() => {
              setIsProtecting(true);
              setMessage("");
              setFile(null);
              setPassword("");
            }}
          >
            Protect
          </Button>
          <Button
            variant={!isProtecting ? "default" : "outline"}
            onClick={() => {
              setIsProtecting(false);
              setMessage("");
              setFile(null);
              setPassword("");
            }}
          >
            Unprotect
          </Button>
        </div>

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
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="text-sm font-semibold uppercase">
            Click to select or drag & drop a PDF file here
          </p>
        </div>

        {file && (
          <div className="w-full max-w-2xl mt-6 p-4 rounded-lg bg-white shadow-sm text-left border border-green-200">
            <h3 className="text-sm font-semibold uppercase text-gray-700">
              Selected File: <span className="font-normal">{file.name}</span>
            </h3>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl mt-6 space-y-4"
        >
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="password">
              {isProtecting ? "Choose a password" : "Enter the password"}
            </Label>
            <Input
              type="password"
              id="password"
              placeholder="Enter password here"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            disabled={!file || !password || isLoading}
            className="w-full"
          >
            {isLoading
              ? "Processing..."
              : isProtecting
              ? "Protect PDF"
              : "Unprotect PDF"}
          </Button>
        </form>

        {message && (
          <p
            className={cn(
              "mt-4 text-center text-sm font-semibold uppercase",
              message.includes("Error") ? "text-red-600" : "text-green-600"
            )}
          >
            {message}
          </p>
        )}
      </div>
    </>
  );
}
