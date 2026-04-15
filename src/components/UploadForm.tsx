"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, X, CheckCircle2, Loader2, FileImage, Sparkles, Terminal } from "lucide-react";
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
}

export function UploadForm() {
  const [name, setName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<UploadResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-4), msg]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    setUploading(true);
    setOverallProgress(0);
    setLogs([]);
    setResults([]);
    
    let completed = 0;
    const total = selectedFiles.length;

    for (const file of selectedFiles) {
      addLog(`Initializing ${file.name}...`);
      
      const formData = new FormData();
      formData.append("name", name);
      formData.append("images", file);

      try {
        addLog(`Analyzing ${file.name} with AI Vision...`);
        const { data } = await axios.post("/api/upload", formData, {
          onUploadProgress: (progressEvent) => {
            const p = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
            // Just for visual effect 
          }
        });

                const res = data.results[0];
                if (res.error) {
                  addLog(`Error: ${res.error}`);
                  setResults(prev => [...prev, { fileName: file.name, error: res.error }]);
                } else {
                  if (res.aiError === "QUOTA_EXCEEDED") {
                    addLog(`Notice: OpenAI Quota reached. Using Smart Simulator for ${file.name}.`);
                  } else {
                    addLog(`Success! Captions generated for ${file.name}.`);
                  }
                  
                  setResults(prev => [...prev, {
                    fileName: res.fileName,
                    category: res.category,
                    descriptive: res.descriptive,
                    creative: res.creative,
                    tags: res.tags,
                    source: res.source,
                    aiError: res.aiError
                  }]);
                }
      } catch (error) {
        addLog(`Failed to process ${file.name}`);
        setResults(prev => [...prev, { fileName: file.name, error: "Network Error" }]);
      }

      completed++;
      setOverallProgress((completed / total) * 100);
    }

    setUploading(false);
    setSelectedFiles([]);
    addLog("Batch processing complete.");
    toast.success("Batch Processing Complete");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-in zoom-in duration-500">
      <Card className="glass border-none shadow-2xl">
        <CardHeader className="p-8">
          <CardTitle className="text-3xl font-bold">Image Pipeline</CardTitle>
          <CardDescription>Configure your batch upload and processing parameters.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-8">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Submitter Name</Label>
            <Input 
              id="name" 
              placeholder="e.g. Marketing Team" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="h-12 bg-white/5 border-none rounded-xl focus:ring-primary/50 text-lg"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Image Assets</Label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center hover:border-primary/50 hover:bg-white/5 transition-all cursor-pointer group"
            >
              <Input 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <p className="text-lg font-bold">Select Images to Process</p>
              <p className="text-sm text-muted-foreground mt-2">Multiple files supported • Max 5MB each</p>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold">Queue ({selectedFiles.length})</h4>
                <Button variant="ghost" size="sm" onClick={() => setSelectedFiles([])} className="text-destructive">Clear All</Button>
              </div>
              <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedFiles.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileImage className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-xs truncate font-medium">{file.name}</span>
                    </div>
                    <X className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-white transition-colors" onClick={() => removeFile(i)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploading && (
            <div className="space-y-4 p-6 rounded-2xl bg-primary/5 border border-primary/20">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  Processing Pipeline...
                </span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2 bg-white/10" />
              
              <div className="bg-black/40 rounded-xl p-4 font-mono text-[10px] space-y-1.5 border border-white/5">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-2 text-primary/80">
                    <span className="opacity-40">[{new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button 
            className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl transition-all" 
            disabled={selectedFiles.length === 0 || uploading}
            onClick={startUpload}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing Assets
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate AI Captions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2 px-2">
          <Terminal className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold tracking-tight">Live Output Preview</h3>
        </div>
        
        <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
          {results.length === 0 && !uploading && (
            <div className="py-20 text-center glass border-none rounded-3xl opacity-50 flex flex-col items-center justify-center px-8 border border-dashed border-white/10">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-bold text-lg mb-2">No Output Generated</p>
              <p className="text-sm text-muted-foreground leading-relaxed">Generated captions and metadata will appear here in real-time as the pipeline processes your images.</p>
            </div>
          )}

          {results.map((res, i) => (
            <div key={i} className="glass border-none rounded-3xl p-6 space-y-4 border border-white/5 animate-in slide-in-from-right duration-500">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <FileImage className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold truncate text-sm">{res.fileName}</h4>
                      {res.aiError === "QUOTA_EXCEEDED" && (
                        <Badge className="bg-orange-500/20 text-orange-400 text-[8px] py-0 px-1.5 h-4 border-none hover:bg-orange-500/30 transition-colors cursor-help" title="OpenAI Quota Reached. Check your billing.">Simulator Active</Badge>
                      )}
                    </div>
                    {res.category && (
                      <Badge variant="secondary" className="bg-primary/20 text-primary text-[10px] py-0 px-2 h-5 mt-1">{res.category}</Badge>
                    )}
                  </div>
                </div>
                <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
              </div>

              {res.error ? (
                <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium">
                  {res.error}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Factual Highlight</p>
                    <p className="text-sm leading-relaxed text-foreground/90">{res.descriptive}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Creative Story</p>
                    <p className="text-sm italic leading-relaxed text-muted-foreground">"{res.creative}"</p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {res.tags?.map(tag => (
                      <Badge key={tag} variant="outline" className="border-white/10 text-[10px] rounded-lg"># {tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {uploading && results.length < selectedFiles.length && (
            <div className="glass border-none rounded-3xl p-12 text-center border-dashed border-primary/20 flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-sm font-medium text-muted-foreground">Streaming results as they generate...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
