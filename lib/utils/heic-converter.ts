import heic2any from 'heic2any';

/**
 * Checks if a URL points to a HEIC/HEIF image
 */
export function isHeicImage(url: string): boolean {
  if (!url) return false;
  
  const urlLower = url.toLowerCase();
  const heicExtensions = ['.heic', '.heif'];
  
  // Check file extension
  for (const ext of heicExtensions) {
    if (urlLower.includes(ext)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Converts a HEIC image URL to a JPEG blob URL
 * @param heicUrl - The URL of the HEIC image
 * @returns Promise that resolves to a blob URL string, or null if conversion fails
 */
export async function convertHeicToJpeg(heicUrl: string): Promise<string | null> {
  try {
    // Fetch the HEIC image as a blob
    const response = await fetch(heicUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch HEIC image: ${response.statusText}`);
    }
    
    const heicBlob = await response.blob();
    
    // Convert HEIC to JPEG using heic2any
    // heic2any returns an array of blobs (one per image, HEIC can have multiple)
    const convertedBlobs = await heic2any({
      blob: heicBlob,
      toType: 'image/jpeg',
      quality: 0.92, // High quality conversion
    });
    
    // Get the first converted blob (most common case)
    const jpegBlob = Array.isArray(convertedBlobs) ? convertedBlobs[0] : convertedBlobs;
    
    if (!jpegBlob) {
      throw new Error('Conversion returned no result');
    }
    
    // Create an object URL from the converted JPEG blob
    const jpegUrl = URL.createObjectURL(jpegBlob);
    
    return jpegUrl;
  } catch (error) {
    console.error('Error converting HEIC image:', error);
    return null;
  }
}

/**
 * Gets the appropriate image source URL, converting HEIC if necessary
 * @param imageUrl - The original image URL
 * @param convertedUrl - The cached converted URL (if already converted)
 * @param onConverted - Callback when conversion completes with the new URL
 * @returns The URL to use for the image src
 */
export async function getImageSrcWithHeicSupport(
  imageUrl: string | undefined | null,
  convertedUrl: string | null | undefined,
  onConverted?: (url: string) => void
): Promise<string> {
  if (!imageUrl) return '';
  
  // If already converted, use the converted URL
  if (convertedUrl) {
    return convertedUrl;
  }
  
  // If it's a HEIC image, convert it
  if (isHeicImage(imageUrl)) {
    const converted = await convertHeicToJpeg(imageUrl);
    if (converted) {
      onConverted?.(converted);
      return converted;
    }
    // If conversion fails, fallback to original URL (may not work in browser)
    return imageUrl;
  }
  
  // For non-HEIC images, return as-is
  return imageUrl;
}
