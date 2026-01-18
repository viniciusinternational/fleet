'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { PermissionKey, UserPermissions } from '@/types';

interface PermissionManagerProps {
  permissions: UserPermissions;
  onChange: (permissions: UserPermissions) => void;
  disabled?: boolean;
}

const permissionGroups = [
  {
    label: 'Dashboard',
    permissions: ['view_dashboard', 'view_executive_dashboard'] as PermissionKey[],
  },
  {
    label: 'Vehicles',
    permissions: ['view_vehicles', 'add_vehicles', 'edit_vehicles', 'delete_vehicles'] as PermissionKey[],
  },
  {
    label: 'Users',
    permissions: ['view_users', 'add_users', 'edit_users', 'delete_users'] as PermissionKey[],
  },
  {
    label: 'Owners',
    permissions: ['view_owners', 'add_owners', 'edit_owners', 'delete_owners'] as PermissionKey[],
  },
  {
    label: 'Sources',
    permissions: ['view_sources', 'add_sources', 'edit_sources', 'delete_sources'] as PermissionKey[],
  },
  {
    label: 'Locations',
    permissions: ['view_locations', 'add_locations', 'edit_locations', 'delete_locations'] as PermissionKey[],
  },
  {
    label: 'Delivery',
    permissions: ['view_delivery', 'add_delivery', 'edit_delivery'] as PermissionKey[],
  },
  {
    label: 'Tracking',
    permissions: ['view_tracking'] as PermissionKey[],
  },
  {
    label: 'Analytics',
    permissions: ['view_analytics'] as PermissionKey[],
  },
  {
    label: 'Reports',
    permissions: ['view_reports'] as PermissionKey[],
  },
  {
    label: 'Chatbot',
    permissions: ['view_chatbot'] as PermissionKey[],
  },
  {
    label: 'Audit Logs',
    permissions: ['view_audit_logs'] as PermissionKey[],
  },
];

const getActionLabel = (permission: PermissionKey): string => {
  if (permission.startsWith('view_')) return 'View';
  if (permission.startsWith('add_')) return 'Add';
  if (permission.startsWith('edit_')) return 'Edit';
  if (permission.startsWith('delete_')) return 'Delete';
  return permission;
};

export const PermissionManager: React.FC<PermissionManagerProps> = ({
  permissions,
  onChange,
  disabled = false,
}) => {
  const handlePermissionToggle = (permission: PermissionKey, checked: boolean) => {
    onChange({
      ...permissions,
      [permission]: checked,
    });
  };

  const handleModuleToggle = (modulePermissions: PermissionKey[], checked: boolean) => {
    const updated = { ...permissions };
    modulePermissions.forEach((perm) => {
      updated[perm] = checked;
    });
    onChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Permissions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {permissionGroups.map((group) => {
            const allEnabled = group.permissions.every((perm) => permissions[perm] === true);

            return (
              <div
                key={group.label}
                className="p-6 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-semibold text-foreground">{group.label}</Label>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">All</Label>
                    <Switch
                      checked={allEnabled}
                      onCheckedChange={(checked) => handleModuleToggle(group.permissions, checked)}
                      disabled={disabled}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  {group.permissions.map((permission) => (
                    <div
                      key={permission}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 hover:bg-muted transition-colors border border-border"
                    >
                      <Label
                        htmlFor={permission}
                        className="text-xs font-normal cursor-pointer text-foreground"
                      >
                        {getActionLabel(permission)}
                      </Label>
                      <Switch
                        id={permission}
                        checked={permissions[permission] === true}
                        onCheckedChange={(checked) => handlePermissionToggle(permission, checked)}
                        disabled={disabled}
                        className="scale-75"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

