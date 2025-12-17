import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import type { VehicleImage } from '@/types';

interface VehicleImageGalleryProps {
  images: VehicleImage[];
  vehicleName: string;
}

export const VehicleImageGallery: React.FC<VehicleImageGalleryProps> = ({ images, vehicleName }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 bg-muted/50 rounded-lg flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <ZoomIn className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No images available</p>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openFullscreen = (index: number) => {
    setFullscreenImageIndex(index);
    setIsFullscreenOpen(true);
  };

  const nextFullscreenImage = () => {
    setFullscreenImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevFullscreenImage = () => {
    setFullscreenImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const currentImage = images[currentImageIndex];
  const fullscreenImage = images[fullscreenImageIndex];

  return (
    <>
      {/* Image Gallery */}
      <div className="space-y-4">
        {/* Main Image Display */}
        <div className="relative group">
          <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden bg-muted/50">
            <img
              src={currentImage.url}
              alt={currentImage.alt}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
              onClick={() => openFullscreen(currentImageIndex)}
            />
            
            {/* Image Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/90 hover:bg-white text-black"
                  onClick={() => openFullscreen(currentImageIndex)}
                >
                  <ZoomIn className="h-4 w-4 mr-2" />
                  View Full Size
                </Button>
              </div>
            </div>

            {/* Image Counter */}
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-black/70 text-white">
                {currentImageIndex + 1} / {images.length}
              </Badge>
            </div>

            {/* Primary Image Badge */}
            {currentImage.isPrimary && (
              <div className="absolute top-4 left-4">
                <Badge variant="default" className="bg-primary">
                  Primary
                </Badge>
              </div>
            )}
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                onClick={prevImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Image Caption */}
        {currentImage.caption && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{currentImage.caption}</p>
          </div>
        )}

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  index === currentImageIndex
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-muted hover:border-muted-foreground/50'
                }`}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
                {image.isPrimary && (
                  <div className="absolute top-1 left-1">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
        <DialogContent className="max-w-7xl w-full h-full max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <span>{vehicleName} - Image Gallery</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreenOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 relative overflow-hidden">
            {/* Fullscreen Image */}
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={fullscreenImage.url}
                alt={fullscreenImage.alt}
                className="max-w-full max-h-full object-contain"
              />

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                    onClick={prevFullscreenImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                    onClick={nextFullscreenImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-black/70 text-white">
                  {fullscreenImageIndex + 1} / {images.length}
                </Badge>
              </div>
            </div>
          </div>

          {/* Fullscreen Image Info */}
          <div className="p-6 pt-0">
            <div className="text-center space-y-2">
              <h3 className="font-semibold">{fullscreenImage.alt}</h3>
              {fullscreenImage.caption && (
                <p className="text-sm text-muted-foreground">{fullscreenImage.caption}</p>
              )}
            </div>

            {/* Thumbnail Navigation for Fullscreen */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto mt-4 justify-center">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setFullscreenImageIndex(index)}
                    className={`relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      index === fullscreenImageIndex
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-muted hover:border-muted-foreground/50'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};


