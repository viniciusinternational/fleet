'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  BarChart3,
  PieChart,
  Globe,
  Clock,
  DollarSign,
  Download,
  Filter,
  Calendar,
  MapPin,
  Users,
  Package
} from 'lucide-react';
import type { Vehicle, Location, Owner, VehicleStatus } from '@/types';
import { VehicleStatus as VehicleStatusEnum } from '@/types';

interface DetailedAnalytics {
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
    totalDuties: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    orders: number;
    deliveries: number;
    revenue: number;
  }>;
  customsPerformance: Array<{
    location: string;
    averageClearanceTime: number;
    totalVehicles: number;
    successRate: number;
  }>;
  financialSummary: {
    totalRevenue: number;
    totalDuties: number;
    averageOrderValue: number;
    profitMargin: number;
  };
}

const CEOAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<DetailedAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('12months');
  const [selectedLocation, setSelectedLocation] = useState('all');

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/ceo/analytics?timeframe=${selectedTimeframe}&locationId=${selectedLocation}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch analytics data');
        }

        if (result.success) {
          setAnalytics(result.data);
        } else {
          throw new Error('Failed to fetch analytics data');
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [selectedTimeframe, selectedLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-lg text-muted-foreground">Loading analytics...</p>
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
            <div className="text-red-500 text-lg font-semibold">Error Loading Analytics</div>
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
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Analytics & Reports</h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Comprehensive business intelligence and performance metrics
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <select 
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="12months">Last 12 Months</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <select 
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">All Locations</option>
              {/* In a real app, this would be populated from the API */}
            </select>
          </div>
        </div>

        {/* Main Analytics Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Business Intelligence</h2>
                <p className="text-muted-foreground">Key performance indicators and financial metrics</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Financial Overview */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Financial Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">${(analytics.financialSummary?.totalRevenue ?? 0).toLocaleString()}</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Revenue</div>
                  <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">+12% from last year</div>
                </div>

                <div className="text-center p-4 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">${(analytics.financialSummary?.averageOrderValue ?? 0).toLocaleString()}</div>
                  <div className="text-sm text-green-600 dark:text-green-400 font-medium">Average Order Value</div>
                  <div className="text-xs text-green-500 dark:text-green-400 mt-1">Per vehicle order</div>
                </div>

                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/50 rounded-lg border border-purple-200 dark:border-purple-700">
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">${(analytics.totalImportDuties ?? 0).toLocaleString()}</div>
                  <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total Import Duties</div>
                  <div className="text-xs text-purple-500 dark:text-purple-400 mt-1">Paid across all vehicles</div>
                </div>

                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg border border-yellow-200 dark:border-yellow-700">
                  <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{analytics.financialSummary?.profitMargin ?? 0}%</div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Profit Margin</div>
                  <div className="text-xs text-yellow-500 dark:text-yellow-400 mt-1">Average margin</div>
                </div>
              </div>
            </div>

            {/* Monthly Trends */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Orders & Deliveries</h4>
                  {analytics.monthlyTrends.slice(-6).map((trend) => (
                    <div key={trend.month} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">{trend.month}</span>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{trend.orders}</div>
                          <div className="text-xs text-muted-foreground">Orders</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{trend.deliveries}</div>
                          <div className="text-xs text-muted-foreground">Deliveries</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">${((trend.revenue ?? 0) / 1000).toFixed(0)}k</div>
                          <div className="text-xs text-muted-foreground">Revenue</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Vehicle Status Distribution</h4>
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
            </div>

            {/* Location Performance */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Location Performance</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Top Locations by Vehicle Count</h4>
                  {analytics.locationPerformance.slice(0, 8).map((item, index) => (
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
                        <div className="text-sm font-medium">{item.vehicleCount}</div>
                        <div className="text-xs text-muted-foreground">{item.averageDwellTime} days avg</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Customs Performance</h4>
                  {analytics.customsPerformance.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium">{item.location}</span>
                        <p className="text-xs text-muted-foreground">{item.totalVehicles} vehicles</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{item.averageClearanceTime} days</div>
                        <div className="text-xs text-muted-foreground">{item.successRate}% success</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div>
              <h3 className="text-lg font-semibold mb-4">System Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-700">
                  <Users className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{analytics.totalOwners}</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Active Owners</div>
                  <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">Vehicle owners</div>
                </div>

                <div className="text-center p-4 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-700">
                  <Globe className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">{analytics.totalLocations}</div>
                  <div className="text-sm text-green-600 dark:text-green-400 font-medium">Global Locations</div>
                  <div className="text-xs text-green-500 dark:text-green-400 mt-1">Active locations worldwide</div>
                </div>

                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/50 rounded-lg border border-purple-200 dark:border-purple-700">
                  <Clock className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{analytics.averageDeliveryTime ?? 0}</div>
                  <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Average Delivery</div>
                  <div className="text-xs text-purple-500 dark:text-purple-400 mt-1">Days from order to delivery</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CEOAnalytics;