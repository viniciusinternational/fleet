'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Plus } from 'lucide-react';
import type { Role } from '@/types';
import VehicleTable from '@/components/globals/vehicles/vehicle-table';
import { useAuthStore } from '@/store/auth';
import { hasPermission } from '@/lib/permissions';
import { Button } from '@/components/ui/button';

interface VehiclesPageProps {
  userRole: Role;
  basePath: string; // '/admin' or '/normal'
}

const VehiclesPage: React.FC<VehiclesPageProps> = ({ userRole, basePath }) => {
  const router = useRouter();
  const { user } = useAuthStore();
  
  // Get current user
  const currentUser = user;
  const userLocation = currentUser?.location;

  const handleVehicleClick = (vehicleId: string) => {
    router.push(`${basePath}/vehicles/${vehicleId}`);
  };

  const handleAddVehicle = () => {
    if (user && hasPermission(user, 'add_vehicles')) {
      router.push(`${basePath}/vehicles/add`);
    } else {
      // For users without permission, show a message
      alert('You do not have permission to add vehicles. Please contact your system administrator.');
    }
  };

  const getPageTitle = () => {
    switch (userRole) {
      case 'Admin':
        return 'All Vehicles';
      case 'CEO':
        return 'Fleet Overview';
      case 'Normal':
      default:
        return 'Vehicles';
    }
  };

  const getPageSubtitle = () => {
    switch (userRole) {
      case 'Admin':
        return 'Manage and monitor all vehicles in the system';
      case 'CEO':
        return 'Comprehensive view of the entire vehicle fleet';
      case 'Normal':
      default:
        return 'View and track vehicles relevant to your location';
    }
  };

  const getBackUrl = () => {
    return `${basePath}/dashboard`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">{getPageTitle()}</h1>
              <p className="text-muted-foreground mt-2 text-lg">
                {getPageSubtitle()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {userLocation && userRole === 'Normal' && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">
                    Location: {userLocation.name}, {userLocation.address.city}
                  </span>
                </div>
              )}
            
            </div>
          </div>
        </div>

        {/* Vehicle Table Component */}
        <VehicleTable
          showFilters={true}
          showViewToggle={true}
          showPagination={true}
          itemsPerPage={5}
          showAddButton={user ? hasPermission(user, 'add_vehicles') : false}
          showSelection={user ? hasPermission(user, 'edit_vehicles') : false}
          onVehicleClick={handleVehicleClick}
          onAddVehicle={handleAddVehicle}
          title={getPageTitle()}
          subtitle={getPageSubtitle()}
        />
      </div>
    </div>
  );
};

export default VehiclesPage;
