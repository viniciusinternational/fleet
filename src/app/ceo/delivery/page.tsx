'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';

interface DeliveryData {
  averageDeliveryTime: number;
  onTimeRate: number;
  upcomingDeliveries: Array<any>;
  overdueVehicles: Array<any>;
  monthlyTimeline: Array<{ month: string; estimated: number; delivered: number; onTimeRate: number }>;
  deliveredCount: number;
  totalVehicles: number;
}

export default function DeliveryPage() {
  const router = useRouter();
  const [data, setData] = useState<DeliveryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/ceo/delivery');
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching delivery data:', error);
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
    estimated: { label: 'Estimated', color: 'hsl(var(--primary))' },
    delivered: { label: 'Delivered', color: 'hsl(var(--chart-1))' },
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Delivery & Time Tracking</h1>
          <p className="text-muted-foreground">Timeline and delivery performance</p>
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
            <CardTitle className="text-sm font-medium">Avg Delivery Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.averageDeliveryTime} days</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.onTimeRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.upcomingDeliveries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.overdueVehicles.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Delivery Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.monthlyTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="estimated" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="delivered" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>On-Time Rate by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.monthlyTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="onTimeRate" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Vehicles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Overdue Vehicles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left">VIN</th>
                  <th className="p-3 text-left">Make/Model</th>
                  <th className="p-3 text-left">Estimated Delivery</th>
                  <th className="p-3 text-left">Days Overdue</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Owner</th>
                </tr>
              </thead>
              <tbody>
                {data.overdueVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b">
                    <td className="p-3">{vehicle.vin}</td>
                    <td className="p-3">{vehicle.make} {vehicle.model}</td>
                    <td className="p-3">{new Date(vehicle.estimatedDelivery).toLocaleDateString()}</td>
                    <td className="p-3 font-semibold text-red-600">{vehicle.daysOverdue} days</td>
                    <td className="p-3">
                      <Badge variant="outline">{vehicle.status}</Badge>
                    </td>
                    <td className="p-3">{vehicle.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Upcoming Deliveries (Next 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left">VIN</th>
                  <th className="p-3 text-left">Make/Model</th>
                  <th className="p-3 text-left">Estimated Delivery</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Owner</th>
                </tr>
              </thead>
              <tbody>
                {data.upcomingDeliveries.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b">
                    <td className="p-3">{vehicle.vin}</td>
                    <td className="p-3">{vehicle.make} {vehicle.model}</td>
                    <td className="p-3">{new Date(vehicle.estimatedDelivery).toLocaleDateString()}</td>
                    <td className="p-3">
                      <Badge variant="outline">{vehicle.status}</Badge>
                    </td>
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

