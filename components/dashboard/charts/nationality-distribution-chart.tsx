'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface NationalityDistributionChartProps {
  data: Array<{
    nationality: string;
    count: number;
    percentage?: number;
  }>;
  title?: string;
  maxItems?: number;
}

export function NationalityDistributionChart({
  data,
  title = 'Nationality Distribution',
  maxItems = 10,
}: NationalityDistributionChartProps) {
  const chartData = data
    .slice(0, maxItems)
    .map(item => ({
      nationality: item.nationality,
      count: item.count,
      percentage: item.percentage || 0,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: {
              label: 'Count',
              color: 'hsl(var(--chart-2))',
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="nationality" 
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <ChartTooltipContent>
                        <div className="flex flex-col gap-1">
                          <div className="font-medium">{data.nationality}</div>
                          <div className="text-sm">
                            Count: <span className="font-bold">{data.count}</span>
                          </div>
                          {data.percentage > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {data.percentage}% of total
                            </div>
                          )}
                        </div>
                      </ChartTooltipContent>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
