"use client";

import { useState } from "react";
import PromptInput from "@/components/PromptInput";

export default function Home() {
  const [prompt, setPrompt] = useState("");

  const examples = [
    "A customer feedback form",
    "A job application form",
    "An event registration form"
  ];

  return (
    <main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-center antialiased selection:bg-emerald-500/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute top-[60%] -right-[20%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="max-w-4xl w-full space-y-10 relative z-10">
        <div className="space-y-4">
          <div className="inline-block mb-3 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-sm font-medium">
            AI-Powered Form Builder
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-br from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent drop-shadow-sm pb-2">
            FormPilot
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Describe your form in plain English. AI builds it instantly. Stop dragging and dropping, start generating.
          </p>
        </div>

        <PromptInput prompt={prompt} setPrompt={setPrompt} />

        <div className="pt-8 flex flex-col items-center animate-fade-in-up">
          <p className="text-sm font-medium text-neutral-500 mb-4 uppercase tracking-wider">Try these examples</p>
          <div className="flex flex-wrap justify-center gap-3">
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => setPrompt(ex)}
                className="text-sm px-5 py-2.5 rounded-full border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-sm"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
