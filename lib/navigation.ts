import type { NavigationItem, User } from '../types';
import { canAccessModule, hasPermission } from '@/lib/permissions';

export const navigationConfig: NavigationItem[] = [
  // Dashboard
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    href: '/dashboard',
    requiredPermission: 'view_dashboard',
    description: 'Main dashboard overview'
  },

  // Vehicles
  {
    id: 'vehicles',
    label: 'Vehicle Management',
    icon: 'Car',
    href: '/vehicles',
    requiredPermission: 'view_vehicles',
    description: 'View and manage vehicles'
  },

  // Users
  {
    id: 'users',
    label: 'User Management',
    icon: 'Users',
    href: '/users',
    requiredPermission: 'view_users',
    description: 'Manage system users'
  },

  // Owners
  {
    id: 'owners',
    label: 'Owner Management',
    icon: 'UserCheck',
    href: '/owners',
    requiredPermission: 'view_owners',
    description: 'Manage vehicle owners and their information'
  },

  // Locations
  {
    id: 'locations',
    label: 'Location Management',
    icon: 'MapPin',
    href: '/locations',
    requiredPermission: 'view_locations',
    description: 'Manage locations'
  },

  // Delivery
  {
    id: 'delivery',
    label: 'Delivery Notes',
    icon: 'FileText',
    href: '/delivery',
    requiredPermission: 'view_delivery',
    description: 'View and manage delivery notes'
  },

  // Tracking
  {
    id: 'tracking',
    label: 'Event Tracking',
    icon: 'Activity',
    href: '/tracking',
    requiredPermission: 'view_tracking',
    description: 'View and track vehicle journey events and status changes'
  },

  // Analytics
  {
    id: 'analytics',
    label: 'Analytics & Reports',
    icon: 'BarChart3',
    href: '/analytics',
    requiredPermission: 'view_analytics',
    description: 'Comprehensive business intelligence and performance metrics'
  },

  // Reports
  {
    id: 'reports',
    label: 'Custom Reports',
    icon: 'FileText',
    href: '/reports',
    requiredPermission: 'view_reports',
    description: 'Generate and view custom business reports'
  },

  // Chatbot
  {
    id: 'chatbot',
    label: 'AI Assistant',
    icon: 'Bot',
    href: '/chatbot',
    requiredPermission: 'view_chatbot',
    description: 'Chat with AI about vehicles, owners, and locations'
  },
];

/**
 * Get navigation items for a user based on their permissions
 * @param user - User object or null
 * @returns Array of navigation items the user has access to
 */
export const getNavigationForUser = (user: User | null): NavigationItem[] => {
  if (!user) {
    return [];
  }

  return navigationConfig.filter(item => {
    // If item has requiredPermission, check if user has it
    if (item.requiredPermission) {
      return hasPermission(user, item.requiredPermission);
    }
    
    // Fallback to role-based check for backward compatibility
    if (item.roles && item.roles.length > 0) {
      return item.roles.includes(user.role);
    }
    
    // If no permission or role requirement, include it
    return true;
  });
};

/**
 * @deprecated Use getNavigationForUser instead
 * Get navigation items for a role (kept for backward compatibility)
 */
export const getNavigationForRole = (userRole: string): NavigationItem[] => {
  return navigationConfig.filter(item => {
    if (item.roles && item.roles.length > 0) {
      return item.roles.includes(userRole as any);
    }
    return false;
  });
};

/**
 * Get the dashboard path for a user based on their permissions
 * @param user - User object or null
 * @returns Dashboard path or '/dashboard' as default
 */
export const getUserDashboard = (user: User | null): string => {
  if (!user) {
    return '/auth/login';
  }

  // Check if user has dashboard permission
  if (hasPermission(user, 'view_dashboard')) {
    return '/dashboard';
  }

  // Fallback: try to find first accessible module
  const accessibleItems = getNavigationForUser(user);
  if (accessibleItems.length > 0) {
    return accessibleItems[0].href;
  }

  return '/auth/login';
};

/**
 * @deprecated Use getUserDashboard instead
 */
export const getRoleBaseDashboard = (userRole: string): string => {
  return '/dashboard';
};
