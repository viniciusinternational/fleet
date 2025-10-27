'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  MapPin, 
  ArrowRight,
  BarChart3,
  PieChart,
  Globe,
  Clock,
  DollarSign,
  Users,
  Package,
  Activity,
  Car
} from 'lucide-react';
import type { Vehicle, Location, Owner, VehicleStatus } from '@/types';
import { VehicleStatus as VehicleStatusEnum } from '@/types';

interface CEOAnalytics {
  totalVehicles: number;
  totalLocations: number;
  totalOwners: number;
  statusDistribution: Record<VehicleStatus, number>;
  averageDeliveryTime: number;
  totalImportDuties: number;
  locationPerformance: Array<{
    location: Location;
    vehicleCount: number;
    averageDwellTime: number;
  }>;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: Date;
    location: string;
  }>;
}

const CEODashboard: React.FC = () => {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<CEOAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/ceo/dashboard');
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch dashboard data');
        }

        if (result.success) {
          setAnalytics(result.data);
        } else {
          throw new Error('Failed to fetch dashboard data');
        }
      } catch (error) {
        console.error('Error fetching CEO dashboard data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);


  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-lg text-muted-foreground">Loading executive dashboard...</p>
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

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Executive Dashboard</h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Strategic overview and performance analytics
              </p>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">
                Global Operations Overview
              </span>
            </div>
          </div>
        </div>

        {/* Main Dashboard Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Strategic Overview</h2>
                <p className="text-muted-foreground">Key performance indicators and business metrics</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{analytics.totalVehicles}</div>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Vehicles</div>
                <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">In the system</div>
              </div>

              <div className="text-center p-4 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-700">
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">{analytics.averageDeliveryTime}</div>
                <div className="text-sm text-green-600 dark:text-green-400 font-medium">Avg Delivery Time</div>
                <div className="text-xs text-green-500 dark:text-green-400 mt-1">Days from order</div>
              </div>

              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/50 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">${analytics.totalImportDuties.toLocaleString()}</div>
                <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total Import Duties</div>
                <div className="text-xs text-purple-500 dark:text-purple-400 mt-1">Paid across all vehicles</div>
              </div>

              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{analytics.totalLocations}</div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Active Locations</div>
                <div className="text-xs text-yellow-500 dark:text-yellow-400 mt-1">Ports & facilities</div>
              </div>
            </div>

            {/* Strategic Actions Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Strategic Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => router.push('/ceo/analytics')}
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950/50 dark:hover:border-blue-700"
                >
                  <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <div className="text-center">
                    <div className="font-semibold">View Analytics</div>
                    <div className="text-sm text-muted-foreground">Comprehensive business intelligence</div>
                  </div>
                </Button>
                
                <Button
                  onClick={() => router.push('/admin/vehicles')}
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-950/50 dark:hover:border-green-700"
                >
                  <Car className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <div className="text-center">
                    <div className="font-semibold">Vehicle Overview</div>
                    <div className="text-sm text-muted-foreground">View all vehicles in the system</div>
                  </div>
                </Button>
                
                <Button
                  onClick={() => router.push('/admin/locations')}
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-950/50 dark:hover:border-purple-700"
                >
                  <Globe className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <div className="text-center">
                    <div className="font-semibold">Global Locations</div>
                    <div className="text-sm text-muted-foreground">Monitor worldwide operations</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Status Distribution */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Vehicle Status Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(analytics.statusDistribution).map(([status, count]) => {
                  const percentage = analytics.totalVehicles > 0 
                    ? Math.round((count / analytics.totalVehicles) * 100) 
                    : 0;
                  
                  const getStatusColor = (status: VehicleStatus) => {
                    switch (status) {
                      case VehicleStatusEnum.DELIVERED: return 'bg-green-500';
                      case VehicleStatusEnum.IN_TRANSIT: return 'bg-blue-500';
                      case VehicleStatusEnum.AT_PORT: return 'bg-yellow-500';
                      case VehicleStatusEnum.CLEARING_CUSTOMS: return 'bg-orange-500';
                      case VehicleStatusEnum.IN_LOCAL_DELIVERY: return 'bg-purple-500';
                      case VehicleStatusEnum.ORDERED: return 'bg-gray-500';
                      default: return 'bg-gray-500';
                    }
                  };

                  return (
                    <div key={status} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(status as VehicleStatus)}`}></div>
                        <span className="text-sm font-medium">{status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{count}</span>
                        <span className="text-xs text-muted-foreground">({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Performing Locations */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Top Performing Locations</h3>
              <div className="space-y-3">
                {analytics.locationPerformance.slice(0, 5).map((item, index) => (
                  <div key={item.location.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <span className="text-sm font-medium">{item.location.name}</span>
                        <p className="text-xs text-muted-foreground">{item.location.address.city}, {item.location.address.country}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">{item.vehicleCount}</span>
                      <p className="text-xs text-muted-foreground">vehicles</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {analytics.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.location} • {activity.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CEODashboard;