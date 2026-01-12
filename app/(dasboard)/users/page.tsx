"use server"
import React from 'react';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import { UserSearchInput } from '@/components/users/user-search-input';
import { RoleFilter } from '@/components/users/role-filter';
import { UserStatusFilter } from '@/components/users/status-filter';
import { UserTable } from '@/components/users/user-table';
import { UserPagination } from '@/components/users/user-pagination';
import { UserListActions } from '@/components/users/user-list-actions';
import { User } from '@/types';

async function redirectToAddUser() {
  'use server';
  redirect('/users/add');
}

interface UserPageProps {
  searchParams: {
    search?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: string;
  };
}

async function fetchUsers(searchParams: any) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const queryParams = new URLSearchParams();
    
    if (searchParams.search) queryParams.append('search', searchParams.search);
    if (searchParams.role && searchParams.role !== 'all') queryParams.append('role', searchParams.role);
    if (searchParams.status && searchParams.status !== 'all') {
      queryParams.append('isActive', searchParams.status === 'active' ? 'true' : 'false');
    }
    if (searchParams.sortBy) queryParams.append('sortBy', searchParams.sortBy);
    if (searchParams.sortOrder) queryParams.append('sortOrder', searchParams.sortOrder);
    if (searchParams.page) queryParams.append('page', searchParams.page);
    queryParams.append('limit', '10');

    const response = await fetch(`${baseUrl}/api/users?${queryParams.toString()}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      users: [],
      total: 0,
      totalPages: 0
    };
  }
}

async function fetchUserStats() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/users/stats`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user stats');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      total: 0,
      active: 0,
      inactive: 0,
      byRole: {
        Admin: 0,
        CEO: 0,
        Normal: 0
      }
    };
  }
}

export default async function UserManagement({ searchParams }: UserPageProps) {
  const params = await searchParams;
  const searchTerm = params.search || '';
  const roleFilter = params.role || 'all';
  const statusFilter = params.status || 'all';
  const sortBy = params.sortBy || 'firstName';
  const sortOrder = params.sortOrder || 'asc';
  const currentPage = parseInt(params.page || '1');

  // Fetch users and stats from API
  const [userData, stats] = await Promise.all([
    fetchUsers(params),
    fetchUserStats()
  ]);

  const { users, total, totalPages } = userData;
  const paginatedUsers = users;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">User Management</h1>
              <p className="text-muted-foreground mt-2 text-lg">Manage and monitor all users in the system</p>
            </div>
            <UserListActions />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:bg-accent/50 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-foreground mb-2">{stats.total}</div>
              <div className="text-sm font-medium text-foreground">Total Users</div>
              <div className="text-xs text-muted-foreground mt-1">In the system</div>
            </CardContent>
          </Card>

          <Card className="hover:bg-accent/50 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stats.active}</div>
              <div className="text-sm font-medium text-foreground">Active Users</div>
              <div className="text-xs text-muted-foreground mt-1">Currently active</div>
            </CardContent>
          </Card>

          <Card className="hover:bg-accent/50 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-destructive mb-2">{stats.byRole?.Admin || 0}</div>
              <div className="text-sm font-medium text-foreground">Admins</div>
              <div className="text-xs text-muted-foreground mt-1">Administrators</div>
            </CardContent>
          </Card>

          <Card className="hover:bg-accent/50 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-secondary-foreground mb-2">{stats.byRole?.Normal || 0}</div>
              <div className="text-sm font-medium text-foreground">Normal Users</div>
              <div className="text-xs text-muted-foreground mt-1">Standard users</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardContent className="p-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <UserSearchInput initialValue={searchTerm} />
              <RoleFilter initialValue={roleFilter} />
              <UserStatusFilter initialValue={statusFilter} />
            </div>

            {/* Users Table */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  All Users
                </h3>
                <div className="text-sm text-muted-foreground">
                  Showing {users.length} of {total} users
                </div>
              </div>
              
              <UserTable
                users={paginatedUsers}
                sortBy={sortBy}
                sortOrder={sortOrder}
              />

              {/* Pagination */}
              <UserPagination currentPage={currentPage} totalPages={totalPages} />
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}