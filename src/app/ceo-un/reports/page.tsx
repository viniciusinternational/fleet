'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Download, BarChart3 } from 'lucide-react';

const CustomReports: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Custom Reports</h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Generate and view custom business reports
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/ceo/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Main Reports Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Report Generator</h2>
                <p className="text-muted-foreground">Create custom reports for business intelligence</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Report Types */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Available Report Types</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950/50 dark:hover:border-blue-700"
                >
                  <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <div className="text-center">
                    <div className="font-semibold">Financial Reports</div>
                    <div className="text-sm text-muted-foreground">Revenue, costs, and profit analysis</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-950/50 dark:hover:border-green-700"
                >
                  <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <div className="text-center">
                    <div className="font-semibold">Operational Reports</div>
                    <div className="text-sm text-muted-foreground">Delivery times and performance metrics</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-950/50 dark:hover:border-purple-700"
                >
                  <Download className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <div className="text-center">
                    <div className="font-semibold">Custom Reports</div>
                    <div className="text-sm text-muted-foreground">Build your own report templates</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Coming Soon Message */}
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Advanced Reporting Coming Soon</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                We're working on comprehensive reporting features including custom dashboards, 
                automated report generation, and advanced analytics.
              </p>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Current Data
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  View Sample Reports
                </Button>
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomReports;
