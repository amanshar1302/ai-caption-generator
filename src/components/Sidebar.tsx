"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Image, Upload, Settings, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Image, label: "Gallery", href: "/gallery" },
  { icon: Upload, label: "Add Images", href: "/upload" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-full glass border-r flex flex-col p-6 z-20">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <Image className="text-white w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-tight gradient-text">PixAI</span>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              pathname === item.href
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", pathname === item.href ? "text-white" : "text-muted-foreground")} />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto space-y-2 pt-6 border-t border-white/5">
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white w-full transition-colors">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 mt-4">
          <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
            Using GPT-4o Vision for extreme accuracy.
          </p>
          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-3/4 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
