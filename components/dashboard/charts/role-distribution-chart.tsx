'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface RoleDistributionChartProps {
  data: Record<string, number>;
  title?: string;
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: '#8b5cf6',
  CEO: '#f59e0b',
  NORMAL: '#3b82f6',
};

export function RoleDistributionChart({
  data,
  title = 'User Role Distribution',
}: RoleDistributionChartProps) {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);
  
  const chartData = Object.entries(data).map(([role, count]) => ({
    name: role,
    value: count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  }));

  const chartColors = chartData.map(item => 
    ROLE_COLORS[item.name] || 'hsl(var(--chart-1))'
  );

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
