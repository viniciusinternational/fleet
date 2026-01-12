'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface TransmissionDistributionChartProps {
  data: Array<{ transmission: string; count: number; percentage: number }>;
  title?: string;
}

const TRANSMISSION_COLORS: Record<string, string> = {
  MANUAL: '#3b82f6',
  AUTOMATIC: '#6366f1',
  CVT: '#10b981',
  DUAL_CLUTCH: '#f59e0b',
  SEMI_AUTOMATIC: '#ef4444',
};

export function TransmissionDistributionChart({
  data,
  title = 'Transmission Distribution',
}: TransmissionDistributionChartProps) {
  const chartData = data.map(item => ({
    name: item.transmission.replace(/_/g, ' '),
    value: item.count,
    percentage: item.percentage,
  }));

  const chartColors = chartData.map(item => {
    const typeKey = item.name.toUpperCase().replace(/\s/g, '_');
    return TRANSMISSION_COLORS[typeKey] || 'hsl(var(--chart-1))';
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
