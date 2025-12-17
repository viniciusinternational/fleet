'use client';

import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface TypeFilterProps {
  initialValue?: string;
}

export function TypeFilter({ initialValue = 'all' }: TypeFilterProps) {
  const router = useRouter();

  const handleTypeChange = (value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value === 'all') {
      params.delete('type');
    } else {
      params.set('type', value);
    }
    params.delete('page'); // Reset to first page when filtering
    router.push(`?${params.toString()}`);
  };

  return (
    <Select value={initialValue} onValueChange={handleTypeChange}>
      <SelectTrigger className="w-full sm:w-40">
        <Filter className="h-4 w-4 mr-2" />
        <SelectValue placeholder="Type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Types</SelectItem>
        <SelectItem value="Port">Port</SelectItem>
        <SelectItem value="Warehouse">Warehouse</SelectItem>
        <SelectItem value="Customs Office">Customs Office</SelectItem>
        <SelectItem value="Dealership">Dealership</SelectItem>
        <SelectItem value="Delivery Point">Delivery Point</SelectItem>
      </SelectContent>
    </Select>
  );
}

