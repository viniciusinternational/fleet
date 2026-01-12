'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  User,
  Shield, 
  Crown, 
  UserCheck,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Role, User as UserType } from '@/types';
import { SortableHeader } from '../locations/sortable-header';
import { DeleteUserDialog } from './delete-user-dialog';
import { useAuthStore } from '@/store/auth';
import { hasPermission } from '@/lib/permissions';
import { getRoleBadgeClass, getStatusBadgeClass } from '@/lib/utils/user-colors';

interface UserTableProps {
  users: UserType[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function UserTable({ 
  users, 
  sortBy, 
  sortOrder
}: UserTableProps) {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const formatDate = (dateString: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  const formatDateTime = (dateString: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'Admin':
        return <Shield className="h-3 w-3" />;
      case 'CEO':
        return <Crown className="h-3 w-3" />;
      case 'Normal':
        return <UserCheck className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive 
      ? <CheckCircle className="h-3 w-3" /> 
      : <XCircle className="h-3 w-3" />;
  };

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase();
  };

  const handleUserClick = (userId: string) => {
    router.push(`/users/${userId}`);
  };

  const openDeleteDialog = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <SortableHeader 
                field="firstName" 
                currentSortBy={sortBy} 
                currentSortOrder={sortOrder}
                className="min-w-[200px]"
              >
                User
              </SortableHeader>
              <SortableHeader 
                field="role" 
                currentSortBy={sortBy} 
                currentSortOrder={sortOrder}
                className="min-w-[140px] hidden md:table-cell"
              >
                Role
              </SortableHeader>
              <TableHead className="px-4 py-3 min-w-[100px]">Status</TableHead>
              <TableHead className="px-4 py-3 min-w-[120px] hidden lg:table-cell">Location</TableHead>
              <SortableHeader 
                field="createdAt" 
                currentSortBy={sortBy} 
                currentSortOrder={sortOrder}
                className="min-w-[100px] hidden xl:table-cell"
              >
                Created
              </SortableHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow 
                key={user.id}
                className="hover:bg-accent/50 cursor-pointer group transition-colors"
                onClick={() => handleUserClick(user.id)}
              >
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm">{user.firstName} {user.lastName}</div>
                      <div className="text-xs text-muted-foreground">ID: {user.id}</div>
                      <div className="text-xs text-muted-foreground hidden sm:block">
                        {user.lastLogin ? `Last login: ${formatDateTime(user.lastLogin)}` : 'Never logged in'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 hidden md:table-cell">
                  <Badge variant="outline" className={`${getRoleBadgeClass(user.role)} text-xs px-2 py-1`}>
                    {getRoleIcon(user.role)}
                    <span className="ml-1">{user.role}</span>
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge variant="outline" className={`${getStatusBadgeClass(user.isActive)} text-xs px-2 py-1`}>
                    {getStatusIcon(user.isActive)}
                    <span className="ml-1">{user.isActive ? 'Active' : 'Inactive'}</span>
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 hidden lg:table-cell">
                  <div>
                    <div className="font-medium text-sm">{user.location.name}</div>
                    <div className="text-xs text-muted-foreground">{user.location.address.city}</div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 hidden xl:table-cell">
                  <div className="text-sm text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteUserDialog
        userId={userToDelete}
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
      />
    </>
  );
}
