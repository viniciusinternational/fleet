import type { PermissionKey, UserPermissions } from '@/types';

/**
 * Single source of truth for permission groups (label + keys) used by
 * PermissionManager (create/edit user) and the user detail view (Permissions tab).
 */
export const PERMISSION_GROUPS: ReadonlyArray<{ label: string; permissions: readonly PermissionKey[] }> = [
  {
    label: 'Dashboard',
    permissions: ['view_dashboard', 'view_executive_dashboard'],
  },
  {
    label: 'Vehicles',
    permissions: ['view_vehicles', 'add_vehicles', 'edit_vehicles', 'delete_vehicles'],
  },
  {
    label: 'Users',
    permissions: ['view_users', 'add_users', 'edit_users', 'delete_users'],
  },
  {
    label: 'Owners',
    permissions: ['view_owners', 'add_owners', 'edit_owners', 'delete_owners'],
  },
  {
    label: 'Sources',
    permissions: ['view_sources', 'add_sources', 'edit_sources', 'delete_sources'],
  },
  {
    label: 'Locations',
    permissions: ['view_locations', 'add_locations', 'edit_locations', 'delete_locations'],
  },
  {
    label: 'Delivery',
    permissions: ['view_delivery', 'add_delivery', 'edit_delivery'],
  },
  {
    label: 'Tracking',
    permissions: ['view_tracking'],
  },
  {
    label: 'Analytics',
    permissions: ['view_analytics'],
  },
  {
    label: 'Reports',
    permissions: ['view_reports', 'generate_reports'],
  },
  {
    label: 'Chatbot',
    permissions: ['view_chatbot'],
  },
  {
    label: 'Audit Logs',
    permissions: ['view_audit_logs'],
  },
  {
    label: 'Settings',
    permissions: ['view_settings', 'add_settings', 'edit_settings', 'delete_settings'],
  },
];

/** All permission keys in one flat array (derived from groups). */
const ALL_PERMISSION_KEYS: PermissionKey[] = PERMISSION_GROUPS.flatMap((g) => [...g.permissions]);

/**
 * Default UserPermissions with every PermissionKey set to false.
 * Use for new users (create) and as base when merging loaded permissions (edit).
 */
export function getDefaultUserPermissions(): UserPermissions {
  const perms = {} as UserPermissions;
  for (const key of ALL_PERMISSION_KEYS) {
    perms[key] = false;
  }
  return perms;
}

/**
 * Merge loaded permissions with the full default so any key missing from the API
 * is explicitly false (avoids partial overwrite on update).
 */
export function mergeWithDefaultPermissions(loaded: UserPermissions | undefined | null): UserPermissions {
  const base = getDefaultUserPermissions();
  if (!loaded || typeof loaded !== 'object') return base;
  return { ...base, ...loaded };
}
