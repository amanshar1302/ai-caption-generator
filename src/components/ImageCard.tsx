"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ImageCardProps {
  image: any;
  onClick: () => void;
}

export function ImageCard({ image, onClick }: ImageCardProps) {
  const copyToClipboard = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success("Caption copied to clipboard");
  };

  return (
    <Card 
      className="glass overflow-hidden border-white/5 hover:border-primary/50 transition-all duration-300 group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={image.imageUrl} 
          alt={image.fileName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <Button variant="secondary" size="sm" className="w-full gap-2 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md border-white/10 text-white">
            <Maximize2 className="w-4 h-4" />
            View Details
          </Button>
        </div>
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          <Badge className="bg-primary/20 backdrop-blur-md border-primary/20 text-xs py-0">
            {image.category}
          </Badge>
          <Badge variant="outline" className="bg-black/40 backdrop-blur-md border-white/10 text-white text-[10px] py-0">
            {image.source === 'web' ? 'Web' : 'Google Form'}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-sm font-semibold truncate flex-1">{image.fileName}</h3>
          <span className="text-[10px] text-muted-foreground font-mono">{image.confidence}% conf.</span>
        </div>
        
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {image.descriptiveCaption}
        </p>

        <div className="flex flex-wrap gap-1">
          {image.tags.slice(0, 3).map((tag: string) => (
            <Badge key={tag} variant="secondary" className="bg-white/5 text-[10px] py-0 hover:bg-white/10">
              #{tag}
            </Badge>
          ))}
          {image.tags.length > 3 && (
            <span className="text-[8px] text-muted-foreground self-center ml-1">
              +{image.tags.length - 3} more
            </span>
          )}
        </div>

        <div className="pt-2 flex gap-2">
          <Button 
            size="sm" 
            variant="ghost" 
            className="flex-1 h-8 text-[10px] gap-2 hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground bg-white/5"
            onClick={(e) => copyToClipboard(e, image.descriptiveCaption)}
          >
            <Copy className="w-3 h-3" />
            Copy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
