import type { User, PermissionKey } from '@/types';
import { hasAnyPermission } from '@/lib/permissions';
import { getNavigationForUser } from '@/lib/navigation';

export interface RouteConfig {
  path: string;
  requiredPermissions?: PermissionKey[];
  exact?: boolean;
  description?: string;
}

/**
 * Route configuration for permission-based access control
 * 
 * Rules:
 * - No requiredPermissions means the route is public (no authentication required)
 * - exact: true means the path must match exactly
 * - exact: false (default) means the path can be a prefix
 */
export const ROUTE_CONFIGS: RouteConfig[] = [
  // Public routes (no authentication required)
  {
    path: '/',
    exact: true,
    description: 'Home page - redirects based on auth status'
  },
  {
    path: '/auth',
    exact: false,
    description: 'Authentication pages (login, callback)'
  },

  // Dashboard routes
  {
    path: '/dashboard',
    requiredPermissions: ['view_dashboard'],
    exact: false,
    description: 'Dashboard page'
  },

  // Executive Dashboard route
  {
    path: '/executive',
    requiredPermissions: ['view_executive_dashboard'],
    exact: true,
    description: 'Executive dashboard page'
  },

  // Vehicle routes
  {
    path: '/vehicles',
    requiredPermissions: ['view_vehicles'],
    exact: true,
    description: 'Vehicle list page'
  },
  {
    path: '/vehicles/add',
    requiredPermissions: ['add_vehicles'],
    exact: true,
    description: 'Add vehicle page'
  },
  {
    path: '/vehicles/[id]',
    requiredPermissions: ['view_vehicles'],
    exact: false,
    description: 'Vehicle detail page'
  },
  {
    path: '/vehicles/[id]/edit',
    requiredPermissions: ['edit_vehicles'],
    exact: false,
    description: 'Edit vehicle page'
  },

  // User routes
  {
    path: '/users',
    requiredPermissions: ['view_users'],
    exact: true,
    description: 'User list page'
  },
  {
    path: '/users/add',
    requiredPermissions: ['add_users'],
    exact: true,
    description: 'Add user page'
  },
  {
    path: '/users/[id]',
    requiredPermissions: ['view_users'],
    exact: false,
    description: 'User detail page'
  },
  {
    path: '/users/[id]/edit',
    requiredPermissions: ['edit_users'],
    exact: false,
    description: 'Edit user page'
  },

  // Owner routes
  {
    path: '/owners',
    requiredPermissions: ['view_owners'],
    exact: true,
    description: 'Owner list page'
  },
  {
    path: '/owners/add',
    requiredPermissions: ['add_owners'],
    exact: true,
    description: 'Add owner page'
  },
  {
    path: '/owners/[id]',
    requiredPermissions: ['view_owners'],
    exact: false,
    description: 'Owner detail page'
  },
  {
    path: '/owners/edit',
    requiredPermissions: ['edit_owners'],
    exact: false,
    description: 'Edit owner page (handles /owners/edit/[id])'
  },

  // Source routes
  {
    path: '/sources',
    requiredPermissions: ['view_sources'],
    exact: true,
    description: 'Source list page'
  },
  {
    path: '/sources/add',
    requiredPermissions: ['add_sources'],
    exact: true,
    description: 'Add source page'
  },
  {
    path: '/sources/[id]',
    requiredPermissions: ['view_sources'],
    exact: false,
    description: 'Source detail page'
  },
  {
    path: '/sources/edit',
    requiredPermissions: ['edit_sources'],
    exact: false,
    description: 'Edit source page (handles /sources/edit/[id])'
  },

  // Location routes
  {
    path: '/locations',
    requiredPermissions: ['view_locations'],
    exact: true,
    description: 'Location list page'
  },
  {
    path: '/locations/add',
    requiredPermissions: ['add_locations'],
    exact: true,
    description: 'Add location page'
  },
  {
    path: '/locations/[id]',
    requiredPermissions: ['view_locations'],
    exact: false,
    description: 'Location detail page'
  },
  {
    path: '/locations/edit',
    requiredPermissions: ['edit_locations'],
    exact: false,
    description: 'Edit location page'
  },

  // Delivery routes
  {
    path: '/delivery',
    requiredPermissions: ['view_delivery'],
    exact: true,
    description: 'Delivery list page'
  },
  {
    path: '/delivery/new',
    requiredPermissions: ['add_delivery'],
    exact: true,
    description: 'Create delivery note page'
  },
  {
    path: '/delivery/[id]',
    requiredPermissions: ['view_delivery'],
    exact: false,
    description: 'Delivery detail page'
  },
  {
    path: '/delivery/[id]/edit',
    requiredPermissions: ['edit_delivery'],
    exact: false,
    description: 'Edit delivery note page'
  },

  // Tracking route
  {
    path: '/tracking',
    requiredPermissions: ['view_tracking'],
    exact: true,
    description: 'Tracking page'
  },

  // Analytics route
  {
    path: '/analytics',
    requiredPermissions: ['view_analytics'],
    exact: true,
    description: 'Analytics page'
  },

  // Reports route
  {
    path: '/reports',
    requiredPermissions: ['view_reports'],
    exact: true,
    description: 'Reports page'
  },

  // Chatbot route
  {
    path: '/chatbot',
    requiredPermissions: ['view_chatbot'],
    exact: true,
    description: 'Chatbot page'
  },

  // Audit Logs route
  {
    path: '/audit-logs',
    requiredPermissions: ['view_audit_logs'],
    exact: true,
    description: 'Audit logs page'
  },

  // Settings routes
  {
    path: '/settings',
    requiredPermissions: ['view_settings'],
    exact: false,
    description: 'Settings page for managing vehicle constants'
  },
];

