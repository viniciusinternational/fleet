'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface OwnerSearchInputProps {
  initialValue?: string;
}

export function OwnerSearchInput({ initialValue = '' }: OwnerSearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(initialValue);

  const updateSearchParams = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    params.delete('page'); // Reset to first page when searching
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    updateSearchParams(value);
  };

  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search owners by name, email, or phone..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10 w-full"
      />
    </div>
  );
}
