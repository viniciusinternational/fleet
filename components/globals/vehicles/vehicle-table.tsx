'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { 
  Car, 
  Search, 
  Filter,
  Grid3X3,
  List,
  ArrowUpDown,
  Package,
  Ship,
  CheckCircle,
  Clock,
  Globe,
  FileText,
  Calendar,
  MapPin,
  Users,
  Plus,
  X,
  Loader2,
  SlidersHorizontal
} from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { VehicleStatus } from '@/types';
import type { Vehicle } from '@/types';
import { useAuthStore } from '@/store/auth';

interface VehicleTableProps {
  showFilters?: boolean;
  showViewToggle?: boolean;
  showAddButton?: boolean;
  showSelection?: boolean;
  showPagination?: boolean;
  itemsPerPage?: number;
  onVehicleClick?: (vehicleId: string) => void;
  onAddVehicle?: () => void;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  className?: string;
  title?: string;
  subtitle?: string;
}

interface FilterOptions {
  sources: Array<{ id: string; name: string }>;
  owners: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string }>;
  makes: Array<{ id: string; name: string }>;
  models: Array<{ id: string; name: string; makeId?: string }>;
  colors: Array<{ id: string; name: string; hexCode?: string }>;
}

const VehicleTable: React.FC<VehicleTableProps> = ({
  showFilters = true,
  showViewToggle = true,
  showAddButton = false,
  showSelection = false,
  showPagination = true,
  itemsPerPage = 10,
  onVehicleClick,
  onAddVehicle,
  onSelectionChange,
  className = '',
  title = 'Vehicles',
  subtitle
}) => {
  const router = useRouter();
  const { user } = useAuthStore();
  
  // API data state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVehicles, setTotalVehicles] = useState(0);
  
  // Filter options state
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    sources: [],
    owners: [],
    locations: [],
    makes: [],
    models: [],
    colors: [],
  });
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(true);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [makeFilter, setMakeFilter] = useState<string>('all');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  
  // View and UI state
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [sortBy, setSortBy] = useState<string>('orderDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  
  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Determine if user is admin
  const isAdmin = user?.role === 'Admin';

  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setFilterOptionsLoading(true);
        const [sourcesRes, ownersRes, locationsRes, makesRes, modelsRes, colorsRes] = await Promise.all([
          fetch('/api/sources?limit=1000'),
          fetch('/api/owners?limit=1000'),
          fetch('/api/locations?limit=1000'),
          fetch('/api/settings/makes'),
          fetch('/api/settings/models'),
          fetch('/api/settings/colors'),
        ]);

        const [sourcesData, ownersData, locationsData, makesData, modelsData, colorsData] = await Promise.all([
          sourcesRes.json(),
          ownersRes.json(),
          locationsRes.json(),
          makesRes.json(),
          modelsRes.json(),
          colorsRes.json(),
        ]);

        setFilterOptions({
          sources: sourcesData.success ? sourcesData.data.sources.map((s: any) => ({ id: s.id, name: s.name })) : [],
          owners: ownersData.success ? ownersData.data.owners.map((o: any) => ({ id: o.id, name: o.name })) : [],
          locations: locationsData.locations ? locationsData.locations.map((l: any) => ({ id: l.id, name: l.name })) : [],
          makes: makesData.success ? makesData.data.map((m: any) => ({ id: m.id, name: m.name })) : [],
          models: modelsData.success ? modelsData.data.map((m: any) => ({ id: m.id, name: m.name, makeId: m.makeId })) : [],
          colors: colorsData.success ? colorsData.data.map((c: any) => ({ id: c.id, name: c.name, hexCode: c.hexCode })) : [],
        });
      } catch (error) {
        console.error('Error fetching filter options:', error);
      } finally {
        setFilterOptionsLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  // Debounce search term
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setSearchLoading(true);
    
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setSearchLoading(false);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  // Get filtered models based on selected make
  const filteredModels = useMemo(() => {
    if (makeFilter === 'all') {
      return filterOptions.models;
    }
    return filterOptions.models.filter(m => m.makeId === makeFilter);
  }, [makeFilter, filterOptions.models]);

  // Get unique years from vehicles
  const uniqueYears = useMemo(() => {
    return [...new Set(vehicles.map(v => v.year))].sort((a, b) => b - a);
  }, [vehicles]);

  // Reset model filter when make changes
  useEffect(() => {
    if (makeFilter === 'all') {
      setModelFilter('all');
    }
  }, [makeFilter]);

  // Fetch vehicles from API
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
          sortBy,
          sortOrder,
        });
        
        if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
        if (statusFilter !== 'all') params.append('status', statusFilter);
        if (sourceFilter !== 'all') params.append('sourceId', sourceFilter);
        if (clientFilter !== 'all') params.append('ownerId', clientFilter);
        if (makeFilter !== 'all') params.append('make', makeFilter);
        if (modelFilter !== 'all') params.append('model', modelFilter);
        if (yearFilter !== 'all') params.append('year', yearFilter);
        if (colorFilter !== 'all') params.append('color', colorFilter);
        if (locationFilter !== 'all') params.append('locationId', locationFilter);
        
        const response = await fetch(`/api/vehicles?${params}`);
        
        const result = await response.json();
        
        if (!response.ok || !result.success) {
          const errorMessage = result.error || `Failed to fetch vehicles (${response.status})`;
          console.error('API Error:', {
            status: response.status,
            statusText: response.statusText,
            error: result.error,
            details: result.details,
          });
          throw new Error(errorMessage);
        }
        
        setVehicles(result.data.vehicles);
        setTotalPages(result.data.totalPages);
        setTotalVehicles(result.data.total);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        setError(error instanceof Error ? error.message : 'Failed to load vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [
    currentPage, 
    itemsPerPage, 
    sortBy, 
    sortOrder, 
    debouncedSearchTerm, 
    statusFilter, 
    sourceFilter,
    clientFilter,
    makeFilter, 
    modelFilter,
    yearFilter, 
    colorFilter, 
    locationFilter
  ]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, sourceFilter, clientFilter, makeFilter, modelFilter, yearFilter, colorFilter, locationFilter]);

  const getStatusColor = (status: VehicleStatus) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-700';
      case 'In Local Delivery':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700';
      case 'At Port':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-700';
      case 'Clearing Customs':
        return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-700';
      case 'In Transit':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-700';
      case 'Ordered':
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-700';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status: VehicleStatus) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="h-3 w-3" />;
      case 'In Local Delivery':
        return <Package className="h-3 w-3" />;
      case 'At Port':
        return <Ship className="h-3 w-3" />;
      case 'Clearing Customs':
        return <FileText className="h-3 w-3" />;
      case 'In Transit':
        return <Globe className="h-3 w-3" />;
      case 'Ordered':
        return <Clock className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const paginatedVehicles = vehicles;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleVehicleClick = (vehicleId: string) => {
    if (onVehicleClick) {
      onVehicleClick(vehicleId);
    } else {
      router.push(`/vehicles/${vehicleId}`);
    }
  };

  const handleSelectVehicle = (vehicleId: string) => {
    const newSelected = new Set(selectedVehicles);
    if (newSelected.has(vehicleId)) {
      newSelected.delete(vehicleId);
    } else {
      newSelected.add(vehicleId);
    }
    setSelectedVehicles(newSelected);
    if (onSelectionChange) {
      onSelectionChange(newSelected);
    }
  };

  const handleSelectAll = () => {
    if (selectedVehicles.size === paginatedVehicles.length) {
      const newSelected = new Set<string>();
      setSelectedVehicles(newSelected);
      if (onSelectionChange) {
        onSelectionChange(newSelected);
      }
    } else {
      const newSelected = new Set(paginatedVehicles.map(v => v.id));
      setSelectedVehicles(newSelected);
      if (onSelectionChange) {
        onSelectionChange(newSelected);
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSourceFilter('all');
    setClientFilter('all');
    setMakeFilter('all');
    setModelFilter('all');
    setYearFilter('all');
    setColorFilter('all');
    setLocationFilter('all');
    setSelectedVehicles(new Set());
    if (onSelectionChange) {
      onSelectionChange(new Set());
    }
  };

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (sourceFilter !== 'all') count++;
    if (clientFilter !== 'all') count++;
    if (makeFilter !== 'all') count++;
    if (modelFilter !== 'all') count++;
    if (yearFilter !== 'all') count++;
    if (colorFilter !== 'all') count++;
    if (locationFilter !== 'all') count++;
    return count;
  }, [statusFilter, sourceFilter, clientFilter, makeFilter, modelFilter, yearFilter, colorFilter, locationFilter]);

  // Show loading state
  if (loading && vehicles.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <span>Loading vehicles...</span>
          </div>
        </CardHeader>
      </Card>
    );
  }

  // Show error state
  if (error && vehicles.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="text-red-500 mb-2">Error loading vehicles</div>
              <div className="text-sm text-gray-500">{error}</div>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <h2 className="text-xl font-semibold">{title}</h2>
            <Badge variant="secondary" className="text-sm">
              {vehicles.length} of {totalVehicles}
            </Badge>
            {showPagination && totalPages > 1 && (
              <Badge variant="outline" className="text-sm">
                Page {currentPage} of {totalPages}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* View Mode Toggle */}
            {showViewToggle && (
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  <List className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Table</span>
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Grid</span>
                </Button>
              </div>
            )}
            
            {/* Add Vehicle Button */}
            {showAddButton && (
              <Button onClick={onAddVehicle || (() => router.push('/admin/vehicles/add'))}>
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Vehicle</span>
              </Button>
            )}
          </div>
        </div>
        {subtitle && (
          <p className="text-muted-foreground text-sm mt-2">{subtitle}</p>
        )}
      </CardHeader>
      
      <CardContent>
        {/* Filters */}
        {showFilters && (
          <div className="mb-6 space-y-4">
            {/* Search Bar with Loading Indicator */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicles by make, model, VIN, or year..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchLoading && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            
            {/* Active Filters Chips */}
            {(activeFilterCount > 0 || debouncedSearchTerm) && (
              <div className="flex flex-wrap gap-2 items-center">
                {debouncedSearchTerm && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {debouncedSearchTerm}
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Status: {statusFilter}
                    <button
                      onClick={() => setStatusFilter('all')}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {sourceFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Source: {filterOptions.sources.find(s => s.id === sourceFilter)?.name || sourceFilter}
                    <button
                      onClick={() => setSourceFilter('all')}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {clientFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Client: {filterOptions.owners.find(o => o.id === clientFilter)?.name || clientFilter}
                    <button
                      onClick={() => setClientFilter('all')}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {makeFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Make: {makeFilter}
                    <button
                      onClick={() => setMakeFilter('all')}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {modelFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Model: {modelFilter}
                    <button
                      onClick={() => setModelFilter('all')}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {yearFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Year: {yearFilter}
                    <button
                      onClick={() => setYearFilter('all')}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {colorFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Color: {colorFilter}
                    <button
                      onClick={() => setColorFilter('all')}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {locationFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Location: {filterOptions.locations.find(l => l.id === locationFilter)?.name || locationFilter}
                    <button
                      onClick={() => setLocationFilter('all')}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {(activeFilterCount > 0 || debouncedSearchTerm) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-6 px-2 text-xs"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            )}
            
            {/* Basic Filters Row */}
            <div className="flex flex-wrap gap-2 items-center">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-auto min-w-[140px] h-9">
                  <Filter className="h-3 w-3 mr-1.5" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Ordered">Ordered</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="At Port">At Port</SelectItem>
                  <SelectItem value="Clearing Customs">Clearing Customs</SelectItem>
                  <SelectItem value="In Local Delivery">In Local Delivery</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sourceFilter} onValueChange={setSourceFilter} disabled={filterOptionsLoading}>
                <SelectTrigger className="w-full sm:w-auto min-w-[140px] h-9">
                  <Globe className="h-3 w-3 mr-1.5" />
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {filterOptions.sources.map(source => (
                    <SelectItem key={source.id} value={source.id}>{source.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={clientFilter} onValueChange={setClientFilter} disabled={filterOptionsLoading}>
                <SelectTrigger className="w-full sm:w-auto min-w-[140px] h-9">
                  <Users className="h-3 w-3 mr-1.5" />
                  <SelectValue placeholder="Client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {filterOptions.owners.map(owner => (
                    <SelectItem key={owner.id} value={owner.id}>{owner.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={makeFilter} onValueChange={setMakeFilter} disabled={filterOptionsLoading}>
                <SelectTrigger className="w-full sm:w-auto min-w-[120px] h-9">
                  <Car className="h-3 w-3 mr-1.5" />
                  <SelectValue placeholder="Make" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Makes</SelectItem>
                  {filterOptions.makes.map(make => (
                    <SelectItem key={make.id} value={make.name}>{make.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={modelFilter} onValueChange={setModelFilter} disabled={filterOptionsLoading || makeFilter === 'all'}>
                <SelectTrigger className="w-full sm:w-auto min-w-[120px] h-9">
                  <Car className="h-3 w-3 mr-1.5" />
                  <SelectValue placeholder="Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Models</SelectItem>
                  {filteredModels.map(model => (
                    <SelectItem key={model.id} value={model.name}>{model.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-full sm:w-auto min-w-[100px] h-9">
                  <Calendar className="h-3 w-3 mr-1.5" />
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {uniqueYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={colorFilter} onValueChange={setColorFilter} disabled={filterOptionsLoading}>
                <SelectTrigger className="w-full sm:w-auto min-w-[120px] h-9">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-blue-500 mr-1.5"></div>
                  <SelectValue placeholder="Color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Colors</SelectItem>
                  {filterOptions.colors.map(color => (
                    <SelectItem key={color.id} value={color.name}>
                      <div className="flex items-center gap-2">
                        {color.hexCode && (
                          <div 
                            className="w-3 h-3 rounded-full border" 
                            style={{ backgroundColor: color.hexCode }}
                          ></div>
                        )}
                        {color.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter} disabled={filterOptionsLoading}>
                <SelectTrigger className="w-full sm:w-auto min-w-[140px] h-9">
                  <MapPin className="h-3 w-3 mr-1.5" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {filterOptions.locations.map(location => (
                    <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Advanced Filters Button */}
              <Sheet open={advancedFilterOpen} onOpenChange={setAdvancedFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="h-9">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Advanced
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Advanced Filters</SheetTitle>
                    <SheetDescription>
                      Refine your search with detailed filtering options
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    {/* Status Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="Ordered">Ordered</SelectItem>
                          <SelectItem value="In Transit">In Transit</SelectItem>
                          <SelectItem value="At Port">At Port</SelectItem>
                          <SelectItem value="Clearing Customs">Clearing Customs</SelectItem>
                          <SelectItem value="In Local Delivery">In Local Delivery</SelectItem>
                          <SelectItem value="Delivered">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Source Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Source</label>
                      <Select value={sourceFilter} onValueChange={setSourceFilter} disabled={filterOptionsLoading}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Sources" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sources</SelectItem>
                          {filterOptions.sources.map(source => (
                            <SelectItem key={source.id} value={source.id}>{source.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Client Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Client</label>
                      <Select value={clientFilter} onValueChange={setClientFilter} disabled={filterOptionsLoading}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Clients" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Clients</SelectItem>
                          {filterOptions.owners.map(owner => (
                            <SelectItem key={owner.id} value={owner.id}>{owner.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Make Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Make</label>
                      <Select value={makeFilter} onValueChange={setMakeFilter} disabled={filterOptionsLoading}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Makes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Makes</SelectItem>
                          {filterOptions.makes.map(make => (
                            <SelectItem key={make.id} value={make.name}>{make.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Model Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Model</label>
                      <Select value={modelFilter} onValueChange={setModelFilter} disabled={filterOptionsLoading || makeFilter === 'all'}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Models" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Models</SelectItem>
                          {filteredModels.map(model => (
                            <SelectItem key={model.id} value={model.name}>{model.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Year Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Year</label>
                      <Select value={yearFilter} onValueChange={setYearFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Years" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Years</SelectItem>
                          {uniqueYears.map(year => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Color Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Color</label>
                      <Select value={colorFilter} onValueChange={setColorFilter} disabled={filterOptionsLoading}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Colors" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Colors</SelectItem>
                          {filterOptions.colors.map(color => (
                            <SelectItem key={color.id} value={color.name}>
                              <div className="flex items-center gap-2">
                                {color.hexCode && (
                                  <div 
                                    className="w-3 h-3 rounded-full border" 
                                    style={{ backgroundColor: color.hexCode }}
                                  ></div>
                                )}
                                {color.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Location Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Location</label>
                      <Select value={locationFilter} onValueChange={setLocationFilter} disabled={filterOptionsLoading}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Locations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Locations</SelectItem>
                          {filterOptions.locations.map(location => (
                            <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <SheetFooter className="mt-8 gap-2">
                    <Button variant="outline" onClick={clearFilters} className="flex-1">
                      Reset
                    </Button>
                    <Button onClick={() => setAdvancedFilterOpen(false)} className="flex-1">
                      Apply Filters
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        )}

        {/* Selection Summary */}
        {showSelection && selectedVehicles.size > 0 && (
          <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Checkbox checked={true} disabled />
                <span className="text-sm font-medium text-primary">
                  {selectedVehicles.size} vehicle{selectedVehicles.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSelectedVehicles(new Set());
                  if (onSelectionChange) {
                    onSelectionChange(new Set());
                  }
                }}
                className="text-primary border-primary/30 hover:bg-primary/5"
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && vehicles.length > 0 && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {showSelection && (
                    <TableHead className="px-4 py-3 w-12 sticky left-0 bg-muted/50 z-10">
                      <Checkbox
                        checked={selectedVehicles.size === paginatedVehicles.length && paginatedVehicles.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                  )}
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 px-4 py-3 min-w-[220px]"
                    onClick={() => handleSort('make')}
                  >
                    <div className="flex items-center gap-2">
                      Vehicle
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 px-4 py-3 min-w-[140px]"
                    onClick={() => handleSort('color')}
                  >
                    <div className="flex items-center gap-2">
                      Color
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 px-4 py-3 min-w-[180px]"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 px-4 py-3 min-w-[140px]"
                    onClick={() => handleSort('orderDate')}
                  >
                    <div className="flex items-center gap-2">
                      Order Date
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="px-4 py-3 min-w-[220px]">Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedVehicles.map((vehicle) => (
                  <TableRow 
                    key={vehicle.id} 
                    className="hover:bg-muted/50 transition-colors"
                  >
                    {showSelection && (
                      <TableCell className="px-4 py-4 sticky left-0 bg-background z-10">
                        <Checkbox
                          checked={selectedVehicles.has(vehicle.id)}
                          onCheckedChange={() => handleSelectVehicle(vehicle.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                    )}
                    <TableCell 
                      className="px-4 py-4 cursor-pointer"
                      onClick={() => handleVehicleClick(vehicle.id)}
                    >
                      <div className="flex items-center gap-3">
                        {(() => {
                          const primaryImage = vehicle.images?.find(img => img.isPrimary) || vehicle.images?.[0];
                          const imageUrl = primaryImage?.thumbnailUrl || primaryImage?.url;
                          
                          return imageUrl ? (
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 border-muted">
                              <img
                                src={imageUrl}
                                alt={primaryImage?.alt || `${vehicle.make} ${vehicle.model}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Car className="h-6 w-6 text-primary" />
                            </div>
                          );
                        })()}
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-base">{vehicle.make} {vehicle.model}</div>
                          <div className="text-sm text-muted-foreground">VIN: {vehicle.vin}</div>
                          <div className="text-xs text-muted-foreground">{vehicle.year} • {vehicle.color}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell 
                      className="px-4 py-4 cursor-pointer"
                      onClick={() => handleVehicleClick(vehicle.id)}
                    >
                      <div className="flex items-center gap-2">
                        {vehicle.color ? (
                          <>
                            <div 
                              className="w-6 h-6 rounded-full border-2 border-muted flex-shrink-0"
                              style={{ backgroundColor: vehicle.color.toLowerCase() }}
                              title={vehicle.color}
                            />
                            <span className="font-medium text-base capitalize">{vehicle.color}</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground text-sm">N/A</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell 
                      className="px-4 py-4 cursor-pointer"
                      onClick={() => handleVehicleClick(vehicle.id)}
                    >
                      <Badge variant="outline" className={`${getStatusColor(vehicle.status)} text-sm px-2 py-1`}>
                        {getStatusIcon(vehicle.status)}
                        <span className="ml-1">{vehicle.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell 
                      className="px-4 py-4 cursor-pointer"
                      onClick={() => handleVehicleClick(vehicle.id)}
                    >
                      <div className="text-sm">
                        {formatDate(vehicle.orderDate)}
                      </div>
                    </TableCell>
                    <TableCell 
                      className="px-4 py-4 cursor-pointer"
                      onClick={() => handleVehicleClick(vehicle.id)}
                    >
                      <div>
                        <div className="font-medium text-base">{vehicle.currentLocation?.name || 'Unknown Location'}</div>
                        <div className="text-sm text-muted-foreground">{vehicle.currentLocation?.address?.city || 'Unknown City'}</div>
                        <div className="text-xs text-muted-foreground">{vehicle.currentLocation?.address?.country || 'Unknown Country'}</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {paginatedVehicles.map((vehicle) => {
              const primaryImage = vehicle.images?.find(img => img.isPrimary) || vehicle.images?.[0];
              const imageUrl = primaryImage?.thumbnailUrl || primaryImage?.url;
              
              return (
                <Card 
                  key={vehicle.id} 
                  className="relative overflow-hidden cursor-pointer group border-0 shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] aspect-[4/3]"
                  onClick={() => handleVehicleClick(vehicle.id)}
                >
                  {imageUrl ? (
                    <div className="absolute inset-0">
                      <img
                        src={imageUrl}
                        alt={primaryImage?.alt || `${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 group-hover:brightness-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Car className="h-16 w-16 text-primary/30" />
                    </div>
                  )}
                  
                  <div className="relative h-full flex flex-col justify-between p-4 md:p-6 text-white">
                    <div className="flex justify-end">
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(vehicle.status)} text-xs border-white/20 bg-white/10 backdrop-blur-sm text-white`}
                      >
                        {getStatusIcon(vehicle.status)}
                        <span className="ml-1">{vehicle.status}</span>
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-bold text-lg md:text-xl leading-tight drop-shadow-lg">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        <p className="text-sm text-white/90 drop-shadow-md mt-1">
                          {vehicle.year} • {vehicle.color}
                        </p>
                        <p className="text-xs text-white/70 font-mono drop-shadow mt-1">
                          {vehicle.vin}
                        </p>
                      </div>
                      
                      <div className="space-y-1.5 pt-2 border-t border-white/20">
                        <div className="flex items-center gap-2 text-sm">
                          <div 
                            className="w-4 h-4 rounded-full border border-white/30 flex-shrink-0"
                            style={{ backgroundColor: vehicle.color?.toLowerCase() || 'transparent' }}
                          />
                          <span className="text-white/90 font-medium truncate capitalize">
                            {vehicle.color || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3.5 w-3.5 text-white/80 flex-shrink-0" />
                          <span className="text-white/80 truncate">
                            {vehicle.currentLocation?.name || 'Unknown Location'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3.5 w-3.5 text-white/80 flex-shrink-0" />
                          <span className="text-white/80">
                            {formatDate(vehicle.orderDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
        
        {paginatedVehicles.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            <Car className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
            <p>No vehicles match your current search criteria.</p>
            {activeFilterCount > 0 && (
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {showPagination && totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VehicleTable;
