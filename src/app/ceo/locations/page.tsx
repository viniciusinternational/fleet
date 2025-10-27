'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface LocationData {
  locationPerformance: Array<{
    location: any;
    vehicleCount: number;
    averageDwellTime: number;
    vehicles: Array<any>;
  }>;
  chartData: Array<{ name: string; vehicles: number; avgDwellTime: number }>;
  totalLocations: number;
  totalVehicles: number;
}

export default function LocationsPage() {
  const router = useRouter();
  const [data, setData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/ceo/locations');
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!data) return null;

  const chartConfig = {
    vehicles: { label: 'Vehicles', color: 'hsl(var(--primary))' },
    dwellTime: { label: 'Avg Dwell Time', color: 'hsl(var(--secondary))' },
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Location Performance</h1>
          <p className="text-muted-foreground">Vehicles per location and efficiency metrics</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/ceo/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalLocations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalVehicles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Dwell Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.locationPerformance.length > 0
                ? Math.round(
                    data.locationPerformance.reduce((sum, loc) => sum + loc.averageDwellTime, 0) /
                      data.locationPerformance.length
                  )
                : 0}{' '}
              days
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vehicles per Location</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.chartData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="vehicles" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Dwell Time by Location</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.chartData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="avgDwellTime" fill="hsl(var(--secondary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Location Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Location Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left">Location</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">City/Country</th>
                  <th className="p-3 text-left">Vehicles</th>
                  <th className="p-3 text-left">Avg Dwell Time (Days)</th>
                </tr>
              </thead>
              <tbody>
                {data.locationPerformance.map((loc) => (
                  <tr key={loc.location.id} className="border-b">
                    <td className="p-3">{loc.location.name}</td>
                    <td className="p-3">{loc.location.type}</td>
                    <td className="p-3">
                      {loc.location.city}, {loc.location.country}
                    </td>
                    <td className="p-3 font-semibold">{loc.vehicleCount}</td>
                    <td className="p-3">{loc.averageDwellTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

