import { Role } from '@/types';

/**
 * Get theme-based CSS classes for role badges
 * Uses theme variables for consistent styling across light/dark modes
 */
export function getRoleBadgeClass(role: Role): string {
  const baseClasses = 'border';
  
  switch (role) {
    case 'Admin':
      return `${baseClasses} bg-destructive/10 text-destructive border-destructive/20`;
    case 'CEO':
      return `${baseClasses} bg-primary/10 text-primary border-primary/20`;
    case 'Normal':
      return `${baseClasses} bg-secondary text-secondary-foreground border-border`;
    default:
      return `${baseClasses} bg-muted text-muted-foreground border-border`;
  }
}

/**
 * Get theme-based CSS classes for status badges
 * Uses theme variables for consistent styling across light/dark modes
 */
export function getStatusBadgeClass(isActive: boolean): string {
  const baseClasses = 'border';
  
  if (isActive) {
    // Using primary color for active status (can be changed to success if available)
    return `${baseClasses} bg-primary/10 text-primary border-primary/20`;
  } else {
    return `${baseClasses} bg-destructive/10 text-destructive border-destructive/20`;
  }
}
