"use client";

import { useState, useRef } from "react";
import { Upload as UploadIcon, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import axios from "axios";
import { cn } from "@/lib/utils";

interface UploadResult {
  fileName: string;
  category?: string;
  descriptive?: string;
  creative?: string;
  tags?: string[];
  error?: string;
  source?: string;
  aiError?: string | null;
}

export function UploadForm() {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const STEPS = [
    "Uploading image...",
    "Classifying content...",
    "Running AI vision pipeline...",
    "Generating captions...",
    "Finalizing results...",
  ];

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setProgress(0);
    setStepIndex(0);
    setResult(null);

    // Advance steps on a timer to give visual feedback during AI processing
    let step = 0;
    const stepDelays = [600, 1200, 2000, 3500]; // ms between steps
    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;
    stepDelays.forEach((delay) => {
      elapsed += delay;
      timers.push(setTimeout(() => {
        step++;
        setStepIndex(step);
        setProgress(Math.min(20 + step * 18, 90));
      }, elapsed));
    });

    const formData = new FormData();
    formData.append("images", file);
    formData.append("name", "Dashboard User");

    try {
      const localGeminiKey = localStorage.getItem("gemini_api_key") || "";
      const localOpenaiKey = localStorage.getItem("openai_api_key") || "";
      const localTmUrl = localStorage.getItem("tm_model_url") || "";

      const { data } = await axios.post("/api/upload", formData, {
        headers: {
          "x-gemini-key": localGeminiKey,
          "x-openai-key": localOpenaiKey,
          "x-tm-model-url": localTmUrl
        },
      });

      timers.forEach(clearTimeout);
      setProgress(100);
      setStepIndex(STEPS.length - 1);

      const res = data.results[0];
      setResult(res);
      toast.success("Analysis complete!");
    } catch (error) {
      timers.forEach(clearTimeout);
      console.error("Upload error:", error);
      toast.error("Failed to process image");
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setPreview(null);
    setProgress(0);
    setStepIndex(0);
  };

  return (
    <div className="space-y-8">
      {/* Upload Box */}
      {!result && (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-xl p-20 transition-all duration-300 flex flex-col items-center justify-center text-center group cursor-pointer",
            isDragActive ? "border-blue-500 bg-blue-50/30" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/10"
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
          onDragLeave={() => setIsDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragActive(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            onChange={(e) => handleFiles(e.target.files)} 
            accept="image/*" 
          />
          
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-6 group-hover:scale-110 transition-transform duration-300">
            <UploadIcon className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Click to upload image</h3>
            <p className="text-sm font-medium text-gray-400">
              PNG, JPG, WEBP up to 10MB
            </p>
          </div>

          {uploading && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl animate-in fade-in duration-300 z-10 p-10">
              <div className="w-full max-w-[260px] space-y-5">
                {/* Spinner + label */}
                <div className="flex items-center gap-3 text-blue-600">
                  <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">
                    {STEPS[stepIndex]}
                  </span>
                </div>

                {/* Progress bar */}
                <Progress value={progress} className="h-1.5 bg-gray-100" />

                {/* Step checklist */}
                <div className="space-y-2">
                  {STEPS.map((step, i) => (
                    <div key={step} className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${
                        i < stepIndex ? "bg-green-500" : i === stepIndex ? "bg-blue-500 animate-pulse" : "bg-gray-100"
                      }`}>
                        {i < stepIndex && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-[10px] font-medium transition-colors duration-300 ${
                        i < stepIndex ? "text-green-600" : i === stepIndex ? "text-blue-600 font-bold" : "text-gray-300"
                      }`}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Result View */}
      {result && (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] animate-in slide-in-from-bottom-4 duration-700 space-y-6">

          {/* Simulator Warning Banner */}
          {result.source?.includes("simulator") && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
              <div className="text-xs leading-relaxed">
                <span className="font-bold block mb-0.5">AI Vision unavailable — showing estimated captions</span>
                The AI vision API could not analyse this specific image (quota exceeded or invalid key). These captions are generated from visual heuristics only, not actual image content. Add a valid Gemini or OpenAI key in Settings to get image-accurate results.
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm relative group">
                <img src={preview!} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 right-4">
                   <Badge className={cn(
                     "border-none shadow-sm backdrop-blur-sm",
                     result.category === "Error" ? "bg-red-500 text-white" : "bg-white/90 text-black"
                   )}>
                     {result.category}
                   </Badge>
                </div>
              </div>
              
              <button 
                onClick={reset}
                className="w-full py-4 border border-dashed border-gray-200 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-400 hover:bg-gray-50 hover:text-black transition-all"
              >
                Upload Another Image
              </button>
            </div>

            <div className="space-y-8 py-4">
              <div className="space-y-3">
                 <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">Detailed Analysis</h4>
                 <p className={cn(
                   "text-2xl font-black leading-tight",
                   result.error ? "text-red-500" : "text-gray-900"
                 )}>
                   {result.descriptive || (result as any).description || (result as any).descriptiveCaption || "No detailed description generated by the pipeline."}
                 </p>
              </div>

              <div className="space-y-3 p-6 bg-gray-50 rounded-xl border border-gray-100">
                 <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Creative Narrative</h4>
                 <p className="text-gray-600 italic leading-relaxed font-medium">"{result.creative || (result as any).creativeCaption || "No creative narrative generated."}"</p>
              </div>

              <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-tighter">
                {result.tags && result.tags.length > 0 ? result.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded">#{tag}</span>
                )) : (
                  <span className="px-2 py-0.5 border border-dashed border-gray-200 text-gray-400 rounded">No tags</span>
                )}
              </div>

              <div className="pt-6 border-t border-gray-50 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest leading-none">
                <span className="flex items-center gap-2 text-gray-300">
                   Processed by{" "}
                   <span className={cn(
                     result.source?.includes("simulator") ? "text-amber-500" : "text-blue-600"
                   )}>
                     {result.source}
                   </span>
                </span>
                <span className={cn(
                  "flex items-center gap-2",
                  result.error ? "text-red-400" : result.source?.includes("simulator") ? "text-amber-400" : "text-green-500/50"
                )}>
                  <CheckCircle2 className="w-3 h-3" />
                  {result.error ? "Pipeline Error" : result.source?.includes("simulator") ? "Fallback Active" : "Pipeline Ready"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
