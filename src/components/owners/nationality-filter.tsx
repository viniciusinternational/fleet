'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { useCallback } from 'react';

interface NationalityFilterProps {
  initialValue?: string;
}

export function NationalityFilter({ initialValue = 'all' }: NationalityFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set('nationality', value);
    } else {
      params.delete('nationality');
    }
    params.delete('page'); // Reset to first page when filtering
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <Select value={initialValue} onValueChange={updateFilter}>
      <SelectTrigger className="w-full sm:w-40">
        <Globe className="h-4 w-4 mr-2" />
        <SelectValue placeholder="Nationality" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Nationalities</SelectItem>
        <SelectItem value="Nigerian">Nigerian</SelectItem>
        <SelectItem value="Ghanaian">Ghanaian</SelectItem>
        <SelectItem value="Kenyan">Kenyan</SelectItem>
        <SelectItem value="South African">South African</SelectItem>
        <SelectItem value="Egyptian">Egyptian</SelectItem>
        <SelectItem value="Other">Other</SelectItem>
      </SelectContent>
    </Select>
  );
}
