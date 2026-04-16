"use client";

import { useState, useRef } from "react";
import { Upload as UploadIcon, Loader2, Image as ImageIcon, CheckCircle2, Search } from "lucide-react";
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
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setResult(null);
    setLogs(["Initializing upload..."]);

    const formData = new FormData();
    formData.append("images", file);
    formData.append("name", "Dashboard User");

    try {
      // Get local keys for header-based bypass
      const localGeminiKey = localStorage.getItem("gemini_api_key") || "";
      const localOpenaiKey = localStorage.getItem("openai_api_key") || "";
      const localTmUrl = localStorage.getItem("tm_model_url") || "";

      setLogs(prev => [...prev, "Extracting features...", "Starting AI vision pipeline..."]);

      const { data } = await axios.post("/api/upload", formData, {
        headers: {
          "x-gemini-key": localGeminiKey,
          "x-openai-key": localOpenaiKey,
          "x-tm-model-url": localTmUrl
        },
        onUploadProgress: (progressEvent) => {
          const p = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
          setProgress(p);
        }
      });

      setLogs(prev => [...prev, "Analysis complete. Waiting for validation..."]);
      const res = data.results[0];
      setResult(res);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to process image");
      setLogs(prev => [...prev, "Critical Error: Processing failed"]);
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setPreview(null);
    setProgress(0);
    setLogs([]);
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
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl animate-in fade-in duration-300 z-10 p-10">
              <div className="w-full max-w-[280px] space-y-6">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-blue-600">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Analyzing...
                  </span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-1.5 bg-gray-100" />
                
                {/* Live Logs */}
                <div className="bg-gray-50 rounded-lg p-3 font-mono text-[9px] text-left space-y-1 text-gray-500 border border-gray-100 max-h-20 overflow-hidden">
                  {logs.map((log, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-blue-500 opacity-50">›</span>
                      <span>{log}</span>
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
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] animate-in slide-in-from-bottom-4 duration-700">
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

              <div className="pt-6 border-t border-gray-50 flex items-center justify-between text-[10px] font-bold text-gray-300 uppercase tracking-widest leading-none">
                <span className="flex items-center gap-2">
                   Processed by <span className="text-blue-600">{result.source}</span>
                </span>
                <span className={cn(
                  "flex items-center gap-2",
                  result.error ? "text-red-400" : "text-green-500/50"
                )}>
                  <CheckCircle2 className="w-3 h-3" />
                  {result.error ? "Pipeline Error" : "Pipeline Ready"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
