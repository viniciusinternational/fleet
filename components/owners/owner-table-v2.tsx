'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone
} from 'lucide-react';
import type { Owner } from '@/types';
import { DataTable, TableColumn } from '@/components/ui/data-table';

interface OwnerTableProps {
  owners: Owner[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

export function OwnerTableV2({ 
  owners, 
  sortBy = 'name', 
  sortOrder = 'asc',
  onSort
}: OwnerTableProps) {
  const router = useRouter();

  const handleRowClick = (owner: Owner) => {
    router.push(`/owners/${owner.id}`);
  };

  const columns: TableColumn<Owner>[] = [
    {
      key: 'name',
      label: 'Owner',
      sortable: true,
      icon: <User className="h-4 w-4" />,
      render: (owner) => (
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="font-medium text-sm sm:text-base truncate">{owner.name}</div>
            <div className="text-xs sm:text-sm text-muted-foreground truncate">ID: {owner.idNumber}</div>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      icon: <Mail className="h-4 w-4" />,
      render: (owner) => (
        <div className="flex items-center gap-2 min-w-0">
          <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-xs sm:text-sm truncate min-w-0">{owner.email}</span>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: true,
      icon: <Phone className="h-4 w-4" />,
      render: (owner) => (
        <div className="flex items-center gap-2 min-w-0">
          <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-xs sm:text-sm truncate min-w-0">{owner.phone}</span>
        </div>
      )
    }
  ];

  return (
    <DataTable
      data={owners}
      columns={columns}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={onSort}
      onRowClick={handleRowClick}
      rowClassName="hover:bg-muted/50 cursor-pointer"
    />
  );
}
