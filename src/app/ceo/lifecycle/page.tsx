'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';

interface LifecycleData {
  statusDistribution: Record<string, number>;
  lifecycleStages: Array<{ stage: string; count: number; color: string }>;
  averageTimePerStatus: Array<{ status: string; averageDays: number; count: number }>;
  vehiclesByStatus: Array<any>;
  totalVehicles: number;
}

const COLORS = {
  ORDERED: '#94a3b8',
  IN_TRANSIT: '#3b82f6',
  CLEARING_CUSTOMS: '#f59e0b',
  AT_PORT: '#eab308',
  IN_LOCAL_DELIVERY: '#8b5cf6',
  DELIVERED: '#10b981',
};

export default function LifecyclePage() {
  const router = useRouter();
  const [data, setData] = useState<LifecycleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/ceo/lifecycle');
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching lifecycle data:', error);
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
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vehicle Lifecycle</h1>
          <p className="text-muted-foreground">Track vehicles through each stage</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/ceo/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.statusDistribution.IN_TRANSIT}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.statusDistribution.DELIVERED}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">At Customs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.statusDistribution.CLEARING_CUSTOMS}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.lifecycleStages}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--primary))">
                    {data.lifecycleStages.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Time Per Status (Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.averageTimePerStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="averageDays" fill="hsl(var(--primary))">
                    {data.averageTimePerStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS] || '#94a3b8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Vehicles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Vehicles by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left">VIN</th>
                  <th className="p-3 text-left">Make/Model</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Location</th>
                  <th className="p-3 text-left">Owner</th>
                </tr>
              </thead>
              <tbody>
                {data.vehiclesByStatus.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b">
                    <td className="p-3">{vehicle.vin}</td>
                    <td className="p-3">{vehicle.make} {vehicle.model} ({vehicle.year})</td>
                    <td className="p-3">
                      <Badge variant="outline">{vehicle.status}</Badge>
                    </td>
                    <td className="p-3">{vehicle.location}</td>
                    <td className="p-3">{vehicle.owner}</td>
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

