"use server"
import React from 'react';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MapPin } from 'lucide-react';
import { SearchInput } from '@/components/locations/search-input';
import { TypeFilter } from '@/components/locations/type-filter';
import { StatusFilter } from '@/components/locations/status-filter';
import { LocationTable } from '@/components/locations/location-table';
import { LocationPagination } from '@/components/locations/location-pagination';
import { Location } from '@/types';

async function redirectToAddLocation() {
  'use server';
  redirect('/locations/add');
}

interface LocationPageProps {
  searchParams: {
    search?: string;
    type?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: string;
  };
}

async function fetchLocations(searchParams: any) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const queryParams = new URLSearchParams();
    
    if (searchParams.search) queryParams.append('search', searchParams.search);
    if (searchParams.type && searchParams.type !== 'all') queryParams.append('type', searchParams.type);
    if (searchParams.status && searchParams.status !== 'all') queryParams.append('status', searchParams.status);
    if (searchParams.sortBy) queryParams.append('sortBy', searchParams.sortBy);
    if (searchParams.sortOrder) queryParams.append('sortOrder', searchParams.sortOrder);
    if (searchParams.page) queryParams.append('page', searchParams.page);
    queryParams.append('limit', '10');

    const response = await fetch(`${baseUrl}/api/locations?${queryParams.toString()}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch locations');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching locations:', error);
    return {
      locations: [],
      total: 0,
      totalPages: 0,
      filterOptions: {
        types: [],
        statuses: [],
        cities: [],
        countries: []
      }
    };
  }
}

async function fetchLocationStats() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/locations/stats`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch location stats');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching location stats:', error);
    return {
      overview: {
        totalLocations: 0,
        recentLocations: 0,
        recentLocationsPercentage: 0
      },
      type: {
        breakdown: []
      },
      status: {
        breakdown: []
      }
    };
  }
}

async function fetchUsers() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/users?limit=1000`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export default async function LocationManagement({ searchParams }: LocationPageProps) {
  const params = await searchParams;
  const searchTerm = params.search || '';
  const typeFilter = params.type || 'all';
  const statusFilter = params.status || 'all';
  const sortBy = params.sortBy || 'name';
  const sortOrder = params.sortOrder || 'asc';
  const currentPage = parseInt(params.page || '1');

  // Fetch locations, stats, and users from API
  const [locationData, stats, allUsers] = await Promise.all([
    fetchLocations(params),
    fetchLocationStats(),
    fetchUsers()
  ]);

  const { locations, total, totalPages } = locationData;
  const paginatedLocations = locations;


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Location Management</h1>
              <p className="text-muted-foreground mt-2 text-lg">Manage and monitor all locations in the system</p>
                        </div>
            <form action={redirectToAddLocation}>
              <Button type="submit" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Location
              </Button>
            </form>
                      </div>
                    </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.overview?.totalLocations || 0}</div>
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Locations</div>
            <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">In the system</div>
                      </div>

          <div className="text-center p-4 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-700">
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {stats.status?.breakdown?.find((item: any) => item.status === 'OPERATIONAL')?.count || 0}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">Operational</div>
            <div className="text-xs text-green-500 dark:text-green-400 mt-1">Currently active</div>
                        </div>

          <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/50 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {stats.type?.breakdown?.find((item: any) => item.type === 'PORT')?.count || 0}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Ports</div>
            <div className="text-xs text-purple-500 dark:text-purple-400 mt-1">Shipping ports</div>
                        </div>

          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {stats.type?.breakdown?.find((item: any) => item.type === 'WAREHOUSE')?.count || 0}
            </div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Warehouses</div>
            <div className="text-xs text-yellow-500 dark:text-yellow-400 mt-1">Storage facilities</div>
                      </div>
                    </div>

        {/* Main Content */}
        <Card>
          <CardContent className="p-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchInput initialValue={searchTerm} />
              <TypeFilter initialValue={typeFilter} />
              <StatusFilter initialValue={statusFilter} />
            </div>

            {/* Locations Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  All Locations
                </h3>
                <div className="text-sm text-muted-foreground">
                  Showing {locations.length} of {total} locations
                </div>
            </div>

              <LocationTable
                locations={paginatedLocations}
                users={allUsers}
                sortBy={sortBy}
                sortOrder={sortOrder}
              />

              {/* Pagination */}
              <LocationPagination currentPage={currentPage} totalPages={totalPages} />
              </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
