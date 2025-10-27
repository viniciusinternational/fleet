'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Car,
  Download,
  FileText
} from 'lucide-react';
import { VehicleStatus } from '@/types';
import type { Vehicle, Location, Owner, VehicleStatus as VehicleStatusType } from '@/types';

interface CEOAnalytics {
  totalVehicles: number;
  totalLocations: number;
  totalOwners: number;
  statusDistribution: Record<VehicleStatusType, number>;
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
                High-level operational overview and strategic insights
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button size="sm" onClick={() => router.push('/ceo/reports')}>
                <FileText className="h-4 w-4 mr-2" />
                Generate Custom Report
              </Button>
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
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{analytics.totalVehicles}</div>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Vehicles</div>
                <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">Across all locations</div>
              </div>

              <div className="text-center p-4 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-700">
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">${analytics.totalImportDuties.toLocaleString()}</div>
                <div className="text-sm text-green-600 dark:text-green-400 font-medium">Total Import Duty</div>
                <div className="text-xs text-green-500 dark:text-green-400 mt-1">Pending and paid</div>
              </div>

              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/50 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{analytics.averageDeliveryTime} days</div>
                <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Avg Delivery Time</div>
                <div className="text-xs text-purple-500 dark:text-purple-400 mt-1">Last 12 months</div>
              </div>

              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{analytics.totalLocations}</div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Active Locations</div>
                <div className="text-xs text-yellow-500 dark:text-yellow-400 mt-1">Operational facilities</div>
              </div>
      </div>

            {/* Status Distribution and Geographical Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Vehicle Status Distribution
                  </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                    {Object.entries(analytics.statusDistribution).map(([status, count]) => {
                      const percentage = analytics.totalVehicles > 0 
                        ? Math.round((count / analytics.totalVehicles) * 100) 
                        : 0;
                      
                      const getStatusColor = (status: VehicleStatusType) => {
                        switch (status) {
                          case VehicleStatus.DELIVERED: return 'bg-green-500';
                          case VehicleStatus.IN_TRANSIT: return 'bg-blue-500';
                          case VehicleStatus.AT_PORT: return 'bg-yellow-500';
                          case VehicleStatus.CLEARING_CUSTOMS: return 'bg-orange-500';
                          case VehicleStatus.IN_LOCAL_DELIVERY: return 'bg-purple-500';
                          case VehicleStatus.ORDERED: return 'bg-gray-500';
                          default: return 'bg-gray-500';
                        }
                      };

                      return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(status as VehicleStatusType)}`}></div>
                    <Badge variant="secondary">{status}</Badge>
                            <span className="text-sm text-muted-foreground">{count} vehicles</span>
                  </div>
                  <div className="text-sm font-medium">
                            {percentage}%
                          </div>
                        </div>
                      );
                    })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Geographical Overview
                  </CardTitle>
          </CardHeader>
          <CardContent>
                  <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center mb-4">
                    <p className="text-muted-foreground">World Map - Location Pins</p>
            </div>
                  <div className="space-y-2">
                    {analytics.locationPerformance.slice(0, 5).map((item) => (
                      <div key={item.location.id} className="flex items-center justify-between text-sm">
                        <span>{item.location.name}</span>
                        <Badge variant="outline">{item.location.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Average Delivery Time Trend
                  </CardTitle>
          </CardHeader>
          <CardContent>
                  <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Line Chart - Delivery Time Over Last Year</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Customs Clearance Performance
                  </CardTitle>
          </CardHeader>
          <CardContent>
                  <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Bar Chart - Clearance Time by Customs Office</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Insights
                </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-2">Import Duties by Country</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Japan</span>
                  <span className="text-sm font-medium">$5,300</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Germany</span>
                  <span className="text-sm font-medium">$2,200</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Shipping Costs</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Mitsui O.S.K. Lines</span>
                  <span className="text-sm font-medium">$8,500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">NYK Line</span>
                  <span className="text-sm font-medium">$7,200</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Revenue Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Revenue</span>
                  <span className="text-sm font-medium">$125,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Net Profit</span>
                  <span className="text-sm font-medium">$23,000</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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