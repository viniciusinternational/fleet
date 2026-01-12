"use server"
import React from 'react';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package, Car, Globe } from 'lucide-react';
import { SourceSearchInput } from '@/components/sources/source-search-input';
import { NationalityFilter } from '@/components/sources/nationality-filter';
import { SourceTableV2 } from '@/components/sources/source-table-v2';
import { SourcePagination } from '@/components/sources/source-pagination';
import { SourceService } from '@/lib/services/source';
import { MetricCard } from '@/components/dashboard/metric-card';

async function redirectToAddSource() {
  'use server';
  redirect('/sources/add');
}

interface SourcePageProps {
  searchParams: {
    search?: string;
    nationality?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: string;
  };
}

export default async function SourceManagement({ searchParams }: SourcePageProps) {
  const params = await searchParams;
  const searchTerm = params.search || '';
  const nationalityFilter = params.nationality || 'all';
  const sortBy = params.sortBy || 'name';
  const sortOrder = params.sortOrder || 'asc';
  const currentPage = parseInt(params.page || '1');

  // Fetch sources and stats
  const [sourceData, stats, nationalities] = await Promise.all([
    SourceService.getSources({
      search: searchTerm,
      nationality: nationalityFilter,
      sortBy,
      sortOrder,
      page: currentPage,
      limit: 10
    }),
    SourceService.getSourceStats(),
    SourceService.getNationalities()
  ]);

  const { sources, total, totalPages } = sourceData;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Source Management</h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base lg:text-lg">Manage and monitor all vehicle sources (original owners) in the system</p>
            </div>
            <form action={redirectToAddSource}>
              <Button type="submit" className="flex items-center gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Add Source
              </Button>
            </form>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Sources"
            value={stats.overview.totalSources}
            icon={Package}
            variant="blue"
            description="In the system"
          />

          <MetricCard
            title="With Vehicles"
            value={stats.overview.sourcesWithVehicles}
            icon={Car}
            variant="green"
            description="Active sources"
          />

          <MetricCard
            title={stats.nationality.topNationalities[0]?.nationality || 'Nigerian'}
            value={stats.nationality.topNationalities[0]?.count || 0}
            icon={Globe}
            variant="purple"
            description="Most common nationality"
          />

          <MetricCard
            title="Without Vehicles"
            value={stats.overview.sourcesWithoutVehicles}
            icon={Package}
            variant="yellow"
            description="Potential sources"
          />
        </div>

        {/* Main Content */}
        <Card className="w-full overflow-hidden">
          <CardContent className="p-4 sm:p-6 w-full">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SourceSearchInput initialValue={searchTerm} />
              <NationalityFilter initialValue={nationalityFilter} nationalities={nationalities} />
            </div>

            {/* Sources Table */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                  All Sources
                </h3>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Showing {sources.length} of {total} sources
                </div>
              </div>

              <SourceTableV2
                sources={sources}
                sortBy={sortBy}
                sortOrder={sortOrder}
              />

              {/* Pagination */}
              <SourcePagination currentPage={currentPage} totalPages={totalPages} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

