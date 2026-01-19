import { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

/**
 * Extract actor ID from request for audit logging
 * Tries multiple methods to get the authenticated user ID
 */
export async function getActorId(request: NextRequest): Promise<string | null> {
  try {
    // Method 1: Try to get from Authorization header (JWT token)
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '').trim();
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          // Try common JWT claim fields
          if (decoded.userId || decoded.user_id || decoded.sub || decoded.id) {
            return decoded.userId || decoded.user_id || decoded.sub || decoded.id;
          }
          // If email is in token, we might need to look up the user
          if (decoded.email) {
            // This would require a database lookup, but for now return null
            // and let the caller handle it
          }
        } catch (error) {
          // Invalid token, continue to other methods
          console.warn('Failed to decode JWT token:', error);
        }
      }
    }

    // Method 2: Try to get from cookies
    const tokenCookie = request.cookies.get('token') || request.cookies.get('auth-token');
    if (tokenCookie?.value) {
      try {
        const decoded: any = jwtDecode(tokenCookie.value);
        if (decoded.userId || decoded.user_id || decoded.sub || decoded.id) {
          return decoded.userId || decoded.user_id || decoded.sub || decoded.id;
        }
      } catch (error) {
        // Invalid token, continue
      }
    }

    // Method 3: Try to get from custom headers (if your system uses them)
    const userIdHeader = request.headers.get('x-user-id') || request.headers.get('user-id');
    if (userIdHeader) {
      return userIdHeader;
    }

    // Method 4: Try to get from query parameters (for testing/fallback)
    const { searchParams } = new URL(request.url);
    const actorIdParam = searchParams.get('actorId');
    if (actorIdParam) {
      return actorIdParam;
    }

    return null;
  } catch (error) {
    console.error('Error extracting actor ID:', error);
    return null;
  }
}

/**
 * Get actor ID with fallback to system user
 * Use this when you need a guaranteed actor ID
 */
export async function getActorIdWithFallback(
  request: NextRequest,
  fallbackUserId?: string
): Promise<string> {
  const actorId = await getActorId(request);
  
  if (actorId) {
    return actorId;
  }

  // If no actor ID found and no fallback provided, try to get system user
  if (!fallbackUserId) {
    // Try to find a system/admin user in the database
    // For now, return a placeholder - this should be replaced with actual system user lookup
    console.warn('No actor ID found, using system user fallback');
    // In production, you might want to:
    // 1. Create a system user in the database
    // 2. Look it up here
    // 3. Return its ID
    throw new Error('Actor ID is required for audit logging. Please provide authentication or fallback user ID.');
  }

  return fallbackUserId;
}

/**
 * Extract user ID from request body (for cases where user ID is in the request)
 * This is useful when the actor is different from the authenticated user
 */
export function getActorIdFromBody(body: any): string | null {
  if (!body) return null;
  
  return body.actorId || body.userId || body.actor_id || body.user_id || null;
}
