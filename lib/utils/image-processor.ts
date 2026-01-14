import sharp from 'sharp';

/**
 * Validates if the MIME type is a supported image format
 * Only allows: image/jpeg, image/jpg, image/png
 */
export function validateImageType(mimeType: string): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  return allowedTypes.includes(mimeType.toLowerCase());
}

/**
 * Validates if the file extension is supported
 */
export function validateImageExtension(filename: string): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['jpg', 'jpeg', 'png'];
  return extension ? allowedExtensions.includes(extension) : false;
}

/**
 * Generates a thumbnail from an image buffer
 * @param buffer - The image buffer
 * @param width - Thumbnail width (default: 400)
 * @param height - Thumbnail height (default: 300)
 * @returns Promise<Buffer> - The thumbnail buffer
 */
export async function generateThumbnail(
  buffer: Buffer,
  width: number = 400,
  height: number = 300
): Promise<Buffer> {
  try {
    const thumbnail = await sharp(buffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    return thumbnail;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw new Error('Failed to generate thumbnail');
  }
}

/**
 * Gets the appropriate content type for thumbnail
 * Always returns JPEG for thumbnails
 */
export function getThumbnailContentType(): string {
  return 'image/jpeg';
}
