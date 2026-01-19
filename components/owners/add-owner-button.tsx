'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { hasPermission } from '@/lib/permissions';

export function AddOwnerButton() {
  const router = useRouter();
  const { user } = useAuthStore();

  if (!user || !hasPermission(user, 'add_owners')) {
    return null;
  }

  return (
    <Button 
      onClick={() => router.push('/owners/add')}
      className="flex items-center gap-2 w-full sm:w-auto"
    >
      <Plus className="h-4 w-4" />
      Add Clients
    </Button>
  );
}
