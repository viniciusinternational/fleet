'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { hasPermission } from '@/lib/permissions';

export function UserListActions() {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();

  if (!currentUser || !hasPermission(currentUser, 'add_users')) {
    return null;
  }

  return (
    <Button 
      onClick={() => router.push('/users/add')}
      className="flex items-center gap-2"
    >
      <Plus className="h-4 w-4" />
      Add User
    </Button>
  );
}

