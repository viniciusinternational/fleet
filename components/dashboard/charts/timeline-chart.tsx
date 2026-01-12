'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface TimelineChartProps {
  data: Array<{
    month: string;
    orders: number;
    deliveries: number;
    revenue?: number;
    importDuties?: number;
  }>;
  title?: string;
  showRevenue?: boolean;
}

export function TimelineChart({
  data,
  title = 'Monthly Trends',
  showRevenue = false,
}: TimelineChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            orders: {
              label: 'Orders',
              color: 'hsl(var(--chart-1))',
            },
            deliveries: {
              label: 'Deliveries',
              color: 'hsl(var(--chart-2))',
            },
            ...(showRevenue && {
              revenue: {
                label: 'Revenue',
                color: 'hsl(var(--chart-3))',
              },
              importDuties: {
                label: 'Import Duties',
                color: 'hsl(var(--chart-4))',
              },
            }),
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <ChartTooltipContent>
                        <div className="flex flex-col gap-1">
                          {payload.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-sm">
                                {entry.name}: <span className="font-bold">{entry.value?.toLocaleString()}</span>
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
              <Line
                type="monotone"
                dataKey="orders"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="deliveries"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              {showRevenue && (
                <>
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="importDuties"
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
