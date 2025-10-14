'use client';

import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface RoleFilterProps {
  initialValue?: string;
}

export function RoleFilter({ initialValue = 'all' }: RoleFilterProps) {
  const router = useRouter();

  const handleRoleChange = (value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value === 'all') {
      params.delete('role');
    } else {
      params.set('role', value);
    }
    params.delete('page'); // Reset to first page when filtering
    router.push(`?${params.toString()}`);
  };

  return (
    <Select value={initialValue} onValueChange={handleRoleChange}>
      <SelectTrigger className="w-full sm:w-40">
        <Filter className="h-4 w-4 mr-2" />
        <SelectValue placeholder="Role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Roles</SelectItem>
        <SelectItem value="Admin">Admin</SelectItem>
        <SelectItem value="CEO">CEO</SelectItem>
        <SelectItem value="Normal">Normal</SelectItem>
      </SelectContent>
    </Select>
  );
}
