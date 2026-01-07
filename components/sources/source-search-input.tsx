'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SourceSearchInputProps {
  initialValue?: string;
}

export function SourceSearchInput({ initialValue = '' }: SourceSearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialValue);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip on initial mount to avoid loop
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      // Only update if search value differs from URL param
      const currentSearch = params.get('search') || '';
      if (search === currentSearch) {
        return; // No change needed
      }
      
      if (search) {
        params.set('search', search);
      } else {
        params.delete('search');
      }
      
      // Reset to page 1 when searching
      params.set('page', '1');
      
      router.push(`/sources?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, router]);

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        type="text"
        placeholder="Search sources by name, email, phone, or ID number..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}

