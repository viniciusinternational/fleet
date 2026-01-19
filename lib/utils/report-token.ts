/**
 * Token encryption/decryption for sharing custom reports
 * Uses simple base64 encoding for now - can be enhanced with crypto if needed
 */

export interface ReportTokenData {
  reportType: 'inventory' | 'status-summary' | 'location-based';
  filters: Record<string, any>;
  timestamp: number;
}

/**
 * Generate a shareable token for a report
 * @param data - Report data to encode
 * @returns Base64 encoded token
 */
export function generateReportToken(data: ReportTokenData): string {
  try {
    const jsonString = JSON.stringify(data);
    const token = Buffer.from(jsonString).toString('base64');
    // URL-safe encoding
    return token.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (error) {
    console.error('Error generating report token:', error);
    throw new Error('Failed to generate report token');
  }
}

/**
 * Decode and validate a report token
 * @param token - Base64 encoded token
 * @returns Decoded report data or null if invalid
 */
export function decodeReportToken(token: string): ReportTokenData | null {
  try {
    // Restore URL-safe encoding
    const restoredToken = token.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed
    const padding = restoredToken.length % 4;
    const paddedToken = padding ? restoredToken + '='.repeat(4 - padding) : restoredToken;
    
    const jsonString = Buffer.from(paddedToken, 'base64').toString('utf-8');
    const data = JSON.parse(jsonString) as ReportTokenData;

    // Validate required fields
    if (!data.reportType || !data.filters || !data.timestamp) {
      return null;
    }

    // Validate report type
    const validReportTypes = ['inventory', 'status-summary', 'location-based'];
    if (!validReportTypes.includes(data.reportType)) {
      return null;
    }

    // Optional: Check if token is too old (e.g., 30 days)
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    const age = Date.now() - data.timestamp;
    if (age > maxAge) {
      return null; // Token expired
    }

    return data;
  } catch (error) {
    console.error('Error decoding report token:', error);
    return null;
  }
}

/**
 * Validate if a token is still valid (not expired)
 * @param token - Base64 encoded token
 * @returns true if valid, false otherwise
 */
export function isTokenValid(token: string): boolean {
  const data = decodeReportToken(token);
  return data !== null;
}