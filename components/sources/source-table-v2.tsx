'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Eye } from 'lucide-react';
import type { Source } from '@/types';

interface SourceTableProps {
  sources: Source[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

export function SourceTableV2({ 
  sources, 
  sortBy = 'name', 
  sortOrder = 'asc',
  onSort
}: SourceTableProps) {
  const router = useRouter();

  const handleSort = (field: string) => {
    if (onSort) {
      onSort(field);
    }
  };

  const handleRowClick = (sourceId: string) => {
    router.push(`/sources/${sourceId}`);
  };

  const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => {
    const isActive = sortBy === field;
    return (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent"
        onClick={() => handleSort(field)}
      >
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    );
  };

  if (sources.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No sources found
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortButton field="name">Name</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="email">Email</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="phone">Phone</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="nationality">Nationality</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="idNumber">ID Number</SortButton>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sources.map((source) => (
            <TableRow 
              key={source.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleRowClick(source.id)}
            >
              <TableCell className="font-medium">{source.name}</TableCell>
              <TableCell>{source.email}</TableCell>
              <TableCell>{source.phone}</TableCell>
              <TableCell>{source.nationality}</TableCell>
              <TableCell>{source.idNumber}</TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRowClick(source.id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

