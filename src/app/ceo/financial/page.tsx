'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface FinancialData {
  overview: {
    totalImportDuties: number;
    averageImportDuty: number;
    highestImportDuty: number;
    lowestImportDuty: number;
  };
  statusBreakdown: Array<any>;
  customsBreakdown: Array<any>;
  topVehiclesByDuty: Array<any>;
  monthlyBreakdown: Array<{ month: string; total: number }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function FinancialPage() {
  const router = useRouter();
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/ceo/financial');
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
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
    duties: { label: 'Import Duties', color: 'hsl(var(--primary))' },
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Overview</h1>
          <p className="text-muted-foreground">Import duties and financial metrics</p>
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
            <CardTitle className="text-sm font-medium">Total Import Duties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.overview.totalImportDuties.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Duty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.overview.averageImportDuty.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Highest Duty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.overview.highestImportDuty.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lowest Duty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.overview.lowestImportDuty.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Import Duties Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.monthlyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" opacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Duties by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.statusBreakdown}
                    dataKey="total"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {data.statusBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Vehicles by Duty */}
      <Card>
        <CardHeader>
          <CardTitle>Top Vehicles by Import Duty</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left">VIN</th>
                  <th className="p-3 text-left">Make/Model</th>
                  <th className="p-3 text-left">Import Duty</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Customs Status</th>
                  <th className="p-3 text-left">Owner</th>
                </tr>
              </thead>
              <tbody>
                {data.topVehiclesByDuty.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b">
                    <td className="p-3">{vehicle.vin}</td>
                    <td className="p-3">{vehicle.make} {vehicle.model}</td>
                    <td className="p-3 font-semibold">${vehicle.importDuty.toLocaleString()}</td>
                    <td className="p-3">
                      <Badge variant="outline">{vehicle.status}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{vehicle.customsStatus}</Badge>
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

