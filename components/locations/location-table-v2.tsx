'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
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
import { DataTable, TableColumn, TableAction } from '@/components/ui/data-table';
import { DeleteLocationDialog } from './delete-location-dialog';

interface LocationTableProps {
  locations: Location[];
  users: any[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

export function LocationTableV2({ 
  locations, 
  users, 
  sortBy, 
  sortOrder,
  onSort
}: LocationTableProps) {
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
        return 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200 dark:from-blue-950 dark:to-blue-900 dark:text-blue-300 dark:border-blue-700';
      case 'Warehouse':
        return 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200 dark:from-green-950 dark:to-green-900 dark:text-green-300 dark:border-green-700';
      case 'Customs Office':
        return 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200 dark:from-purple-950 dark:to-purple-900 dark:text-purple-300 dark:border-purple-700';
      case 'Dealership':
        return 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border-orange-200 dark:from-orange-950 dark:to-orange-900 dark:text-orange-300 dark:border-orange-700';
      case 'Delivery Point':
        return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 dark:from-gray-950 dark:to-gray-900 dark:text-gray-300 dark:border-gray-700';
      default:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 dark:from-gray-950 dark:to-gray-900 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getStatusColor = (status: LocationStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-700';
      case 'Inactive':
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-700';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status: LocationStatus) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="h-3 w-3" />;
      case 'Inactive':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const columns: TableColumn<Location>[] = [
    {
      key: 'name',
      label: 'Location',
      sortable: true,
      headerClassName: 'min-w-[200px]',
      render: (location) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
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
      )
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      headerClassName: 'min-w-[140px] hidden md:table-cell',
      className: 'hidden md:table-cell',
      render: (location) => (
        <Badge variant="outline" className={`${getTypeColor(location.type)} text-xs px-2 py-1`}>
          {getTypeIcon(location.type)}
          <span className="ml-1">{location.type}</span>
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      headerClassName: 'min-w-[100px]',
      render: (location) => (
        <Badge variant="outline" className={`${getStatusColor(location.status)} text-xs px-2 py-1`}>
          {getStatusIcon(location.status)}
          <span className="ml-1">{location.status}</span>
        </Badge>
      )
    },
    {
      key: 'address',
      label: 'Address',
      headerClassName: 'min-w-[120px] hidden lg:table-cell',
      className: 'hidden lg:table-cell',
      render: (location) => (
        <div>
          <div className="font-medium text-sm">{getLocationAddress(location).street}</div>
          <div className="text-xs text-muted-foreground">{getLocationAddress(location).city}, {getLocationAddress(location).state}</div>
        </div>
      )
    },
    {
      key: 'users',
      label: 'Users',
      headerClassName: 'min-w-[100px] hidden xl:table-cell',
      className: 'hidden xl:table-cell',
      render: (location) => (
        <div className="flex items-center gap-2">
          <Users className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm font-medium">{getUsersCount(location.id)}</span>
        </div>
      )
    },
    {
      key: 'lastUpdated',
      label: 'Updated',
      sortable: true,
      headerClassName: 'min-w-[100px] hidden xl:table-cell',
      className: 'hidden xl:table-cell',
      render: (location) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(location.lastUpdated)}
        </div>
      )
    }
  ];

  return (
    <DataTable
      data={locations}
      columns={columns}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={onSort}
      onRowClick={(location) => {
        // Handle row click navigation
        window.location.href = `/admin/locations/${location.id}`;
      }}
      rowClassName="hover:bg-muted/50 cursor-pointer group"
    />
  );
}
