"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Key, Save, Trash2, ShieldCheck, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function ApiKeySettings() {
  const [googleKey, setGoogleKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [tmUrl, setTmUrl] = useState("");

  useEffect(() => {
    setGoogleKey(localStorage.getItem("gemini_api_key") || "");
    setOpenaiKey(localStorage.getItem("openai_api_key") || "");
    setTmUrl(localStorage.getItem("tm_model_url") || "");
  }, []);

  const saveKeys = () => {
    localStorage.setItem("gemini_api_key", googleKey);
    localStorage.setItem("openai_api_key", openaiKey);
    localStorage.setItem("tm_model_url", tmUrl);
    toast.success("API Keys saved locally");
    // Force a reload or update context if needed, but for now simple storage is fine
    window.location.reload(); 
  };

  const clearKeys = () => {
    localStorage.removeItem("gemini_api_key");
    localStorage.removeItem("openai_api_key");
    localStorage.removeItem("tm_model_url");
    setGoogleKey("");
    setOpenaiKey("");
    setTmUrl("");
    toast.info("Local API Keys cleared");
    window.location.reload();
  };

  return (
    <Card className="glass border-none shadow-2xl animate-in fade-in zoom-in duration-300">
      <CardHeader className="p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">API Configuration</CardTitle>
            <CardDescription>Manage your personal AI acceleration keys.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-0 space-y-6">
        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-4 items-start">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Your keys are stored **only** in your browser's local storage. They are sent directly to the pipeline and never stored on our servers.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="gemini" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Google Gemini Key</Label>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-1">
                Get Key <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <Input 
              id="gemini" 
              type="password" 
              placeholder="AIzaSy..." 
              value={googleKey} 
              onChange={(e) => setGoogleKey(e.target.value)}
              className="bg-white/5 border-white/10 rounded-xl h-11"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="openai" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">OpenAI API Key (Optional)</Label>
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-1">
                Get Key <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <Input 
              id="openai" 
              type="password" 
              placeholder="sk-..." 
              value={openaiKey} 
              onChange={(e) => setOpenaiKey(e.target.value)}
              className="bg-white/5 border-white/10 rounded-xl h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tm" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Teachable Machine URL</Label>
            <Input 
              id="tm" 
              placeholder="https://teachablemachine.withgoogle.com/models/..." 
              value={tmUrl} 
              onChange={(e) => setTmUrl(e.target.value)}
              className="bg-white/5 border-white/10 rounded-xl h-11"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <Button variant="outline" onClick={clearKeys} className="rounded-xl border-white/5 bg-white/5 hover:bg-destructive/10 hover:text-destructive transition-all">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button onClick={saveKeys} className="rounded-xl shadow-lg shadow-primary/20">
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
