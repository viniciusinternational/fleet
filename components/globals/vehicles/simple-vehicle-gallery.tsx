'use client';

import React, { useState } from 'react';
import type { VehicleImage } from '@/types';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface SimpleVehicleGalleryProps {
  images: VehicleImage[];
  vehicleName: string;
}

export const SimpleVehicleGallery: React.FC<SimpleVehicleGalleryProps> = ({
  images,
  vehicleName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 bg-muted/40 rounded-lg flex items-center justify-center border border-dashed border-border/60">
        <div className="text-center text-muted-foreground">
          <p className="text-sm font-medium">No images available</p>
          <p className="text-xs mt-1">Images for this vehicle have not been uploaded yet.</p>
        </div>
      </div>
    );
  }

  const primary = images.find((img) => img.isPrimary) || images[0];
  const handleOpen = (index: number) => {
    setActiveIndex(index);
    setIsOpen(true);
  };

  const showPrev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const showNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <>
      <div className="space-y-3">
        {/* Hero image */}
        <button
          type="button"
          onClick={() =>
            handleOpen(images.findIndex((img) => img.id === primary.id) || 0)
          }
          className="group relative w-full h-56 sm:h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden border border-border/60 bg-muted/40"
        >
          <img
            src={primary.thumbnailUrl || primary.url || primary.data || ''}
            alt={primary.alt}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

          <div className="absolute inset-0 flex flex-col justify-between p-4 md:p-5 text-left">
            <div className="flex justify-between items-start">
              <Badge variant="secondary" className="bg-black/70 text-white border-white/10 text-xs">
                {vehicleName}
              </Badge>
              <Badge variant="secondary" className="bg-black/70 text-white border-white/10 text-xs">
                {images.length} image{images.length > 1 ? 's' : ''}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-white/80 font-medium line-clamp-1">
                {primary.caption || primary.alt}
              </p>
              <p className="text-xs text-white/70 mt-1">Click to open gallery</p>
            </div>
          </div>
        </button>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {images.map((img, index) => (
              <button
                key={img.id}
                type="button"
                onClick={() => handleOpen(index)}
                className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-border/60 hover:border-primary/70 transition-colors"
              >
                <img
                  src={img.thumbnailUrl || img.url || img.data || ''}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                />
                {img.isPrimary && (
                  <div className="absolute top-1 left-1">
                    <Badge variant="default" className="h-4 px-1 text-[10px] leading-none">
                      Main
                    </Badge>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen gallery */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[100vw] w-full h-[100vh] max-h-[100vh] p-0 border-0 bg-black">
          <DialogTitle className="sr-only">
            {vehicleName} image gallery
          </DialogTitle>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <span className="font-medium">{vehicleName}</span>
                <span className="text-white/50">
                  · {activeIndex + 1} / {images.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 relative flex items-center justify-center bg-black">
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
                    onClick={showPrev}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
                    onClick={showNext}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              <img
                src={
                  images[activeIndex].url ||
                  images[activeIndex].thumbnailUrl ||
                  images[activeIndex].data ||
                  ''
                }
                alt={images[activeIndex].alt}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {images[activeIndex].caption && (
              <div className="px-4 py-3 border-t border-white/10 text-center text-sm text-white/80">
                {images[activeIndex].caption}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

