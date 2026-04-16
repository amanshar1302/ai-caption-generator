"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Image as ImageIcon, Clock, Map } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: ImageIcon, label: "Image Gallery", href: "/gallery" },
  { icon: Clock, label: "Caption History", href: "/history" },
  { icon: Map, label: "Knowledge Map", href: "/knowledge" },
];

export function Sidebar({ divider = false }: { divider?: boolean }) {
  const pathname = usePathname();

  return (
    <div className={cn(
      "w-72 h-full bg-white flex flex-col z-20 transition-all",
      divider && "border-r border-gray-100 shadow-sm"
    )}>
      <div className="p-8 pb-10">
        <h1 className="text-[28px] font-black tracking-tighter text-black leading-tight">
          SmartCaption
        </h1>
        <p className="text-gray-400 text-sm font-medium mt-0.5 tracking-tight">
          AI Image Analysis
        </p>
      </div>

      <nav className="flex-1 px-0">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-8 py-4.5 transition-all duration-200 relative group",
                isActive 
                  ? "bg-gray-50 text-black border-r-4 border-blue-600" 
                  : "text-gray-500 hover:bg-gray-50/50 hover:text-black"
              )}
            >
              <item.icon className={cn(
                "w-[22px] h-[22px]", 
                isActive ? "text-blue-600" : "text-gray-400 group-hover:text-black"
              )} />
              <span className={cn(
                "font-bold text-[15px]",
                isActive ? "text-black" : "text-gray-500"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-8 mt-auto border-t border-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            System Online
          </span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
          Accelerated Image Recognition enabled via GPT-4o.
        </p>
      </div>
    </div>
  );
}
