"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Copy, Download, Share2, Tag as TagIcon, BarChart3, Clock, User } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface ImageModalProps {
  image: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageModal({ image, isOpen, onClose }: ImageModalProps) {
  const [rating, setRating] = useState(image?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState(image?.feedback || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!image) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleFeedbackSubmit = async () => {
    setIsSubmitting(true);
    try {
      await axios.post("/api/feedback", {
        fileName: image.fileName,
        rating,
        feedback,
      });
      toast.success("Feedback submitted!");
    } catch (error) {
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 glass border-none gap-0 overflow-hidden">
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Left: Image Preview */}
          <div className="flex-[1.2] bg-black/40 flex items-center justify-center p-6 relative overflow-hidden group">
            <img 
              src={image.imageUrl} 
              alt={image.fileName} 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button size="icon" variant="secondary" className="bg-black/40 backdrop-blur-md border-white/10 text-white rounded-full">
                <Download className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="secondary" className="bg-black/40 backdrop-blur-md border-white/10 text-white rounded-full">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Right: Details */}
          <div className="flex-1 flex flex-col min-h-0 bg-card/10 border-l border-white/5">
            <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
              <header className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/20 text-primary border-primary/20 text-xs px-3">{image.category}</Badge>
                  <Badge variant="outline" className="border-white/10 text-muted-foreground text-[10px]">{image.source === 'web' ? 'Web App' : 'Google Forms'}</Badge>
                </div>
                <DialogTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/50 leading-tight">
                  {image.fileName}
                </DialogTitle>
                <div className="flex items-center gap-6 text-xs text-muted-foreground/60 border-y border-white/5 py-3">
                  <div className="flex items-center gap-2"><User className="w-3.5 h-3.5" /> {image.submitterName}</div>
                  <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {image.timestamp || 'Just now'}</div>
                  <div className="flex items-center gap-2"><BarChart3 className="w-3.5 h-3.5" /> {image.confidence}% Accuracy</div>
                </div>
              </header>

              <Tabs defaultValue="descriptive" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-white/5 p-1 rounded-xl h-11 border border-white/5">
                  <TabsTrigger value="descriptive" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:shadow-lg">Factual</TabsTrigger>
                  <TabsTrigger value="creative" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:shadow-lg">Creative</TabsTrigger>
                  <TabsTrigger value="accessibility" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:shadow-lg">A11y</TabsTrigger>
                </TabsList>
                {(['descriptive', 'creative', 'accessibility'] as const).map((type) => (
                  <TabsContent key={type} value={type} className="mt-6 space-y-4">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 relative group">
                      <p className="text-sm leading-relaxed text-foreground/90 pr-10">
                        {image[`${type}Caption`]}
                      </p>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => copyToClipboard(image[`${type}Caption`])}
                        className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-4">
                  <TagIcon className="w-4 h-4" />
                  Smart Tags
                </div>
                <div className="flex flex-wrap gap-2">
                  {image.tags.map((tag: string) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="bg-white/5 border border-white/5 px-3 py-1 text-xs hover:bg-primary/20 hover:border-primary/30 transition-all cursor-pointer rounded-lg"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold mb-2 block">Caption Quality Rating</div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        onMouseEnter={() => setHoverRating(i)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(i)}
                        className="transition-transform active:scale-95"
                      >
                        <Star 
                          className={`w-6 h-6 transition-colors ${
                            i <= (hoverRating || rating) 
                              ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" 
                              : "text-muted-foreground/30"
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Textarea 
                    placeholder="Describe your feedback (optional)..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="bg-white/5 border-white/10 rounded-xl min-h-[100px] resize-none focus:ring-primary/50"
                  />
                  <Button 
                    className="w-full h-11 rounded-xl font-semibold shadow-lg shadow-primary/10 transition-all hover:shadow-primary/20"
                    onClick={handleFeedbackSubmit}
                    disabled={isSubmitting || rating === 0}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
