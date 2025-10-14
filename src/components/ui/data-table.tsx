'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown } from 'lucide-react';

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  icon?: React.ReactNode;
}

export interface TableAction<T = any> {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick: (item: T) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  onRowClick?: (item: T) => void;
  rowClassName?: string;
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  actions = [],
  sortBy,
  sortOrder = 'asc',
  onSort,
  onRowClick,
  rowClassName = 'hover:bg-muted/50',
  loading = false,
  emptyMessage = 'No data available'
}: DataTableProps<T>) {
  const getSortIcon = (field: string) => {
    if (!onSort || sortBy !== field) return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    return <ArrowUpDown className={`h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />;
  };

  const handleSort = (field: string) => {
    if (onSort) {
      onSort(field);
    }
  };

  if (loading) {
    return (
      <div className="rounded-md border overflow-x-auto w-full">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map((column) => (
                <TableHead key={column.key} className={column.headerClassName}>
                  {column.icon && <span className="mr-2">{column.icon}</span>}
                  {column.label}
                </TableHead>
              ))}
              {actions.length > 0 && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    <div className="h-4 bg-muted animate-pulse rounded" />
                  </TableCell>
                ))}
                {actions.length > 0 && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {actions.map((action) => (
                        <div key={action.key} className="h-8 w-8 bg-muted animate-pulse rounded" />
                      ))}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-md border w-full">
        <div className="p-8 text-center text-muted-foreground">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto w-full">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-muted/50">
            {columns.map((column) => (
              <TableHead 
                key={column.key} 
                className={`${column.headerClassName || ''} ${column.sortable ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                onClick={column.sortable ? () => handleSort(column.key) : undefined}
              >
                <div className="flex items-center gap-2">
                  {column.icon && <span>{column.icon}</span>}
                  {column.label}
                  {column.sortable && getSortIcon(column.key)}
                </div>
              </TableHead>
            ))}
            {actions.length > 0 && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow 
              key={item.id} 
              className={`${rowClassName} ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
            >
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.render ? column.render(item) : (item as any)[column.key]}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {actions.map((action) => (
                      <Button
                        key={action.key}
                        variant={action.variant || 'ghost'}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick(item);
                        }}
                        className={`h-8 w-8 p-0 ${action.className || ''}`}
                        title={action.label}
                      >
                        {action.icon}
                      </Button>
                    ))}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
