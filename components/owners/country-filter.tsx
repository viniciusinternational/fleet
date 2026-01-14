'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { useCallback } from 'react';
import { COUNTRIES } from '@/lib/constants/countries';

interface CountryFilterProps {
  initialValue?: string;
}

export function CountryFilter({ initialValue = 'all' }: CountryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set('country', value);
    } else {
      params.delete('country');
    }
    params.delete('page'); // Reset to first page when filtering
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <Select value={initialValue} onValueChange={updateFilter}>
      <SelectTrigger className="w-full sm:w-40">
        <Globe className="h-4 w-4 mr-2" />
        <SelectValue placeholder="Country" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Countries</SelectItem>
        {COUNTRIES.map((country) => (
          <SelectItem key={country} value={country}>
            {country}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
