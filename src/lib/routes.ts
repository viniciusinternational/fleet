import { Role } from '@/types';

export interface RouteConfig {
  path: string;
  allowedRoles: Role[];
  exact?: boolean;
  description?: string;
}

/**
 * Route configuration for role-based access control
 * 
 * Rules:
 * - Empty allowedRoles array means the route is public (no authentication required)
 * - exact: true means the path must match exactly
 * - exact: false (default) means the path can be a prefix
 */
export const ROUTE_CONFIGS: RouteConfig[] = [
  // Public routes (no authentication required)
  {
    path: '/',
    allowedRoles: [],
    exact: true,
    description: 'Home page - redirects based on auth status'
  },
  {
    path: '/auth',
    allowedRoles: [],
    exact: false,
    description: 'Authentication pages (login, callback)'
  },

  // Admin-only routes
  {
    path: '/admin',
    allowedRoles: [Role.ADMIN, Role.CEO],
    exact: false,
    description: 'Admin dashboard and management pages'
  },

  // Normal user routes (accessible by normal users, admins, and CEOs)
  {
    path: '/normal',
    allowedRoles: [Role.NORMAL, Role.ADMIN, Role.CEO],
    exact: false,
    description: 'Normal user dashboard and features'
  },

  // Global routes (accessible by all authenticated users)
  {
    path: '/globals',
    allowedRoles: [Role.NORMAL, Role.ADMIN, Role.CEO],
    exact: false,
    description: 'Global features accessible by all authenticated users'
  },
];

/**
 * Get the redirect path for a user based on their role
 */
export function getRedirectPathForRole(role: Role): string {
  switch (role) {
    case Role.ADMIN:
    case Role.CEO:
      return '/admin/dashboard';
    case Role.NORMAL:
      return '/normal/dashboard';
    default:
      return '/auth/login';
  }
}

/**
 * Check if a path requires authentication
 */
export function isAuthRequiredForPath(path: string): boolean {
  return ROUTE_CONFIGS.some(config => {
    if (config.path === '/') {
      return config.exact ? path === '/' : path.startsWith('/');
    }
    return path.startsWith(config.path);
  });
}

/**
 * Check if a user role has access to a specific path
 */
export function checkRoleAccess(path: string, userRole: Role): boolean {
  // Find matching route config
  const matchingConfig = ROUTE_CONFIGS.find(config => {
    if (config.path === '/') {
      return config.exact ? path === '/' : path.startsWith('/');
    }
    return path.startsWith(config.path);
  });

  if (!matchingConfig) {
    // If no specific config found, allow access (fallback)
    return true;
  }

  // Check if user role is allowed for this route
  return matchingConfig.allowedRoles.length === 0 || 
         matchingConfig.allowedRoles.includes(userRole);
}

/**
 * Get route configuration for a specific path
 */
export function getRouteConfig(path: string): RouteConfig | undefined {
  return ROUTE_CONFIGS.find(config => {
    if (config.path === '/') {
      return config.exact ? path === '/' : path.startsWith('/');
    }
    return path.startsWith(config.path);
  });
}
