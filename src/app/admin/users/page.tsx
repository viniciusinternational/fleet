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
import { User } from '@/types';

async function redirectToAddUser() {
  'use server';
  redirect('/admin/users/add');
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
  const sortBy = params.sortBy || 'fullname';
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
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">User Management</h1>
              <p className="text-muted-foreground mt-2 text-lg">Manage and monitor all users in the system</p>
            </div>
            <form action={redirectToAddUser}>
              <Button type="submit" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
            </form>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.total}</div>
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Users</div>
            <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">In the system</div>
          </div>

          <div className="text-center p-4 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-700">
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.active}</div>
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">Active Users</div>
            <div className="text-xs text-green-500 dark:text-green-400 mt-1">Currently active</div>
          </div>

          <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/50 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.byRole?.Admin || 0}</div>
            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Admins</div>
            <div className="text-xs text-purple-500 dark:text-purple-400 mt-1">Administrators</div>
          </div>

          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.byRole?.Normal || 0}</div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Normal Users</div>
            <div className="text-xs text-yellow-500 dark:text-yellow-400 mt-1">Standard users</div>
          </div>
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
            <div className="space-y-4">
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