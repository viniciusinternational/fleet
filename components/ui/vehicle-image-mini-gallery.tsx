import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import type { VehicleImage } from '@/types';
import { isHeicImage, convertHeicToJpeg } from '@/lib/utils/heic-converter';

interface VehicleImageMiniGalleryProps {
  images: VehicleImage[];
  vehicleName: string;
}

export const VehicleImageMiniGallery: React.FC<VehicleImageMiniGalleryProps> = ({ images, vehicleName }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0);
  const [convertedUrls, setConvertedUrls] = useState<Map<string, string>>(new Map());
  const [convertingImages, setConvertingImages] = useState<Set<string>>(new Set());

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-32 bg-muted/50 rounded-lg flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <ZoomIn className="h-6 w-6 mx-auto mb-1 opacity-50" />
          <p className="text-xs">No images</p>
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

  // Convert HEIC images on load
  useEffect(() => {
    const convertHeicImages = async () => {
      const processedIds = new Set<string>();
      
      for (const image of images) {
        const originalUrl = image.data || image.url || '';
        if (!originalUrl || processedIds.has(image.id)) continue;

        // Only convert HEIC images
        if (isHeicImage(originalUrl)) {
          processedIds.add(image.id);
          setConvertingImages((prev) => {
            if (prev.has(image.id)) return prev;
            return new Set(prev).add(image.id);
          });
          
          try {
            const convertedUrl = await convertHeicToJpeg(originalUrl);
            if (convertedUrl) {
              setConvertedUrls((prev) => {
                if (prev.has(image.id)) return prev;
                const newMap = new Map(prev);
                newMap.set(image.id, convertedUrl);
                return newMap;
              });
            }
          } catch (error) {
            console.error(`Failed to convert HEIC image ${image.id}:`, error);
          } finally {
            setConvertingImages((prev) => {
              const newSet = new Set(prev);
              newSet.delete(image.id);
              return newSet;
            });
          }
        }
      }
    };

    if (images && images.length > 0) {
      convertHeicImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      convertedUrls.forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [convertedUrls]);

  const getImageSrc = useCallback((image: VehicleImage): string => {
    const originalUrl = image.data || image.url || '';
    if (!originalUrl) return '';

    // Use converted URL if available
    const convertedUrl = convertedUrls.get(image.id);
    if (convertedUrl) {
      return convertedUrl;
    }

    // Return original URL (will work for non-HEIC images)
    return originalUrl;
  }, [convertedUrls]);

  const currentImage = images[currentImageIndex];
  const fullscreenImage = images[fullscreenImageIndex];

  return (
    <>
      {/* Mini Image Gallery */}
      <div className="space-y-3">
        {/* Main Mini Image Display */}
        <div className="relative group">
          <div className="relative w-full h-32 rounded-lg overflow-hidden bg-muted/50">
            {convertingImages.has(currentImage.id) && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
                <div className="text-xs text-muted-foreground">Converting...</div>
              </div>
            )}
            <img
              src={getImageSrc(currentImage)}
              alt={currentImage.alt}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
              onClick={() => openFullscreen(currentImageIndex)}
              onError={(e) => {
                // Fallback for failed images
                const target = e.target as HTMLImageElement;
                if (target.src && !target.src.includes('data:')) {
                  console.warn('Failed to load image:', target.src);
                }
              }}
            />
            
            {/* Image Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/90 hover:bg-white text-black h-6 px-2 text-xs"
                  onClick={() => openFullscreen(currentImageIndex)}
                >
                  <ZoomIn className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            </div>

            {/* Image Counter */}
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-black/70 text-white text-xs px-1 py-0 h-5">
                {currentImageIndex + 1}/{images.length}
              </Badge>
            </div>

            {/* Primary Image Badge */}
            {currentImage.isPrimary && (
              <div className="absolute top-2 left-2">
                <Badge variant="default" className="bg-primary text-xs px-1 py-0 h-5">
                  Main
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
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg h-6 w-6 p-0"
                onClick={prevImage}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg h-6 w-6 p-0"
                onClick={nextImage}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>

        {/* Mini Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="flex gap-1 overflow-x-auto pb-1">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative flex-shrink-0 w-8 h-8 rounded overflow-hidden border transition-all duration-200 ${
                  index === currentImageIndex
                    ? 'border-primary ring-1 ring-primary/20'
                    : 'border-muted hover:border-muted-foreground/50'
                }`}
              >
                <img
                  src={getImageSrc(image)}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
                {image.isPrimary && (
                  <div className="absolute top-0.5 left-0.5">
                    <div className="w-1 h-1 bg-primary rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Mini Caption */}
        {currentImage.caption && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground truncate">{currentImage.caption}</p>
          </div>
        )}
      </div>

      {/* Fullscreen Modal (same as before) */}
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
                src={getImageSrc(fullscreenImage)}
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
                      src={getImageSrc(image)}
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


