"use client";

import { Map as MapIcon, Construction } from "lucide-react";

export default function KnowledgeMap() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="space-y-2">
        <h2 className="text-4xl font-extrabold tracking-tight text-black">
          Knowledge Map
        </h2>
      </header>

      <div className="bg-white border border-gray-100 rounded-[12px] p-20 flex flex-col items-center justify-center text-center space-y-6 subtle-shadow min-h-[500px]">
        <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
          <MapIcon className="w-10 h-10" />
        </div>
        <div className="space-y-2 max-w-md">
          <h3 className="text-2xl font-bold text-black">Feature Under Development</h3>
          <p className="text-gray-500 font-medium">
            The Knowledge Map will provide a visual semantic graph of all your analyzed assets and their relationships.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          <Construction className="w-3 h-3" />
          Coming Soon
        </div>
      </div>
    </div>
  );
}
