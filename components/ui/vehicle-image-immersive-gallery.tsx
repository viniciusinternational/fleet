'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ZoomIn, 
  Maximize2,
  Image as ImageIcon
} from 'lucide-react';
import type { VehicleImage } from '@/types';
import { isHeicImage, convertHeicToJpeg } from '@/lib/utils/heic-converter';

interface VehicleImageImmersiveGalleryProps {
  images: VehicleImage[];
  vehicleName: string;
}

export const VehicleImageImmersiveGallery: React.FC<VehicleImageImmersiveGalleryProps> = ({ 
  images, 
  vehicleName 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0);
  const [convertedUrls, setConvertedUrls] = useState<Map<string, string>>(new Map());
  const [convertingImages, setConvertingImages] = useState<Set<string>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showNavOverlay, setShowNavOverlay] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState<Set<string>>(new Set());
  const heroRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  if (!images || images.length === 0) {
    return (
      <div className="w-full min-h-[400px] md:min-h-[500px] lg:min-h-[600px] bg-gradient-to-br from-muted/30 to-muted/50 rounded-xl flex items-center justify-center border border-border/50">
        <div className="text-center text-muted-foreground">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No images available</p>
          <p className="text-sm mt-2">Images will appear here once uploaded</p>
        </div>
      </div>
    );
  }

  const nextImage = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [images.length, isTransitioning]);

  const prevImage = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [images.length, isTransitioning]);

  const goToImage = useCallback((index: number) => {
    if (isTransitioning || index === currentImageIndex) return;
    setIsTransitioning(true);
    setCurrentImageIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [currentImageIndex, isTransitioning]);

  const openFullscreen = useCallback((index: number) => {
    setFullscreenImageIndex(index);
    setIsFullscreenOpen(true);
    setShowNavOverlay(true);
    resetIdleTimer();
  }, []);

  const closeFullscreen = useCallback(() => {
    setIsFullscreenOpen(false);
    setShowNavOverlay(false);
  }, []);

  const nextFullscreenImage = useCallback(() => {
    setFullscreenImageIndex((prev) => (prev + 1) % images.length);
    resetIdleTimer();
  }, [images.length]);

  const prevFullscreenImage = useCallback(() => {
    setFullscreenImageIndex((prev) => (prev - 1 + images.length) % images.length);
    resetIdleTimer();
  }, [images.length]);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    setShowNavOverlay(true);
    idleTimerRef.current = setTimeout(() => {
      setShowNavOverlay(false);
    }, 3000);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFullscreenOpen) {
        if (e.key === 'Escape') {
          closeFullscreen();
        } else if (e.key === 'ArrowLeft') {
          prevFullscreenImage();
        } else if (e.key === 'ArrowRight') {
          nextFullscreenImage();
        } else if (e.key >= '1' && e.key <= '9') {
          const index = parseInt(e.key) - 1;
          if (index < images.length) {
            setFullscreenImageIndex(index);
            resetIdleTimer();
          }
        }
      } else {
        if (e.key === 'ArrowLeft') {
          prevImage();
        } else if (e.key === 'ArrowRight') {
          nextImage();
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openFullscreen(currentImageIndex);
        } else if (e.key >= '1' && e.key <= '9') {
          const index = parseInt(e.key) - 1;
          if (index < images.length) {
            goToImage(index);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenOpen, currentImageIndex, images.length, nextImage, prevImage, nextFullscreenImage, prevFullscreenImage, openFullscreen, closeFullscreen, goToImage]);

  // Touch gesture handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && images.length > 1) {
      if (isFullscreenOpen) {
        nextFullscreenImage();
      } else {
        nextImage();
      }
    }
    if (isRightSwipe && images.length > 1) {
      if (isFullscreenOpen) {
        prevFullscreenImage();
      } else {
        prevImage();
      }
    }
  };

  // Convert HEIC images on load
  useEffect(() => {
    const convertHeicImages = async () => {
      const processedIds = new Set<string>();
      
      for (const image of images) {
        const originalUrl = image.data || image.url || '';
        if (!originalUrl || processedIds.has(image.id)) continue;

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

  // Reset idle timer on mouse move in fullscreen
  useEffect(() => {
    if (!isFullscreenOpen) return;

    const handleMouseMove = () => {
      resetIdleTimer();
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isFullscreenOpen, resetIdleTimer]);

  // Cleanup idle timer
  useEffect(() => {
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, []);

  const getImageSrc = useCallback((image: VehicleImage): string => {
    const originalUrl = image.data || image.url || '';
    if (!originalUrl) return '';

    const convertedUrl = convertedUrls.get(image.id);
    if (convertedUrl) {
      return convertedUrl;
    }

    return originalUrl;
  }, [convertedUrls]);

  const handleImageLoad = useCallback((imageId: string) => {
    setImageLoaded((prev) => new Set(prev).add(imageId));
  }, []);

  const currentImage = images[currentImageIndex];
  const fullscreenImage = images[fullscreenImageIndex];

  return (
    <>
      {/* Immersive Image Gallery */}
      <div className="space-y-4">
        {/* Hero Image Display */}
        <div 
          ref={heroRef}
          className="relative group w-full min-h-[400px] md:min-h-[500px] lg:min-h-[600px] rounded-xl overflow-hidden bg-gradient-to-br from-muted/20 to-muted/40 border border-border/50 shadow-lg"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Main Image with Fade Transition */}
          <div className="relative w-full h-full">
            {convertingImages.has(currentImage.id) && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-20 backdrop-blur-sm">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <div className="text-sm text-muted-foreground">Converting image...</div>
                </div>
              </div>
            )}
            
            <div className="relative w-full h-full">
              <img
                key={currentImage.id}
                src={getImageSrc(currentImage)}
                alt={currentImage.alt}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded.has(currentImage.id) ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => handleImageLoad(currentImage.id)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src && !target.src.includes('data:')) {
                    console.warn('Failed to load image:', target.src);
                  }
                }}
              />
              
              {/* Loading Skeleton */}
              {!imageLoaded.has(currentImage.id) && !convertingImages.has(currentImage.id) && (
                <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/50 animate-pulse" />
              )}
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

            {/* Image Overlay Controls */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white/95 hover:bg-white text-black shadow-xl backdrop-blur-sm"
                  onClick={() => openFullscreen(currentImageIndex)}
                >
                  <Maximize2 className="h-5 w-5 mr-2" />
                  View Fullscreen
                </Button>
              </div>
            </div>

            {/* Image Counter */}
            <div className="absolute top-4 right-4 z-10">
              <Badge variant="secondary" className="bg-black/70 text-white backdrop-blur-sm shadow-lg">
                {currentImageIndex + 1} / {images.length}
              </Badge>
            </div>

            {/* Primary Badge */}
            {currentImage.isPrimary && (
              <div className="absolute top-4 left-4 z-10">
                <Badge variant="default" className="bg-primary shadow-lg">
                  Primary
                </Badge>
              </div>
            )}

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-xl backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-12 w-12"
                  onClick={prevImage}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-xl backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-12 w-12"
                  onClick={nextImage}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Image Caption */}
        {currentImage.caption && (
          <div className="text-center px-4">
            <p className="text-sm text-muted-foreground font-medium">{currentImage.caption}</p>
          </div>
        )}

        {/* Thumbnail Grid */}
        {images.length > 1 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToImage(index)}
                className={`relative group/thumb aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                  index === currentImageIndex
                    ? 'border-primary ring-4 ring-primary/20 shadow-lg scale-105'
                    : 'border-muted hover:border-muted-foreground/50 hover:scale-105'
                }`}
                aria-label={`View image ${index + 1}`}
              >
                <img
                  src={getImageSrc(image)}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-110"
                />
                
                {/* Active Indicator */}
                {index === currentImageIndex && (
                  <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
                )}

                {/* Primary Indicator */}
                {image.isPrimary && (
                  <div className="absolute top-2 left-2">
                    <div className="w-2 h-2 bg-primary rounded-full shadow-lg ring-2 ring-background" />
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Fullscreen Modal */}
      <Dialog open={isFullscreenOpen} onOpenChange={closeFullscreen}>
        <DialogContent 
          className="max-w-[100vw] w-full h-full max-h-[100vh] p-0 gap-0 border-0 bg-black/95 backdrop-blur-md"
          onPointerMove={resetIdleTimer}
        >
          <div 
            ref={fullscreenRef}
            className="relative w-full h-full flex flex-col"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Fullscreen Image Container */}
            <div className="flex-1 relative overflow-hidden flex items-center justify-center">
              {convertingImages.has(fullscreenImage.id) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <div className="text-white">Converting image...</div>
                  </div>
                </div>
              )}

              <img
                key={fullscreenImage.id}
                src={getImageSrc(fullscreenImage)}
                alt={fullscreenImage.alt}
                className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                  imageLoaded.has(fullscreenImage.id) ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => handleImageLoad(fullscreenImage.id)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src && !target.src.includes('data:')) {
                    console.warn('Failed to load image:', target.src);
                  }
                }}
              />

              {/* Loading Skeleton */}
              {!imageLoaded.has(fullscreenImage.id) && !convertingImages.has(fullscreenImage.id) && (
                <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/50 animate-pulse" />
              )}

              {/* Navigation Overlay (appears on hover/idle) */}
              <div 
                className={`absolute inset-0 transition-opacity duration-300 ${
                  showNavOverlay ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm h-10 w-10"
                  onClick={closeFullscreen}
                  aria-label="Close fullscreen"
                >
                  <X className="h-5 w-5" />
                </Button>

                {/* Image Counter */}
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-black/70 text-white backdrop-blur-sm">
                    {fullscreenImageIndex + 1} / {images.length}
                  </Badge>
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm h-14 w-14 border-white/20"
                      onClick={prevFullscreenImage}
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm h-14 w-14 border-white/20"
                      onClick={nextFullscreenImage}
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Image Info Panel (slides up from bottom) */}
            <div 
              className={`bg-black/80 backdrop-blur-md border-t border-white/10 transition-transform duration-300 ${
                showNavOverlay ? 'translate-y-0' : 'translate-y-full'
              }`}
            >
              <div className="p-6">
                <div className="text-center space-y-2 mb-4">
                  <h3 className="font-semibold text-white text-lg">{fullscreenImage.alt}</h3>
                  {fullscreenImage.caption && (
                    <p className="text-sm text-white/70">{fullscreenImage.caption}</p>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => {
                          setFullscreenImageIndex(index);
                          resetIdleTimer();
                        }}
                        className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          index === fullscreenImageIndex
                            ? 'border-primary ring-2 ring-primary/50 shadow-lg scale-110'
                            : 'border-white/30 hover:border-white/50 hover:scale-105'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      >
                        <img
                          src={getImageSrc(image)}
                          alt={image.alt}
                          className="w-full h-full object-cover"
                        />
                        {image.isPrimary && (
                          <div className="absolute top-1 left-1">
                            <div className="w-2 h-2 bg-primary rounded-full ring-2 ring-black" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
