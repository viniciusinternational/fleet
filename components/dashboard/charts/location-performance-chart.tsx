'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface LocationPerformanceChartProps {
  data: Array<{
    locationName: string;
    vehicleCount: number;
    averageDeliveryTime?: number;
  }>;
  title?: string;
  maxItems?: number;
}

export function LocationPerformanceChart({
  data,
  title = 'Vehicles by Location',
  maxItems = 10,
}: LocationPerformanceChartProps) {
  const chartData = data
    .slice(0, maxItems)
    .map(item => ({
      name: item.locationName.length > 15 
        ? item.locationName.substring(0, 15) + '...' 
        : item.locationName,
      fullName: item.locationName,
      vehicles: item.vehicleCount,
      avgDelivery: item.averageDeliveryTime || 0,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            vehicles: {
              label: 'Vehicles',
              color: 'hsl(var(--chart-1))',
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={120}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <ChartTooltipContent>
                        <div className="flex flex-col gap-1">
                          <div className="font-medium">{data.fullName}</div>
                          <div className="text-sm">
                            Vehicles: <span className="font-bold">{data.vehicles}</span>
                          </div>
                          {data.avgDelivery > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Avg Delivery: {data.avgDelivery} days
                            </div>
                          )}
                        </div>
                      </ChartTooltipContent>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="vehicles" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
