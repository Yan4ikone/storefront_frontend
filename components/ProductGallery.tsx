"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { resolveImageUrl } from "@/lib/api";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-card bg-surface border border-border flex items-center justify-center text-muted/50 mb-3">
        <ImageOff size={48} strokeWidth={1.25} />
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-square rounded-card bg-surface border border-border overflow-hidden mb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={resolveImageUrl(images[active])} alt={name} className="h-full w-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(index)}
              className={`aspect-square rounded-lg overflow-hidden border transition-colors ${
                index === active ? "border-brand" : "border-border hover:border-brand/50"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveImageUrl(src)} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
