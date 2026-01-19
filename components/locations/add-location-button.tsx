'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { hasPermission } from '@/lib/permissions';

export function AddLocationButton() {
  const router = useRouter();
  const { user } = useAuthStore();

  if (!user || !hasPermission(user, 'add_locations')) {
    return null;
  }

  return (
    <Button 
      onClick={() => router.push('/locations/add')}
      className="flex items-center gap-2"
    >
      <Plus className="h-4 w-4" />
      Add Location
    </Button>
  );
}
