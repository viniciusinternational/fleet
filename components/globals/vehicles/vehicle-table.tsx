'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
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
  Plus
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
  
  // Filter and view state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [makeFilter, setMakeFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [deliveryDateFilter, setDeliveryDateFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<string>('orderDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  
  // Determine if user is admin
  const isAdmin = user?.role === 'Admin';

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
        
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter !== 'all') params.append('status', statusFilter);
        if (makeFilter !== 'all') params.append('make', makeFilter);
        if (yearFilter !== 'all') params.append('year', yearFilter);
        if (colorFilter !== 'all') params.append('color', colorFilter);
        if (locationFilter !== 'all') params.append('location', locationFilter);
        
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
  }, [currentPage, itemsPerPage, sortBy, sortOrder, searchTerm, statusFilter, makeFilter, yearFilter, colorFilter, locationFilter, deliveryDateFilter]);

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

  // Use vehicles directly from API (already filtered and sorted server-side)
  const filteredAndSortedVehicles = vehicles;
  const paginatedVehicles = vehicles; // API already handles pagination

  // Get unique values for filter options (for dropdowns)
  const uniqueMakes = [...new Set(vehicles.map(v => v.make))].sort();
  const uniqueYears = [...new Set(vehicles.map(v => v.year))].sort((a, b) => b - a);
  const uniqueColors = [...new Set(vehicles.map(v => v.color))].sort();
  const uniqueLocations = [...new Set(vehicles.map(v => v.currentLocation?.name || 'Unknown Location'))].sort();

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, makeFilter, yearFilter, colorFilter, locationFilter, deliveryDateFilter]);

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
    setMakeFilter('all');
    setYearFilter('all');
    setColorFilter('all');
    setLocationFilter('all');
    setDeliveryDateFilter('all');
    setSelectedVehicles(new Set());
    if (onSelectionChange) {
      onSelectionChange(new Set());
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading vehicles...</span>
          </div>
        </CardHeader>
      </Card>
    );
  }

  // Show error state
  if (error) {
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
          <div className="flex items-center gap-4">
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
          
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            {showViewToggle && (
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  <List className="h-4 w-4 mr-2" />
                  Table
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Grid
                </Button>
              </div>
            )}
            
            {/* Add Vehicle Button */}
            {showAddButton && (
              <Button onClick={onAddVehicle || (() => router.push('/admin/vehicles/add'))}>
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            )}
          </div>
        </div>
        {subtitle && (
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        )}
      </CardHeader>
      
      <CardContent>
        {/* Filters */}
        {showFilters && (
          <div className="mb-4 space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicles by make, model, VIN, or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filter Row */}
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <Filter className="h-3 w-3 mr-1" />
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

              <Select value={makeFilter} onValueChange={setMakeFilter}>
                <SelectTrigger className="w-28 h-8 text-xs">
                  <Car className="h-3 w-3 mr-1" />
                  <SelectValue placeholder="Make" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Makes</SelectItem>
                  {uniqueMakes.map(make => (
                    <SelectItem key={make} value={make}>{make}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-24 h-8 text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {uniqueYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={colorFilter} onValueChange={setColorFilter}>
                <SelectTrigger className="w-28 h-8 text-xs">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-blue-500 mr-1"></div>
                  <SelectValue placeholder="Color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Colors</SelectItem>
                  {uniqueColors.map(color => (
                    <SelectItem key={color} value={color}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full border" 
                          style={{ backgroundColor: color.toLowerCase() }}
                        ></div>
                        {color}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueLocations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={deliveryDateFilter} onValueChange={setDeliveryDateFilter}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  <SelectValue placeholder="Delivery" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Delivery Dates</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="next-week">Next Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                size="sm"
                onClick={clearFilters}
                className="h-8 px-3 text-xs"
              >
                <Filter className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Selection Summary */}
        {showSelection && selectedVehicles.size > 0 && (
          <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
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

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {/* Checkbox column */}
                  {showSelection && (
                    <TableHead className="px-4 py-3 w-12">
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
                    className="cursor-pointer hover:bg-muted/50 px-4 py-3 min-w-[220px]"
                    onClick={() => handleSort('owner')}
                  >
                    <div className="flex items-center gap-2">
                      Owner
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
                    className="hover:bg-muted/50"
                  >
                    {/* Checkbox cell */}
                    {showSelection && (
                      <TableCell className="px-4 py-4">
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
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Car className="h-5 w-5 text-primary" />
                        </div>
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
                      <div>
                        <div className="font-medium text-base">{vehicle.owner?.name || 'Unknown Owner'}</div>
                        <div className="text-sm text-muted-foreground">{vehicle.owner?.email || 'No Email'}</div>
                        <div className="text-xs text-muted-foreground">{vehicle.owner?.phone || 'No Phone'}</div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedVehicles.map((vehicle) => (
              <Card 
                key={vehicle.id} 
                className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-2 hover:border-blue-200 dark:hover:border-blue-700"
                onClick={() => handleVehicleClick(vehicle.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shadow-sm">
                      <Car className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="outline" className={`${getStatusColor(vehicle.status)} text-xs`}>
                      {getStatusIcon(vehicle.status)}
                      <span className="ml-1">{vehicle.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{vehicle.make} {vehicle.model}</h3>
                      <p className="text-sm text-muted-foreground">{vehicle.year} • {vehicle.color}</p>
                      <p className="text-xs text-muted-foreground font-mono">VIN: {vehicle.vin}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{vehicle.owner?.name || 'Unknown Owner'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{vehicle.currentLocation?.name || 'Unknown Location'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{formatDate(vehicle.orderDate)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {filteredAndSortedVehicles.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Car className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
            <p>No vehicles match your current search criteria.</p>
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

