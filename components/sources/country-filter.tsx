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
import { COUNTRIES } from '@/lib/constants/countries';

interface CountryFilterProps {
  initialValue?: string;
  countries?: string[];
}

export function CountryFilter({ 
  initialValue = 'all',
  countries = []
}: CountryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [country, setCountry] = useState(initialValue);
  const isInitialMount = useRef(true);

  // Use provided countries list or fallback to all countries
  const countryList = countries.length > 0 ? countries : COUNTRIES;

  useEffect(() => {
    // Skip on initial mount to avoid loop
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    
    // Only update if country value differs from URL param
    const currentCountry = params.get('country') || 'all';
    if (country === currentCountry || 
        (country === 'all' && !params.has('country'))) {
      return; // No change needed
    }
    
    if (country && country !== 'all') {
      params.set('country', country);
    } else {
      params.delete('country');
    }
    
    // Reset to page 1 when filtering
    params.set('page', '1');
    
    router.push(`/sources?${params.toString()}`);
  }, [country, router, searchParams]);

  return (
    <div className="space-y-2">
      <Label htmlFor="country-filter">Country</Label>
      <Select value={country} onValueChange={setCountry}>
        <SelectTrigger id="country-filter" className="w-[180px]">
          <SelectValue placeholder="All Countries" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Countries</SelectItem>
          {countryList.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
