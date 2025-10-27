import type { NavigationItem, Role } from '../types';

export const navigationConfig: NavigationItem[] = [
  // Normal User Navigation (prioritized for Normal users)
  {
    id: 'normal-dashboard',
    label: 'Tracking Dashboard',
    icon: 'LayoutDashboard',
    href: '/normal/dashboard',
    roles: ['Normal'],
    description: 'Streamlined view for tracking vehicles with search and location filtering'
  },
  {
    id: 'normal-vehicles',
    label: 'Vehicle Management',
    icon: 'Car',
    href: '/normal/vehicles',
    roles: ['Normal'],
    description: 'View and track vehicles relevant to your location'
  },
  {
    id: 'normal-tracking',
    label: 'Event Tracking',
    icon: 'Activity',
    href: '/normal/tracking',
    roles: ['Normal'],
    description: 'View and track vehicle journey events and status changes'
  },

  // Admin Navigation
  {
    id: 'admin-dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    href: '/admin/dashboard',
    roles: ['Admin'],
  },
  {
    id: 'admin-vehicles',
    label: 'Vehicle Management',
    icon: 'Car',
    href: '/admin/vehicles',
    roles: ['Admin'],
    description: 'Admin vehicle management and monitoring'
  },
  {
    id: 'admin-owners',
    label: 'Owner Management',
    icon: 'UserCheck',
    href: '/admin/owners',
    roles: ['Admin'],
    description: 'Manage vehicle owners and their information'
  },
  {
    id: 'admin-delivery',
    label: 'Delivery Notes',
    icon: 'FileText',
    href: '/admin/delivery',
    roles: ['Admin'],
    description: 'View and manage all delivery notes'
  },
  {
    id: 'admin-chatbot',
    label: 'AI Assistant',
    icon: 'Bot',
    href: '/admin/chatbot',
    roles: ['Admin'],
    description: 'Chat with AI about vehicles, owners, and locations'
  },
  {
    id: 'admin-users',
    label: 'User Management',
    icon: 'Users',
    href: '/admin/users',
    roles: ['Admin'],
  },
  {
    id: 'admin-locations',
    label: 'Location Management',
    icon: 'MapPin',
    href: '/admin/locations',
    roles: ['Admin'],
  },

  // CEO Navigation - Strategic Analytics
  {
    id: 'ceo-dashboard',
    label: 'Executive Dashboard',
    icon: 'LayoutDashboard',
    href: '/ceo/dashboard',
    roles: ['CEO'],
    description: 'Strategic overview and performance analytics'
  },
  {
    id: 'ceo-analytics',
    label: 'Analytics & Reports',
    icon: 'BarChart3',
    href: '/ceo/analytics',
    roles: ['CEO'],
    description: 'Comprehensive business intelligence and performance metrics'
  },
  {
    id: 'ceo-reports',
    label: 'Custom Reports',
    icon: 'FileText',
    href: '/ceo/reports',
    roles: ['CEO'],
    description: 'Generate and view custom business reports'
  },
];

export const getNavigationForRole = (userRole: Role): NavigationItem[] => {
  return navigationConfig.filter(item => item.roles.includes(userRole));
};

export const getRoleBaseDashboard = (userRole: Role): string => {
  const dashboards: Record<Role, string> = {
    Admin: '/admin/dashboard',
    Normal: '/normal/dashboard',
    CEO: '/ceo/dashboard',
  };
  
  return dashboards[userRole];
}; 