/**
 * Get the redirect path for a user based on their permissions
 */
export function getRedirectPathForUser(user: User | null): string {
  if (!user) {
    return '/auth/login';
  }

  // Check if user has dashboard access
  if (hasAnyPermission(user, ['view_dashboard'])) {
    return '/dashboard';
  }

  // Try to find first accessible route from navigation
  const accessibleItems = getNavigationForUser(user);
  if (accessibleItems.length > 0) {
    return accessibleItems[0].href;
  }

  // If user has no permissions, redirect to dashboard anyway
  // (route guard will handle showing access denied if needed)
  return '/dashboard';
}

/**
 * Check if a path requires authentication
 */
export function isAuthRequiredForPath(path: string): boolean {
  // Check if path matches any route config that requires permissions
  const matchingConfig = ROUTE_CONFIGS.find(config => {
    if (config.path === '/') {
      return config.exact ? path === '/' : path.startsWith('/');
    }
    return path.startsWith(config.path);
  });

  // If route has requiredPermissions, it needs authentication
  if (matchingConfig && matchingConfig.requiredPermissions) {
    return true;
  }

  // Public routes (/, /auth) don't require authentication
  return path !== '/' && !path.startsWith('/auth');
}

/**
 * Check if a user has permission to access a specific path
 */
export function checkPermissionAccess(path: string, user: User | null): boolean {
  if (!user) {
    return false;
  }

  // Find matching route config
  const matchingConfig = ROUTE_CONFIGS.find(config => {
    if (config.path === '/') {
      return config.exact ? path === '/' : path.startsWith('/');
    }
    
    // Handle dynamic routes like [id]
    if (config.path.includes('[id]')) {
      const basePath = config.path.split('/[')[0];
      return path.startsWith(basePath);
    }
    
    return path.startsWith(config.path);
  });

  if (!matchingConfig) {
    // If no specific config found, deny access by default (secure by default)
    return false;
  }

  // If route has no required permissions, it's public
  if (!matchingConfig.requiredPermissions || matchingConfig.requiredPermissions.length === 0) {
    return true;
  }

  // Check if user has any of the required permissions
  return hasAnyPermission(user, matchingConfig.requiredPermissions);
}

/**
 * Get route configuration for a specific path
 */
export function getRouteConfig(path: string): RouteConfig | undefined {
  return ROUTE_CONFIGS.find(config => {
    if (config.path === '/') {
      return config.exact ? path === '/' : path.startsWith('/');
    }
    
    // Handle dynamic routes like [id]
    if (config.path.includes('[id]')) {
      const basePath = config.path.split('/[')[0];
      return path.startsWith(basePath);
    }
    
    return path.startsWith(config.path);
  });
}

// Legacy function for backward compatibility (deprecated)
/**
 * @deprecated Use getRedirectPathForUser instead
 */
export function getRedirectPathForRole(role: string): string {
  return '/dashboard';
}

// Legacy function for backward compatibility (deprecated)
/**
 * @deprecated Use checkPermissionAccess instead
 */
export function checkRoleAccess(path: string, userRole: string): boolean {
  // This function is deprecated and should not be used
  // It always returns false to force migration to permission-based system
  return false;
}
