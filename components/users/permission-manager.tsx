'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { PermissionKey, UserPermissions } from '@/types';
import { PERMISSION_GROUPS } from '@/lib/permissions-constants';

interface PermissionManagerProps {
  permissions: UserPermissions;
  onChange: (permissions: UserPermissions) => void;
  disabled?: boolean;
}

export function getPermissionActionLabel(permission: PermissionKey): string {
  if (permission.startsWith('view_')) return 'View';
  if (permission.startsWith('add_')) return 'Add';
  if (permission.startsWith('edit_')) return 'Edit';
  if (permission.startsWith('delete_')) return 'Delete';
  if (permission.startsWith('generate_')) return 'Generate';
  return permission;
}

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
          {PERMISSION_GROUPS.map((group) => {
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
                      onCheckedChange={(checked) => handleModuleToggle([...group.permissions], checked)}
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
                        {getPermissionActionLabel(permission)}
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

