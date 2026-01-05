"use server"
import React from 'react';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';
import { SourceSearchInput } from '@/components/sources/source-search-input';
import { NationalityFilter } from '@/components/sources/nationality-filter';
import { SourceTableV2 } from '@/components/sources/source-table-v2';
import { SourcePagination } from '@/components/sources/source-pagination';
import { SourceService } from '@/lib/services/source';

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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6">
          <div className="text-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.overview.totalSources}</div>
            <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">Total Sources</div>
            <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">In the system</div>
          </div>

          <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-700">
            <div className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-300">{stats.overview.sourcesWithVehicles}</div>
            <div className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">With Vehicles</div>
            <div className="text-xs text-green-500 dark:text-green-400 mt-1">Active sources</div>
          </div>

          <div className="text-center p-3 sm:p-4 bg-purple-50 dark:bg-purple-950/50 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="text-xl sm:text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.nationality.topNationalities[0]?.count || 0}</div>
            <div className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-medium">{stats.nationality.topNationalities[0]?.nationality || 'Nigerian'}</div>
            <div className="text-xs text-purple-500 dark:text-purple-400 mt-1">Most common</div>
          </div>

          <div className="text-center p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <div className="text-xl sm:text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.overview.sourcesWithoutVehicles}</div>
            <div className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400 font-medium">Without Vehicles</div>
            <div className="text-xs text-yellow-500 dark:text-yellow-400 mt-1">Potential sources</div>
          </div>
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

