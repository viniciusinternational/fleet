'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ColorDistributionChartProps {
  data: Array<{ color: string; count: number; percentage: number }>;
  title?: string;
}

export function ColorDistributionChart({
  data,
  title = 'Color Distribution',
}: ColorDistributionChartProps) {
  const chartData = data.map(item => ({
    name: item.color,
    value: item.count,
    percentage: item.percentage,
  }));

  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  const getColor = (index: number) => COLORS[index % COLORS.length];

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
                  <Cell key={`cell-${index}`} fill={getColor(index)} />
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
