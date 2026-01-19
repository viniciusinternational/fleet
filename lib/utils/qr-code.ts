import QRCode from 'qrcode';

export interface QRCodeOptions {
  size?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Generate QR code as data URL (base64 image)
 * @param text - The text/URL to encode in the QR code
 * @param options - QR code generation options
 * @returns Promise resolving to base64 data URL
 */
export async function generateQRCodeDataURL(
  text: string,
  options: QRCodeOptions = {}
): Promise<string> {
  try {
    const {
      size = 200,
      margin = 2,
      errorCorrectionLevel = 'M',
      color = { dark: '#000000', light: '#FFFFFF' },
    } = options;

    const dataURL = await QRCode.toDataURL(text, {
      width: size,
      margin,
      errorCorrectionLevel,
      color,
    });

    return dataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate QR code as buffer for PDF embedding
 * @param text - The text/URL to encode in the QR code
 * @param options - QR code generation options
 * @returns Promise resolving to buffer
 */
export async function generateQRCodeBuffer(
  text: string,
  options: QRCodeOptions = {}
): Promise<Buffer> {
  try {
    const {
      size = 200,
      margin = 2,
      errorCorrectionLevel = 'M',
      color = { dark: '#000000', light: '#FFFFFF' },
    } = options;

    const buffer = await QRCode.toBuffer(text, {
      width: size,
      margin,
      errorCorrectionLevel,
      color,
    });

    return buffer;
  } catch (error) {
    console.error('Error generating QR code buffer:', error);
    throw new Error('Failed to generate QR code buffer');
  }
}

/**
 * Get base URL for the application
 * Used for generating QR code URLs
 */
export function getBaseUrl(): string {
  // Check environment variable first
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // Check Vercel URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Fallback to localhost for development
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`;
  }

  // Server-side fallback
  return 'http://localhost:3000';
}