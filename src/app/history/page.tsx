"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function CaptionHistory() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data } = await axios.get("/api/images");
        setImages(data);
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="space-y-2">
        <h2 className="text-4xl font-extrabold tracking-tight text-black">
          Caption History
        </h2>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input 
          placeholder="Search captions..." 
          className="pl-12 h-14 bg-white border border-gray-100 rounded-lg text-base shadow-sm focus:ring-1 focus:ring-blue-500/20 transition-all"
        />
      </div>

      <div className="bg-white/50 rounded-xl min-h-[400px] flex flex-col items-center justify-center border border-dashed border-gray-200 p-20">
        {loading ? (
          <div className="text-gray-400 font-medium">Loading history...</div>
        ) : images.length > 0 ? (
          <div className="w-full grid grid-cols-1 gap-4">
            {images.map((img: any) => (
              <div key={img.id} className="flex gap-6 p-6 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none font-bold uppercase tracking-tighter text-[10px] px-2">
                      {img.category}
                    </Badge>
                    <span className="text-xs text-gray-400 font-medium">{new Date(img.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-900 font-bold leading-snug">{img.descriptiveCaption || img.description || img.descriptive || "No description logged"}</p>
                  <p className="text-gray-500 text-sm italic">{img.creativeCaption || img.creative || ""}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center space-y-2">
             <Search className="w-10 h-10 text-gray-200 mx-auto mb-4" />
             <p className="text-gray-400 text-lg font-medium">No captions found</p>
             <p className="text-gray-300 text-sm">Upload an image to start generating history.</p>
          </div>
        )}
      </div>
    </div>
  );
}
