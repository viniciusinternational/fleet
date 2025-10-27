'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Ship } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface ShippingData {
  topRoutes: Array<{ route: string; count: number }>;
  companyDistribution: Array<{ company: string; count: number }>;
  activeShipments: Array<any>;
  averageTransitTime: number;
  topPorts: Array<{ port: string; count: number }>;
  totalShipments: number;
  vehiclesWithShipping: number;
}

export default function ShippingPage() {
  const router = useRouter();
  const [data, setData] = useState<ShippingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/ceo/shipping');
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching shipping data:', error);
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
    count: { label: 'Count', color: 'hsl(var(--primary))' },
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shipping & Logistics</h1>
          <p className="text-muted-foreground">Route analysis and shipping performance</p>
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
            <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalShipments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Shipments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeShipments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Transit Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.averageTransitTime} days</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Shipping Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.companyDistribution.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.topRoutes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="route" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Company Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.companyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="company" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Active Shipments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Shipments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left">VIN</th>
                  <th className="p-3 text-left">Make/Model</th>
                  <th className="p-3 text-left">Route</th>
                  <th className="p-3 text-left">Shipping Company</th>
                  <th className="p-3 text-left">Booking #</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.activeShipments.map((shipment) => (
                  <tr key={shipment.id} className="border-b">
                    <td className="p-3">{shipment.vin}</td>
                    <td className="p-3">{shipment.make} {shipment.model}</td>
                    <td className="p-3">{shipment.originPort} → {shipment.destinationPort}</td>
                    <td className="p-3">{shipment.shippingCompany}</td>
                    <td className="p-3">{shipment.bookingNumber}</td>
                    <td className="p-3">
                      <Badge variant="outline">{shipment.status}</Badge>
                    </td>
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

