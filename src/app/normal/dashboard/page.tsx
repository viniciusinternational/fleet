'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Car, 
  MapPin, 
  ArrowRight,
  Package,
  Ship, 
  FileText,
  Globe,
  Clock,
  CheckCircle
} from 'lucide-react';
import type { Vehicle } from '@/types';
import { VehicleStatus } from '@/types';
import { mockVehicles, mockUsers } from '../../../mockdata';
import VehicleTable from '@/components/globals/vehicles/vehicle-table';

const NormalDashboard: React.FC = () => {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Mock user - in real app this would come from auth context
  const [currentUser] = useState(mockUsers.find(user => user.role === 'Normal') || mockUsers[1]);
  const userLocation = currentUser?.location;

  // Load recent vehicles based on user's location
  useEffect(() => {
    setTimeout(() => {
      // Filter vehicles by user's location or show all if no location filter
      const locationFilteredVehicles = userLocation 
        ? mockVehicles.filter(vehicle => 
            vehicle.currentLocation.id === userLocation.id ||
            vehicle.shippingDetails.destinationPort.includes(userLocation.name.split(' ')[0]) ||
            vehicle.currentLocation.type === userLocation.type
          )
        : mockVehicles;
      
      // Get only recent vehicles (limit to 5 most recent)
      const recentVehicles = locationFilteredVehicles
        .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
        .slice(0, 5);
      
      setVehicles(recentVehicles);
      setLoading(false);
    }, 1000);
  }, [userLocation]);

  // Show recent vehicles (limit to 5 for dashboard)
  const recentVehicles = vehicles.slice(0, 5);

  // Calculate dashboard stats
  const stats = {
    total: vehicles.length,
    byStatus: Object.values(VehicleStatus).reduce((acc, status) => {
      acc[status] = vehicles.filter(v => v.status === status).length;
      return acc;
    }, {} as Record<string, number>),
    overdue: vehicles.filter(v => {
      const deliveryDate = new Date(v.estimatedDelivery);
      const currentDate = new Date();
      return deliveryDate < currentDate && v.status !== 'Delivered';
    }).length,
    urgent: vehicles.filter(v => {
      const deliveryDate = new Date(v.estimatedDelivery);
      const currentDate = new Date();
      const diffDays = Math.ceil((deliveryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 3 && diffDays >= 0 && v.status !== 'Delivered';
    }).length
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-lg text-muted-foreground">Loading operational dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">User Dashboard</h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Track vehicles and monitor delivery progress for your location
              </p>
            </div>
            {userLocation && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">
                  Location: {userLocation.name}, {userLocation.address.city}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Main Dashboard Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Recent Vehicles
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                       onClick={() => router.push('/normal/vehicles')}
                className="flex items-center gap-2"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
        </CardHeader>
        <CardContent className="space-y-8">
            {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.total}</div>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Vehicles</div>
                <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">In your location</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-700">
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.byStatus['Delivered'] || 0}</div>
                <div className="text-sm text-green-600 dark:text-green-400 font-medium">Delivered</div>
                <div className="text-xs text-green-500 dark:text-green-400 mt-1">Successfully completed</div>
            </div>

              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/50 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.byStatus['In Transit'] || 0}</div>
                <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">In Transit</div>
                <div className="text-xs text-purple-500 dark:text-purple-400 mt-1">Currently shipping</div>
            </div>

              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.byStatus['At Port'] || 0}</div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">At Port</div>
                <div className="text-xs text-yellow-500 dark:text-yellow-400 mt-1">Awaiting clearance</div>
              </div>
            </div>


            {/* Recent Vehicles Table */}
            <VehicleTable
              showFilters={false}
              showViewToggle={false}
              showAddButton={false}
              showSelection={false}
              onVehicleClick={(vehicleId) => router.push(`/normal/vehicles/${vehicleId}`)}
              title="Recent Vehicles"
              subtitle="Latest vehicles in your area"
            />
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default NormalDashboard;
