"use server"
import React from 'react';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Car, Globe } from 'lucide-react';
import { OwnerSearchInput } from '@/components/owners/owner-search-input';
import { CountryFilter } from '@/components/owners/country-filter';
import { OwnerTableV2 } from '@/components/owners/owner-table-v2';
import { OwnerPagination } from '@/components/owners/owner-pagination';
import { OwnerService } from '@/lib/services/owner';
import { MetricCard } from '@/components/dashboard/metric-card';
import { AddOwnerButton } from '@/components/owners/add-owner-button';

interface OwnerPageProps {
  searchParams: {
    search?: string;
    country?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: string;
  };
}

export default async function OwnerManagement({ searchParams }: OwnerPageProps) {
  const params = await searchParams;
  const searchTerm = params.search || '';
  const countryFilter = params.country || 'all';
  const sortBy = params.sortBy || 'name';
  const sortOrder = params.sortOrder || 'asc';
  const currentPage = parseInt(params.page || '1');

  // Fetch owners and stats
  const [ownerData, stats] = await Promise.all([
    OwnerService.getOwners({
      search: searchTerm,
      country: countryFilter,
      sortBy,
      sortOrder,
      page: currentPage,
      limit: 10
    }),
    OwnerService.getOwnerStats()
  ]);

  const { owners, total, totalPages } = ownerData;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Clients Management</h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base lg:text-lg">Manage and monitor all vehicle Clients in the system</p>
            </div>
            <AddOwnerButton />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Clients"
            value={stats.overview.totalOwners}
            icon={Users}
            variant="blue"
            description="In the system"
          />

          <MetricCard
            title="With Vehicles"
            value={stats.overview.ownersWithVehicles}
            icon={Car}
            variant="green"
            description="Active Clients"
          />

          <MetricCard
            title={stats.country.topCountries[0]?.country || 'Nigeria'}
            value={stats.country.topCountries[0]?.count || 0}
            icon={Globe}
            variant="purple"
            description="Most common country"
          />

          <MetricCard
            title="Without Vehicles"
            value={stats.overview.ownersWithoutVehicles}
            icon={Users}
            variant="yellow"
            description="Potential customers"
          />
        </div>

        {/* Main Content */}
        <Card className="w-full overflow-hidden">
          <CardContent className="p-4 sm:p-6 w-full">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <OwnerSearchInput initialValue={searchTerm} />
              <CountryFilter initialValue={countryFilter} />
            </div>

            {/* Owners Table */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  All Clients
                </h3>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Showing {owners.length} of {total} Clients
                </div>
              </div>

              <OwnerTableV2
                owners={owners}
                sortBy={sortBy}
                sortOrder={sortOrder}
              />

              {/* Pagination */}
              <OwnerPagination currentPage={currentPage} totalPages={totalPages} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
