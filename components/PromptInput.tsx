"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "./ProgressBar";

interface PromptInputProps {
  prompt: string;
  setPrompt: (value: string) => void;
}

export default function PromptInput({ prompt, setPrompt }: PromptInputProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Generate Schema
      const generateRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      
      const generateData = await generateRes.json();
      
      if (!generateRes.ok) {
        throw new Error(generateData.error || "Failed to generate form schema");
      }
      
      const { schema } = generateData;
      
      // 2. Save Form
      const formsRes = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: schema.title,
          description: schema.description,
          fields: schema.fields
        })
      });
      
      const formsData = await formsRes.json();
      
      if (!formsRes.ok) {
        throw new Error(formsData.error || "Failed to save the form");
      }
      
      // 3. Navigate to Builder
      router.push(`/builder/${formsData.formId}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ProgressBar loading={isLoading} />
      <div className="w-full max-w-2xl mx-auto bg-neutral-900 rounded-2xl shadow-xl overflow-hidden border border-neutral-800/60 mt-8 transition-all hover:border-neutral-700/80 hover:shadow-emerald-900/10">
      <div className="p-4 sm:p-6">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the form you want to create... e.g. 'A job application form for a software engineer role'"
          className="w-full bg-neutral-950 border border-neutral-800 text-neutral-100 rounded-xl p-4 min-h-[140px] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none transition-all placeholder:text-neutral-600 text-lg sm:text-base leading-relaxed"
          disabled={isLoading}
        />
        
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm text-left flex items-start space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
      </div>
      
      <div className="bg-neutral-950/80 px-4 py-4 sm:px-6 flex justify-between items-center border-t border-neutral-800/60">
        <p className="text-xs text-neutral-500 hidden sm:block">
          Powered by Gemini AI
        </p>
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="inline-flex w-full sm:w-auto items-center justify-center px-6 py-2.5 font-medium text-white transition-colors bg-emerald-600 rounded-xl hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
        >
          {isLoading ? (
            <>
              <svg className="w-5 h-5 mr-3 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Form...
            </>
          ) : (
            <>
              <span>Generate Form</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </div>
      </div>
    </>
  );
}
