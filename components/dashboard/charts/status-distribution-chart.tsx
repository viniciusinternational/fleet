'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

interface StatusDistributionChartProps {
  data: Array<{ status: string; count: number; percentage: number }>;
  title?: string;
  colors?: string[];
}

const DEFAULT_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const STATUS_COLORS: Record<string, string> = {
  ORDERED: '#94a3b8',
  IN_TRANSIT: '#3b82f6',
  CLEARING_CUSTOMS: '#f59e0b',
  AT_PORT: '#eab308',
  IN_LOCAL_DELIVERY: '#a855f7',
  DELIVERED: '#10b981',
};

export function StatusDistributionChart({
  data,
  title = 'Status Distribution',
  colors,
}: StatusDistributionChartProps) {
  const chartData = data.map(item => ({
    name: item.status.replace(/_/g, ' '),
    value: item.count,
    percentage: item.percentage,
  }));

  const chartColors = colors || chartData.map(item => {
    const statusKey = item.name.toUpperCase().replace(/\s/g, '_');
    return STATUS_COLORS[statusKey] || DEFAULT_COLORS[chartData.indexOf(item) % DEFAULT_COLORS.length];
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            value: {
              label: 'Count',
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index]} />
                ))}
              </Pie>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0];
                    return (
                      <ChartTooltipContent>
                        <div className="flex flex-col gap-1">
                          <div className="font-medium">{data.name}</div>
                          <div className="text-sm">
                            Count: <span className="font-bold">{data.value}</span>
                          </div>
                          {data.payload?.percentage !== undefined && (
                            <div className="text-xs text-muted-foreground">
                              {data.payload.percentage}% of total
                            </div>
                          )}
                        </div>
                      </ChartTooltipContent>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
