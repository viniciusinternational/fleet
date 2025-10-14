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

  // CEO Navigation - Basic Analytics
  {
    id: 'ceo-dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    href: '/ceo/dashboard',
    roles: ['CEO'],
    description: 'Basic overview of vehicle operations and financial metrics'
  },
  {
    id: 'ceo-financial',
    label: 'Financial Summary',
    icon: 'DollarSign',
    href: '/ceo/financial',
    roles: ['CEO'],
    description: 'Import duties and financial performance overview'
  },
  {
    id: 'ceo-locations',
    label: 'Location Overview',
    icon: 'MapPin',
    href: '/ceo/locations',
    roles: ['CEO'],
    description: 'Geographic distribution and location performance'
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