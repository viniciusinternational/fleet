'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface NationalityFilterProps {
  initialValue?: string;
  nationalities?: string[];
}

export function NationalityFilter({ 
  initialValue = 'all',
  nationalities = []
}: NationalityFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [nationality, setNationality] = useState(initialValue);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip on initial mount to avoid loop
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    
    // Only update if nationality value differs from URL param
    const currentNationality = params.get('nationality') || 'all';
    if (nationality === currentNationality || 
        (nationality === 'all' && !params.has('nationality'))) {
      return; // No change needed
    }
    
    if (nationality && nationality !== 'all') {
      params.set('nationality', nationality);
    } else {
      params.delete('nationality');
    }
    
    // Reset to page 1 when filtering
    params.set('page', '1');
    
    router.push(`/sources?${params.toString()}`);
  }, [nationality, router]);

  return (
    <div className="space-y-2">
      <Label htmlFor="nationality-filter">Nationality</Label>
      <Select value={nationality} onValueChange={setNationality}>
        <SelectTrigger id="nationality-filter" className="w-[180px]">
          <SelectValue placeholder="All Nationalities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Nationalities</SelectItem>
          {nationalities.map((nat) => (
            <SelectItem key={nat} value={nat}>
              {nat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

