'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Edit, 
  Trash2, 
  Eye,
  ArrowUpDown
} from 'lucide-react';
import type { Owner } from '@/types';
import { DeleteOwnerDialog } from './delete-owner-dialog';
import { useAuthStore } from '@/store/auth';
import { hasPermission } from '@/lib/permissions';

interface OwnerTableProps {
  owners: Owner[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  onDelete?: (ownerId: string) => void;
}

export function OwnerTable({ 
  owners, 
  sortBy = 'name', 
  sortOrder = 'asc',
  onSort,
  onDelete 
}: OwnerTableProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState<Owner | null>(null);

  const handleSort = (field: string) => {
    if (onSort) {
      onSort(field);
    }
  };

  const handleDeleteClick = (owner: Owner) => {
    setOwnerToDelete(owner);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (ownerId: string) => {
    if (onDelete) {
      await onDelete(ownerId);
    }
  };

  const handleViewOwner = (ownerId: string) => {
    router.push(`/admin/owners/${ownerId}`);
  };

  const handleEditOwner = (ownerId: string) => {
    router.push(`/admin/owners/edit/${ownerId}`);
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    return <ArrowUpDown className={`h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />;
  };

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Owner
                  {getSortIcon('name')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                  {getSortIcon('email')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('phone')}
              >
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                  {getSortIcon('phone')}
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('country')}
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Country
                  {getSortIcon('country')}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {owners.map((owner) => (
              <TableRow key={owner.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-base">{owner.name}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{owner.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{owner.phone}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    <div className="text-sm truncate" title={owner.address}>
                      {owner.address}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {owner.country}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {user && hasPermission(user, 'view_owners') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewOwner(owner.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {user && hasPermission(user, 'edit_owners') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditOwner(owner.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {user && hasPermission(user, 'delete_owners') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(owner)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteOwnerDialog
        owner={ownerToDelete}
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setOwnerToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
