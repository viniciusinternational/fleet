'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModuleSection } from './module-section';
import { LocationPerformanceChart } from './charts/location-performance-chart';
import { CustomsPerformanceChart } from './charts/customs-performance-chart';
import { NationalityDistributionChart } from './charts/nationality-distribution-chart';
import { Link2, TrendingUp, Users, MapPin, Package, FileText } from 'lucide-react';

interface CrossModuleInsightsProps {
  vehiclesByLocation: Array<{
    locationId: string;
    locationName: string;
    locationType: string;
    city: string;
    country: string;
    vehicleCount: number;
    averageDeliveryTime: number;
    totalImportDuties: number;
  }>;
  vehiclesByOwnerNationality: Array<{
    nationality: string;
    vehicleCount: number;
    ownerCount: number;
  }>;
  topOwners: Array<{
    ownerId: string;
    ownerName: string;
    vehicleCount: number;
    nationality: string;
  }>;
  topSources: Array<{
    sourceId: string;
    sourceName: string;
    nationality: string;
    vehicleCount: number;
  }>;
  customsPerformance: Array<{
    locationId: string;
    locationName: string;
    averageClearanceTime: number;
    totalVehicles: number;
    successRate: number;
  }>;
  usersByLocation: Array<{
    locationId: string;
    locationName: string;
    userCount: number;
  }>;
}

export function CrossModuleInsights({
  vehiclesByLocation,
  vehiclesByOwnerNationality,
  topOwners,
  topSources,
  customsPerformance,
  usersByLocation,
}: CrossModuleInsightsProps) {
  return (
    <div className="space-y-6">
      <ModuleSection
        title="Vehicles × Locations"
        description="Vehicle distribution and performance across locations"
        icon={<Link2 className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LocationPerformanceChart
            data={vehiclesByLocation}
            title="Vehicles by Location"
            maxItems={10}
          />
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Locations Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehiclesByLocation.slice(0, 5).map((location, index) => (
                  <div
                    key={location.locationId}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{location.locationName}</p>
                        <p className="text-xs text-muted-foreground">
                          {location.city}, {location.country}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{location.vehicleCount}</p>
                      <p className="text-xs text-muted-foreground">
                        {location.averageDeliveryTime} days avg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </ModuleSection>

      <ModuleSection
        title="Vehicles × Owners"
        description="Top owners and nationality distribution"
        icon={<Users className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NationalityDistributionChart
            data={vehiclesByOwnerNationality.map(item => ({
              nationality: item.nationality,
              count: item.vehicleCount,
              percentage: vehiclesByOwnerNationality.reduce(
                (sum, i) => sum + i.vehicleCount,
                0
              ) > 0
                ? Math.round(
                    (item.vehicleCount /
                      vehiclesByOwnerNationality.reduce(
                        (sum, i) => sum + i.vehicleCount,
                        0
                      )) *
                      100
                  )
                : 0,
            }))}
            title="Vehicles by Owner Nationality"
            maxItems={10}
          />
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Owners by Vehicle Count</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topOwners.slice(0, 8).map((owner, index) => (
                  <div
                    key={owner.ownerId}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{owner.ownerName}</p>
                        <p className="text-xs text-muted-foreground">{owner.nationality}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{owner.vehicleCount}</p>
                      <p className="text-xs text-muted-foreground">vehicles</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </ModuleSection>

      <ModuleSection
        title="Vehicles × Sources"
        description="Top sources contributing to vehicles"
        icon={<Package className="h-5 w-5" />}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Sources by Vehicle Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topSources.slice(0, 8).map((source, index) => (
                <div
                  key={source.sourceId}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{source.sourceName}</p>
                      <p className="text-xs text-muted-foreground">{source.nationality}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{source.vehicleCount}</p>
                    <p className="text-xs text-muted-foreground">vehicles</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </ModuleSection>

      <ModuleSection
        title="Customs × Locations"
        description="Customs clearance performance by location"
        icon={<MapPin className="h-5 w-5" />}
      >
        {customsPerformance.length > 0 ? (
          <CustomsPerformanceChart data={customsPerformance} />
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No customs office data available
            </CardContent>
          </Card>
        )}
      </ModuleSection>

      <ModuleSection
        title="Users × Locations"
        description="User distribution across locations"
        icon={<FileText className="h-5 w-5" />}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Users by Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {usersByLocation.map((item) => (
                <div
                  key={item.locationId}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{item.locationName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{item.userCount}</p>
                    <p className="text-xs text-muted-foreground">users</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </ModuleSection>
    </div>
  );
}
