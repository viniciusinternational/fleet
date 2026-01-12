'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';

interface CustomsPerformanceChartProps {
  data: Array<{
    locationName: string;
    averageClearanceTime: number;
    totalVehicles: number;
    successRate: number;
  }>;
  title?: string;
}

export function CustomsPerformanceChart({
  data,
  title = 'Customs Clearance Performance',
}: CustomsPerformanceChartProps) {
  const chartData = data.map(item => ({
    name: item.locationName.length > 15 
      ? item.locationName.substring(0, 15) + '...' 
      : item.locationName,
    fullName: item.locationName,
    clearanceTime: item.averageClearanceTime,
    vehicles: item.totalVehicles,
    successRate: item.successRate,
  }));

  const getColor = (successRate: number) => {
    if (successRate >= 80) return 'hsl(var(--chart-2))'; // green
    if (successRate >= 60) return 'hsl(var(--chart-3))'; // yellow
    return 'hsl(var(--chart-5))'; // red
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            clearanceTime: {
              label: 'Avg Clearance Time (days)',
              color: 'hsl(var(--chart-1))',
            },
            successRate: {
              label: 'Success Rate (%)',
              color: 'hsl(var(--chart-2))',
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <ChartTooltipContent>
                        <div className="flex flex-col gap-1">
                          <div className="font-medium">{data.fullName}</div>
                          <div className="text-sm">
                            Clearance Time: <span className="font-bold">{data.clearanceTime} days</span>
                          </div>
                          <div className="text-sm">
                            Success Rate: <span className="font-bold">{data.successRate}%</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Total Vehicles: {data.vehicles}
                          </div>
                        </div>
                      </ChartTooltipContent>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                yAxisId="left"
                dataKey="clearanceTime" 
                fill="hsl(var(--chart-1))" 
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.successRate)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
