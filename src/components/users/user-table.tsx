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

  const getRoleColor = (role: Role) => {
    switch (role) {
      case 'Admin':
        return 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200 dark:from-red-950 dark:to-red-900 dark:text-red-300 dark:border-red-700';
      case 'CEO':
        return 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200 dark:from-purple-950 dark:to-purple-900 dark:text-purple-300 dark:border-purple-700';
      case 'Normal':
        return 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200 dark:from-blue-950 dark:to-blue-900 dark:text-blue-300 dark:border-blue-700';
      default:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 dark:from-gray-950 dark:to-gray-900 dark:text-gray-300 dark:border-gray-700';
    }
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

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-700' 
      : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-700';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive 
      ? <CheckCircle className="h-3 w-3" /> 
      : <XCircle className="h-3 w-3" />;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleUserClick = (userId: string) => {
    router.push(`/admin/users/${userId}`);
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
                field="fullname" 
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
              <TableHead className="px-3 py-3 min-w-[100px]">Status</TableHead>
              <TableHead className="px-3 py-3 min-w-[120px] hidden lg:table-cell">Location</TableHead>
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
                className="hover:bg-muted/50 cursor-pointer group"
                onClick={() => handleUserClick(user.id)}
              >
                <TableCell className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-semibold">
                        {getInitials(user.fullname)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm">{user.fullname}</div>
                      <div className="text-xs text-muted-foreground">ID: {user.id}</div>
                      <div className="text-xs text-muted-foreground hidden sm:block">
                        {user.lastLogin ? `Last login: ${formatDateTime(user.lastLogin)}` : 'Never logged in'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-3 py-3 hidden md:table-cell">
                  <Badge variant="outline" className={`${getRoleColor(user.role)} text-xs px-2 py-1`}>
                    {getRoleIcon(user.role)}
                    <span className="ml-1">{user.role}</span>
                  </Badge>
                </TableCell>
                <TableCell className="px-3 py-3">
                  <Badge variant="outline" className={`${getStatusColor(user.isActive)} text-xs px-2 py-1`}>
                    {getStatusIcon(user.isActive)}
                    <span className="ml-1">{user.isActive ? 'Active' : 'Inactive'}</span>
                  </Badge>
                </TableCell>
                <TableCell className="px-3 py-3 hidden lg:table-cell">
                  <div>
                    <div className="font-medium text-sm">{user.location.name}</div>
                    <div className="text-xs text-muted-foreground">{user.location.address.city}</div>
                  </div>
                </TableCell>
                <TableCell className="px-3 py-3 hidden xl:table-cell">
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
