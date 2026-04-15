"use client";

import { UploadForm } from "@/components/UploadForm";
import { Sparkles, Zap, Shield, Globe } from "lucide-react";

export default function UploadPage() {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-2 px-3">New Analysis</Badge>
          <h1 className="text-5xl font-black tracking-tight gradient-text">Add Deep Content</h1>
          <p className="text-muted-foreground text-md font-medium max-w-xl">
            Our multi-model pipeline uses ChatGPT-4o Vision and Teachable Machine for ultra-precise image analysis.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <UploadForm />
        </div>

        <div className="space-y-8">
          <div className="glass rounded-3xl p-8 border-white/5 space-y-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Processing Features
            </h3>
            
            <div className="space-y-4">
              <FeatureItem 
                icon={Zap} 
                title="Triple Captioning" 
                desc="Get Factual, Creative, and Accessibility captions for every image." 
              />
              <FeatureItem 
                icon={Shield} 
                title="Automated Tags" 
                desc="Tags are automatically normalized and synced to Google Sheets." 
              />
              <FeatureItem 
                icon={Globe} 
                title="Batch Optimization" 
                desc="Process up to 20 images in parallel with real-time status." 
              />
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-primary/10 border border-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/40 transition-colors" />
            <h4 className="font-bold mb-2 relative z-10">Google Forms Support</h4>
            <p className="text-sm text-primary/80 relative z-10 leading-relaxed mb-4">
              Your Google Forms submissions are piped through the same AI pipeline using n8n automation.
            </p>
            <Button variant="link" className="text-primary p-0 h-auto font-bold group">
              Learn about integration
              <Zap className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-sm font-semibold mb-1">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
