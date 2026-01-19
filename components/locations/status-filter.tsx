'use client';

import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface StatusFilterProps {
  initialValue?: string;
}

export function StatusFilter({ initialValue = 'all' }: StatusFilterProps) {
  const router = useRouter();

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value === 'all') {
      params.delete('status');
    } else {
      params.set('status', value);
    }
    params.delete('page'); // Reset to first page when filtering
    router.push(`?${params.toString()}`);
  };

  return (
    <Select value={initialValue} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-full sm:w-40">
        <Filter className="h-4 w-4 mr-2" />
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Status</SelectItem>
        <SelectItem value="Active">Active</SelectItem>
        <SelectItem value="Inactive">Inactive</SelectItem>
      </SelectContent>
    </Select>
  );
}

