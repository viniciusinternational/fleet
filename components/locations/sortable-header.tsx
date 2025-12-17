'use client';

import { useRouter } from 'next/navigation';
import { TableHead } from '@/components/ui/table';
import { ArrowUpDown } from 'lucide-react';

interface SortableHeaderProps {
  field: string;
  children: React.ReactNode;
  currentSortBy?: string;
  currentSortOrder?: 'asc' | 'desc';
  className?: string;
}

export function SortableHeader({ 
  field, 
  children, 
  currentSortBy, 
  currentSortOrder, 
  className 
}: SortableHeaderProps) {
  const router = useRouter();

  const handleSort = () => {
    const params = new URLSearchParams(window.location.search);
    
    if (currentSortBy === field) {
      // Toggle sort order
      const newOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
      params.set('sortOrder', newOrder);
    } else {
      // New field, default to asc
      params.set('sortBy', field);
      params.set('sortOrder', 'asc');
    }
    
    router.push(`?${params.toString()}`);
  };

  return (
    <TableHead 
      className={`cursor-pointer hover:bg-muted/50 px-3 py-3 ${className}`}
      onClick={handleSort}
    >
      <div className="flex items-center gap-2">
        {children}
        <ArrowUpDown className="h-3 w-3" />
      </div>
    </TableHead>
  );
}

