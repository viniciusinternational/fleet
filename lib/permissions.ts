import type { User, PermissionKey, UserPermissions } from '@/types';

/**
 * Get user's permissions object
 * @param user - User object or null
 * @returns UserPermissions object or empty object if user/permissions don't exist
 */
export function getUserPermissions(user: User | null): UserPermissions {
  if (!user || !user.permissions) {
    return {} as UserPermissions;
  }
  return user.permissions;
}

/**
 * Check if user has a specific permission
 * @param user - User object or null
 * @param permission - Permission key to check
 * @returns true if permission exists and is true, false otherwise
 */
export function hasPermission(user: User | null, permission: PermissionKey): boolean {
  if (!user || !user.permissions) {
    console.log('hasPermission: No user or permissions', { user: !!user, hasPermissions: !!user?.permissions });
    return false;
  }
  
  const result = user.permissions[permission] === true;
  
  // DEBUG for view_settings
  if (permission === 'view_settings') {
    console.log('hasPermission DEBUG for view_settings:', {
      permission,
      permissionsObject: user.permissions,
      permissionValue: user.permissions[permission],
      permissionType: typeof user.permissions[permission],
      result,
      strictCheck: user.permissions[permission] === true,
      looseCheck: user.permissions[permission] == true
    });
  }
  
  return result;
}

/**
 * Check if user has any of the specified permissions (OR logic)
 * @param user - User object or null
 * @param permissions - Array of permission keys to check
 * @returns true if user has at least one of the specified permissions
 */
export function hasAnyPermission(user: User | null, permissions: PermissionKey[]): boolean {
  if (!user || !user.permissions || permissions.length === 0) {
    return false;
  }
  return permissions.some(permission => user.permissions?.[permission] === true);
}

/**
 * Check if user has all of the specified permissions (AND logic)
 * @param user - User object or null
 * @param permissions - Array of permission keys to check
 * @returns true if user has all of the specified permissions
 */
export function hasAllPermissions(user: User | null, permissions: PermissionKey[]): boolean {
  if (!user || !user.permissions || permissions.length === 0) {
    return false;
  }
  return permissions.every(permission => user.permissions?.[permission] === true);
}

/**
 * Check if user can access a module (checks for view_{module} permission)
 * @param user - User object or null
 * @param module - Module name (e.g., 'vehicles', 'users')
 * @returns true if user has view permission for the module
 */
export function canAccessModule(user: User | null, module: string): boolean {
  const viewPermission = `view_${module}` as PermissionKey;
  return hasPermission(user, viewPermission);
}

/**
 * Check if user can perform an action on a module
 * @param user - User object or null
 * @param module - Module name (e.g., 'vehicles', 'users')
 * @param action - Action to perform ('view' | 'add' | 'edit' | 'delete' | 'approve')
 * @returns true if user has the required permission
 */
export function canPerformAction(
  user: User | null,
  module: string,
  action: 'view' | 'add' | 'edit' | 'delete' | 'approve'
): boolean {
  const permission = `${action}_${module}` as PermissionKey;
  return hasPermission(user, permission);
}

