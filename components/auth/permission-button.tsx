'use client';

import { useAuthStore } from '@/store/auth';
import { hasPermission, type PermissionKey } from '@/lib/permissions';
import { Button, type ButtonProps } from '@/components/ui/button';

interface PermissionButtonProps extends ButtonProps {
  permission: PermissionKey;
  children: React.ReactNode;
}

/**
 * PermissionButton - Button component that automatically hides when user lacks permission
 * 
 * @example
 * <PermissionButton permission="add_vehicles" onClick={handleAdd}>
 *   Add Vehicle
 * </PermissionButton>
 */
export function PermissionButton({ 
  permission, 
  children, 
  ...buttonProps 
}: PermissionButtonProps) {
  const { user } = useAuthStore();

  if (!user || !hasPermission(user, permission)) {
    return null;
  }

  return (
    <Button {...buttonProps}>
      {children}
    </Button>
  );
}
