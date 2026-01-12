'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Car, 
  Users,
  MapPin, 
  Package,
  FileText,
  TrendingUp,
  Calendar,
  Download,
  User,
  Building2,
  Truck,
} from 'lucide-react';
import { MetricCard } from '@/components/dashboard/metric-card';
import { ModuleSection } from '@/components/dashboard/module-section';
import { StatusDistributionChart } from '@/components/dashboard/charts/status-distribution-chart';
import { FuelTypeChart } from '@/components/dashboard/charts/fuel-type-chart';
import { MakeDistributionChart } from '@/components/dashboard/charts/make-distribution-chart';
import { ColorDistributionChart } from '@/components/dashboard/charts/color-distribution-chart';
import { ModelDistributionChart } from '@/components/dashboard/charts/model-distribution-chart';
import { TransmissionDistributionChart } from '@/components/dashboard/charts/transmission-distribution-chart';
import { MakeModelCombinationsChart } from '@/components/dashboard/charts/make-model-combinations-chart';
import { LocationPerformanceChart } from '@/components/dashboard/charts/location-performance-chart';
import { NationalityDistributionChart } from '@/components/dashboard/charts/nationality-distribution-chart';
import { TimelineChart } from '@/components/dashboard/charts/timeline-chart';
import { RoleDistributionChart } from '@/components/dashboard/charts/role-distribution-chart';
import { LocationTypeChart } from '@/components/dashboard/charts/location-type-chart';
import { CrossModuleInsights } from '@/components/dashboard/cross-module-insights';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardData {
  overview: {
    totalVehicles: number;
    totalUsers: number;
    totalLocations: number;
    totalOwners: number;
    totalSources: number;
    totalDeliveryNotes: number;
    activeUsers: number;
    inactiveUsers: number;
  };
  modules: {
    vehicles: any;
    locations: any;
    owners: any;
    users: any;
    sources: any;
    deliveryNotes: any;
  };
  crossModule: {
    vehiclesByLocation: any[];
    vehiclesByOwnerNationality: any[];
    topOwners: any[];
    topSources: any[];
    customsPerformance: any[];
    usersByLocation: any[];
  };
  trends: {
    monthlyTrends: any[];
  };
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
        setData(result.data);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="space-y-6">
            <div>
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-6 w-96" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-96" />
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
              onClick={fetchDashboardData} 
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

  if (!data) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Analytics Dashboard</h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Comprehensive insights across all modules
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Date Range
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Vehicles"
            value={data.overview.totalVehicles}
            icon={Car}
            variant="blue"
            description="Fleet size"
          />
          <MetricCard
            title="Total Users"
            value={data.overview.totalUsers}
            icon={User}
            variant="green"
            description={`${data.overview.activeUsers} active`}
          />
          <MetricCard
            title="Locations"
            value={data.overview.totalLocations}
            icon={MapPin}
            variant="purple"
            description="Ports & facilities"
          />
          <MetricCard
            title="Owners"
            value={data.overview.totalOwners}
            icon={Users}
            variant="yellow"
            description="Vehicle owners"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Sources"
            value={data.overview.totalSources}
            icon={Package}
            variant="teal"
            description="Vehicle sources"
          />
          <MetricCard
            title="Delivery Notes"
            value={data.overview.totalDeliveryNotes}
            icon={FileText}
            variant="orange"
            description="Completed deliveries"
          />
          <MetricCard
            title="Monthly Trends"
            value={data.trends.monthlyTrends.length}
            icon={TrendingUp}
            variant="default"
            description="Months tracked"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="cross">Cross-Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StatusDistributionChart
                data={data.modules.vehicles.status?.breakdown || []}
                title="Vehicle Status Distribution"
              />
              <FuelTypeChart
                data={data.modules.vehicles.fuelType?.breakdown || []}
                title="Fuel Type Distribution"
              />
            </div>
            <TimelineChart
              data={data.trends.monthlyTrends}
              title="Monthly Trends"
              showRevenue={false}
            />
          </TabsContent>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles" className="space-y-6">
            <ModuleSection
              title="Vehicle Analytics"
              description="Fleet statistics and distributions"
              icon={<Car className="h-5 w-5" />}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StatusDistributionChart
                  data={data.modules.vehicles.status?.breakdown || []}
                  title="Status Distribution"
                />
                <FuelTypeChart
                  data={data.modules.vehicles.fuelType?.breakdown || []}
                  title="Fuel Type Distribution"
                />
                <MakeDistributionChart
                  data={data.modules.vehicles.make?.breakdown || []}
                  title="Make Distribution"
                />
                <ColorDistributionChart
                  data={data.modules.vehicles.color?.breakdown || []}
                  title="Color Distribution"
                />
                <TransmissionDistributionChart
                  data={data.modules.vehicles.transmission?.breakdown || []}
                  title="Transmission Distribution"
                />
              </div>
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ModelDistributionChart
                  data={data.modules.vehicles.model?.breakdown || []}
                  title="Top Models"
                />
                <MakeModelCombinationsChart
                  data={data.modules.vehicles.makeModelCombinations?.breakdown || []}
                  title="Top Make/Model Combinations"
                />
              </div>
              {data.modules.vehicles.customsStatus?.breakdown && (
                <div className="mt-6">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-4">Customs Status</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {data.modules.vehicles.customsStatus.breakdown.map((item: any) => (
                          <div
                            key={item.status}
                            className="text-center p-4 bg-muted/50 rounded-lg"
                          >
                            <p className="text-2xl font-bold">{item.count}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.status.replace(/_/g, ' ')}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.percentage}%
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </ModuleSection>
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-6">
            <ModuleSection
              title="Location Performance"
              description="Vehicle distribution and performance across locations"
              icon={<MapPin className="h-5 w-5" />}
            >
              <LocationPerformanceChart
                data={data.crossModule.vehiclesByLocation}
                title="Vehicles by Location"
                maxItems={15}
              />
            </ModuleSection>

            {data.modules.locations.type?.breakdown && (
              <ModuleSection
                title="Location Types"
                description="Distribution of location types"
                icon={<Building2 className="h-5 w-5" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.modules.locations.type.breakdown.map((item: any) => (
                    <Card key={item.type}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-3xl font-bold">{item.count}</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {item.type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.percentage}% of total
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ModuleSection>
            )}

            <ModuleSection
              title="Delivery Notes"
              description="Delivery statistics and recent activity"
              icon={<Truck className="h-5 w-5" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                  title="Total Deliveries"
                  value={data.modules.deliveryNotes.total}
                  icon={FileText}
                  variant="orange"
                />
                <MetricCard
                  title="Vehicles Delivered"
                  value={data.modules.deliveryNotes.totalVehiclesDelivered}
                  icon={Car}
                  variant="blue"
                />
                <MetricCard
                  title="Avg per Delivery"
                  value={Math.round(data.modules.deliveryNotes.averageVehiclesPerDelivery || 0)}
                  icon={TrendingUp}
                  variant="green"
                />
              </div>
              {data.modules.deliveryNotes.recentDeliveries?.length > 0 && (
                <Card className="mt-6">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Deliveries</h3>
                    <div className="space-y-2">
                      {data.modules.deliveryNotes.recentDeliveries.map((delivery: any) => (
                        <div
                          key={delivery.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{delivery.ownerName}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(delivery.deliveryDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{delivery.vehicleCount}</p>
                            <p className="text-xs text-muted-foreground">vehicles</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </ModuleSection>
          </TabsContent>

          {/* People Tab */}
          <TabsContent value="people" className="space-y-6">
            <ModuleSection
              title="Users"
              description="User statistics and role distribution"
              icon={<User className="h-5 w-5" />}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RoleDistributionChart
                  data={data.modules.users.byRole || {}}
                  title="User Role Distribution"
                />
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-4">User Statistics</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">Total Users</span>
                        <span className="font-bold">{data.overview.totalUsers}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">Active Users</span>
                        <span className="font-bold text-green-600">{data.overview.activeUsers}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">Inactive Users</span>
                        <span className="font-bold text-red-600">{data.overview.inactiveUsers}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ModuleSection>

            <ModuleSection
              title="Owners"
              description="Owner statistics and nationality distribution"
              icon={<Users className="h-5 w-5" />}
            >
              <NationalityDistributionChart
                data={data.modules.owners.nationality?.breakdown || []}
                title="Owners by Nationality"
                maxItems={10}
              />
            </ModuleSection>

            <ModuleSection
              title="Sources"
              description="Source statistics and nationality distribution"
              icon={<Package className="h-5 w-5" />}
            >
              <NationalityDistributionChart
                data={data.modules.sources.nationality?.breakdown || []}
                title="Sources by Nationality"
                maxItems={10}
              />
            </ModuleSection>
          </TabsContent>

          {/* Cross-Analytics Tab */}
          <TabsContent value="cross" className="space-y-6">
            <CrossModuleInsights
              vehiclesByLocation={data.crossModule.vehiclesByLocation}
              vehiclesByOwnerNationality={data.crossModule.vehiclesByOwnerNationality}
              topOwners={data.crossModule.topOwners}
              topSources={data.crossModule.topSources}
              customsPerformance={data.crossModule.customsPerformance}
              usersByLocation={data.crossModule.usersByLocation}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
