'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Car, 
  Users,
  MapPin, 
  ArrowRight,
  Package,
  Ship,
  FileText,
  Globe,
  Clock,
  CheckCircle
} from 'lucide-react';
import { VehicleStatus, Vehicle } from '@/types';
import VehicleTable from '@/components/globals/vehicles/vehicle-table';

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalUsers: 0,
    totalLocations: 0,
    totalOwners: 0
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/dashboard/stats');
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch dashboard data');
        }

        if (result.success) {
          const { overview, recent } = result.data;
          
          setStats({
            totalVehicles: overview.totalVehicles,
            totalUsers: overview.totalUsers,
            totalLocations: overview.totalLocations,
            totalOwners: overview.totalOwners,
          });
          
          setVehicles(recent.recentVehicles);
        } else {
          throw new Error('Failed to fetch dashboard data');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Get recent vehicles (sorted by order date, newest first, limited to 5)
  const recentVehicles = vehicles.slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-lg text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <div className="text-red-500 text-lg font-semibold">Error Loading Dashboard</div>
            <p className="text-muted-foreground">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="mt-4"
            >
              Retry
            </Button>
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
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Manage vehicles, users, and locations across the system
              </p>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">
                System Overview
              </span>
            </div>
          </div>
        </div>

        {/* Main Dashboard Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">System Overview</h2>
                <p className="text-muted-foreground">Key metrics and recent activity</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats?.totalVehicles || 0}</div>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Vehicles</div>
                <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">In the system</div>
            </div>

              <div className="text-center p-4 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-700">
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats?.totalUsers || 0}</div>
                <div className="text-sm text-green-600 dark:text-green-400 font-medium">Total Users</div>
                <div className="text-xs text-green-500 dark:text-green-400 mt-1">Registered users</div>
                  </div>

              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/50 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats?.totalLocations || 0}</div>
                <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Locations</div>
                <div className="text-xs text-purple-500 dark:text-purple-400 mt-1">Ports & facilities</div>
                  </div>

              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats?.totalOwners || 0}</div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Owners</div>
                <div className="text-xs text-yellow-500 dark:text-yellow-400 mt-1">Vehicle owners</div>
              </div>
            </div>

            {/* Quick Actions Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => router.push('/admin/vehicles')}
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950/50 dark:hover:border-blue-700"
                >
                  <Car className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <div className="text-center">
                    <div className="font-semibold">Manage Vehicles</div>
                    <div className="text-sm text-muted-foreground">View, edit, and manage all vehicles</div>
                  </div>
                </Button>
                
                <Button
                  onClick={() => router.push('/admin/users')}
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-950/50 dark:hover:border-green-700"
                >
                  <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <div className="text-center">
                    <div className="font-semibold">Manage Users</div>
                    <div className="text-sm text-muted-foreground">Create and manage user accounts</div>
                  </div>
                </Button>
                
                <Button
                  onClick={() => router.push('/admin/locations')}
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-950/50 dark:hover:border-purple-700"
                >
                  <MapPin className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <div className="text-center">
                    <div className="font-semibold">Manage Locations</div>
                    <div className="text-sm text-muted-foreground">Configure ports, warehouses, and facilities</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Recent Vehicles Table */}
            <VehicleTable
              showFilters={false}
              showViewToggle={false}
              showAddButton={false}
              showSelection={false}
              onVehicleClick={(vehicleId) => router.push(`/admin/vehicles/${vehicleId}`)}
              title="Recent Vehicles"
              subtitle="Latest vehicles in the system"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
