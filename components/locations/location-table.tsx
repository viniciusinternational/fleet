'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  MapPin, 
  Building, 
  Ship, 
  Warehouse, 
  Truck,
  Package,
  CheckCircle,
  AlertTriangle,
  Wrench,
  Users,
  Clock
} from 'lucide-react';
import { LocationType, LocationStatus, Location } from '@/types';
import { SortableHeader } from './sortable-header';
import { DeleteLocationDialog } from './delete-location-dialog';

interface LocationTableProps {
  locations: Location[];
  users: any[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function LocationTable({ 
  locations, 
  users, 
  sortBy, 
  sortOrder
}: LocationTableProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<string | null>(null);

  // Helper function to safely access location address data
  const getLocationAddress = (location: Location) => {
    // Handle both flat structure (from API) and nested structure (from mock data)
    if (location.address) {
      return {
        street: location.address.street || '',
        city: location.address.city || '',
        state: location.address.state || '',
        country: location.address.country || '',
        postalCode: location.address.postalCode || ''
      };
    } else {
      // Fallback for flat structure from API
      return {
        street: (location as any).street || '',
        city: (location as any).city || '',
        state: (location as any).state || '',
        country: (location as any).country || '',
        postalCode: (location as any).postalCode || ''
      };
    }
  };

  // Get users count for each location
  const getUsersCount = (locationId: string) => {
    return users.filter(user => user.location.id === locationId).length;
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  const getTypeIcon = (type: LocationType) => {
    switch (type) {
      case 'Port':
        return <Ship className="h-4 w-4" />;
      case 'Warehouse':
        return <Warehouse className="h-4 w-4" />;
      case 'Customs Office':
        return <Building className="h-4 w-4" />;
      case 'Dealership':
        return <Truck className="h-4 w-4" />;
      case 'Delivery Point':
        return <Package className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: LocationType) => {
    switch (type) {
      case 'Port':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700';
      case 'Warehouse':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-700';
      case 'Customs Office':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-700';
      case 'Dealership':
        return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-700';
      case 'Delivery Point':
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-700';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getStatusColor = (status: LocationStatus) => {
    switch (status) {
      case 'Operational':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-700';
      case 'Temporarily Closed':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-700';
      case 'Under Maintenance':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status: LocationStatus) => {
    switch (status) {
      case 'Operational':
        return <CheckCircle className="h-3 w-3" />;
      case 'Temporarily Closed':
        return <AlertTriangle className="h-3 w-3" />;
      case 'Under Maintenance':
        return <Wrench className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const handleLocationClick = (locationId: string) => {
    router.push(`/locations/${locationId}`);
  };

  const openDeleteDialog = (locationId: string) => {
    setLocationToDelete(locationId);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <SortableHeader 
                field="name" 
                currentSortBy={sortBy} 
                currentSortOrder={sortOrder}
                className="min-w-[200px]"
              >
                Location
              </SortableHeader>
              <SortableHeader 
                field="type" 
                currentSortBy={sortBy} 
                currentSortOrder={sortOrder}
                className="min-w-[140px] hidden md:table-cell"
              >
                Type
              </SortableHeader>
              <TableHead className="px-3 py-3 min-w-[100px]">Status</TableHead>
              <TableHead className="px-3 py-3 min-w-[120px] hidden lg:table-cell">Address</TableHead>
              <TableHead className="px-3 py-3 min-w-[100px] hidden xl:table-cell">Users</TableHead>
              <TableHead className="px-3 py-3 min-w-[100px] hidden xl:table-cell">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((location) => (
              <TableRow 
                key={location.id}
                className="hover:bg-muted/50 cursor-pointer group"
                onClick={() => handleLocationClick(location.id)}
              >
                <TableCell className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      {getTypeIcon(location.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm">{location.name}</div>
                      <div className="text-xs text-muted-foreground">ID: {location.id}</div>
                      <div className="text-xs text-muted-foreground hidden sm:block">
                        {getLocationAddress(location).city}, {getLocationAddress(location).country}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-3 py-3 hidden md:table-cell">
                  <Badge variant="outline" className={`${getTypeColor(location.type)} text-xs px-2 py-1`}>
                    {getTypeIcon(location.type)}
                    <span className="ml-1">{location.type}</span>
                  </Badge>
                </TableCell>
                <TableCell className="px-3 py-3">
                  <Badge variant="outline" className={`${getStatusColor(location.status)} text-xs px-2 py-1`}>
                    {getStatusIcon(location.status)}
                    <span className="ml-1">{location.status}</span>
                  </Badge>
                </TableCell>
                <TableCell className="px-3 py-3 hidden lg:table-cell">
                  <div>
                    <div className="font-medium text-sm">{getLocationAddress(location).street}</div>
                    <div className="text-xs text-muted-foreground">{getLocationAddress(location).city}, {getLocationAddress(location).state}</div>
                  </div>
                </TableCell>
                <TableCell className="px-3 py-3 hidden xl:table-cell">
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{getUsersCount(location.id)}</span>
                  </div>
                </TableCell>
                <TableCell className="px-3 py-3 hidden xl:table-cell">
                  <div className="text-sm text-muted-foreground">
                    {formatDate(location.lastUpdated)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteLocationDialog
        locationId={locationToDelete}
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setLocationToDelete(null);
        }}
      />
    </>
  );
}

