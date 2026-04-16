"use client";

import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function TopBar() {
  return (
    <header className="h-16 flex items-center justify-end px-8 gap-4 border-b bg-background z-10">
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search captions..." 
          className="pl-10 h-10 bg-secondary/50 border-none rounded-md text-sm focus-visible:ring-1 focus-visible:ring-primary/20"
        />
      </div>
      
      <Button className="h-10 bg-black text-white hover:bg-black/90 px-6 rounded-md flex items-center gap-2 text-sm font-medium">
        <Download className="w-4 h-4" />
        Export to Sheets
      </Button>
    </header>
  );
}
