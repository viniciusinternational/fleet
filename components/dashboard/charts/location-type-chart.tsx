'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface LocationTypeChartProps {
  data: Array<{
    type: string;
    operational: number;
    temporarilyClosed: number;
    underMaintenance: number;
  }>;
  title?: string;
}

export function LocationTypeChart({
  data,
  title = 'Locations by Type and Status',
}: LocationTypeChartProps) {
  const chartData = data.map(item => ({
    type: item.type.replace(/_/g, ' '),
    Operational: item.operational,
    'Temporarily Closed': item.temporarilyClosed,
    'Under Maintenance': item.underMaintenance,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            Operational: {
              label: 'Operational',
              color: 'hsl(var(--chart-2))',
            },
            'Temporarily Closed': {
              label: 'Temporarily Closed',
              color: 'hsl(var(--chart-3))',
            },
            'Under Maintenance': {
              label: 'Under Maintenance',
              color: 'hsl(var(--chart-5))',
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="type" 
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <ChartTooltipContent>
                        <div className="flex flex-col gap-1">
                          <div className="font-medium">{payload[0].payload.type}</div>
                          {payload.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-sm">
                                {entry.name}: <span className="font-bold">{entry.value}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </ChartTooltipContent>
                    );
                  }
                  return null;
                }}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="Operational" stackId="a" fill="hsl(var(--chart-2))" />
              <Bar dataKey="Temporarily Closed" stackId="a" fill="hsl(var(--chart-3))" />
              <Bar dataKey="Under Maintenance" stackId="a" fill="hsl(var(--chart-5))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
