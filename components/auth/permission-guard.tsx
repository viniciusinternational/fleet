'use client';

import { useAuthStore } from '@/store/auth';
import { hasPermission, type PermissionKey } from '@/lib/permissions';

interface PermissionGuardProps {
  permission: PermissionKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * PermissionGuard - Conditionally renders children based on user permissions
 * 
 * @example
 * <PermissionGuard permission="add_vehicles">
 *   <Button>Add Vehicle</Button>
 * </PermissionGuard>
 */
export function PermissionGuard({ 
  permission, 
  children, 
  fallback = null 
}: PermissionGuardProps) {
  const { user } = useAuthStore();

  if (!user || !hasPermission(user, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
