// frontend/app/page.tsx
"use client";

import { useState } from "react";
import axios from "axios";

export default function Sample() {
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      // The URL of your Python backend API
      const response = await axios.post(
        "http://127.0.0.1:8000/api/analyze-resume",
        {
          resume_text: resumeText,
        }
      );
      setAnalysis(response.data.analysis);
    } catch (err: any) {
      console.error("Error calling Python backend:", err);
      setError(err.response?.data?.detail || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-100">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          AI Resume Analyzer
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Paste your resume below and click 'Analyze' to get an AI-powered
          breakdown.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume text here..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md resize-y min-h-[300px]"
            rows={15}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </form>

        {error && (
          <div className="mt-8 p-4 bg-red-100 text-red-600 rounded-md border border-red-300">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {analysis && (
          <div className="mt-8 p-6 bg-gray-50 rounded-md border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Analysis Result
            </h2>
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 bg-white p-4 rounded-md overflow-x-auto">
              {JSON.stringify(analysis, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
