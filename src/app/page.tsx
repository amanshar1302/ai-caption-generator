"use client";

import { UploadForm } from "@/components/UploadForm";

export default function Home() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="space-y-2">
        <h2 className="text-4xl font-extrabold tracking-tight text-black">
          Upload & Analyze
        </h2>
      </header>

      <div className="bg-white border border-gray-100 rounded-[12px] p-10 subtle-shadow">
        <UploadForm />
      </div>
    </div>
  );
}
