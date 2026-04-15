"use client";

import { useState, useEffect } from "react";
import { ImageCard } from "@/components/ImageCard";
import { ImageModal } from "@/components/ImageModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, SortDesc, RefreshCcw, LayoutGrid, List } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function GalleryPage() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedImage, setSelectedImage] = useState<any>(null);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/images");
      setImages(response.data);
    } catch (error) {
      toast.error("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const filteredImages = images
    .filter((img) => {
      const matchesSearch = 
        img.fileName.toLowerCase().includes(search.toLowerCase()) ||
        img.tags.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase())) ||
        img.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || img.category.toLowerCase() === categoryFilter.toLowerCase();
      const matchesSource = sourceFilter === "all" || img.source === sourceFilter;
      return matchesSearch && matchesCategory && matchesSource;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      if (sortBy === "confidence") return parseFloat(b.confidence) - parseFloat(a.confidence);
      return 0;
    });

  const categories = Array.from(new Set(images.map((img) => img.category)));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight gradient-text mb-2">Image Gallery</h1>
          <p className="text-muted-foreground text-sm font-medium">Browse and search through your AI-captioned history.</p>
        </div>
        <Button onClick={fetchImages} variant="outline" className="glass border-white/10 rounded-xl h-12 px-6 gap-2">
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Sync Data
        </Button>
      </header>

      <div className="flex flex-col lg:flex-row gap-4 p-2 glass rounded-2xl border-white/5 shadow-2xl">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input 
            placeholder="Search by tag, filename or category..." 
            className="pl-11 h-12 bg-white/5 border-none rounded-xl focus:ring-primary/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val || "all")}>
            <SelectTrigger className="w-[160px] h-12 bg-white/5 border-none rounded-xl focus:ring-primary/50">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="glass border-white/10">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={(val) => setSourceFilter(val || "all")}>
            <SelectTrigger className="w-[160px] h-12 bg-white/5 border-none rounded-xl focus:ring-primary/50">
              <LayoutGrid className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent className="glass border-white/10">
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="web">Web App</SelectItem>
              <SelectItem value="google_form">Google Form</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(val) => setSortBy(val || "newest")}>
            <SelectTrigger className="w-[160px] h-12 bg-white/5 border-none rounded-xl focus:ring-primary/50">
              <SortDesc className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="glass border-white/10">
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="confidence">High Confidence</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : filteredImages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((img) => (
            <ImageCard 
              key={img.id || img.fileName} 
              image={img} 
              onClick={() => setSelectedImage(img)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 glass rounded-3xl border-dashed border-white/10">
          <div className="p-6 rounded-full bg-white/5 mb-6 text-muted-foreground">
            <Search className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-bold mb-2">No images found</h3>
          <p className="text-muted-foreground max-w-md text-center">
            Try adjusting your search terms or filters, or upload some new images to get started.
          </p>
        </div>
      )}

      <ImageModal 
        image={selectedImage} 
        isOpen={!!selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />
    </div>
  );
}
