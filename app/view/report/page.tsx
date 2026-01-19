'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { FileText, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { decodeReportToken } from '@/lib/utils/report-token';

export default function PublicReportViewPage() {
  const searchParams = useSearchParams();
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportType, setReportType] = useState<string>('');
  const [reportTitle, setReportTitle] = useState<string>('');

  useEffect(() => {
    async function fetchReport() {
      try {
        setIsLoading(true);
        const token = searchParams.get('token');

        if (!token) {
          throw new Error('Report token is required');
        }

        // Decode token
        const tokenData = decodeReportToken(token);
        if (!tokenData) {
          throw new Error('Invalid or expired report token');
        }

        setReportType(tokenData.reportType);

        // Determine report title
        const titles: Record<string, string> = {
          'inventory': 'VEHICLE INVENTORY REPORT',
          'status-summary': 'VEHICLE STATUS SUMMARY REPORT',
          'location-based': 'VEHICLE LOCATION-BASED REPORT',
        };
        setReportTitle(titles[tokenData.reportType] || 'VEHICLE REPORT');

        // Fetch report data from API
        const response = await fetch('/api/reports/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reportType: tokenData.reportType,
            filters: tokenData.filters,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to generate report' }));
          throw new Error(errorData.error || 'Failed to generate report');
        }

        // For reports, we need to fetch the actual data
        // The API returns PDF, so we need to get the data separately
        // Let's use the ReportService logic - we'll need to create an API endpoint for this
        const dataResponse = await fetch('/api/reports/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reportType: tokenData.reportType,
            filters: tokenData.filters,
          }),
        });

        if (!dataResponse.ok) {
          // Fallback: try to generate report from filters
          throw new Error('Failed to fetch report data');
        }

        const data = await dataResponse.json();
        setReportData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load report');
      } finally {
        setIsLoading(false);
      }
    }

    fetchReport();
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Report not found or expired'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Print Header */}
      <div className="hidden print:block print:mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-32 h-12 relative">
              <Image
                src="/logo/vinicius-logo.png"
                alt="Vinicius International"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Vinicius International</h1>
              <p className="text-sm text-gray-600">13B Shettima Mongonu Crescent, Utako, Abuja, Nigeria</p>
              <p className="text-sm text-gray-600">info@viniciusint.com</p>
            </div>
          </div>
        </div>
        <div className="border-b-2 border-red-600 mb-6"></div>
      </div>

      <div className="container mx-auto p-6 max-w-6xl">
        {/* Action Bar */}
        <div className="mb-6 flex items-center justify-between print:hidden">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            {reportTitle}
          </h1>
          <Button onClick={handlePrint} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Print / Save PDF
          </Button>
        </div>

        {/* Document Title */}
        <div className="text-center mb-8 print:mb-6">
          <h2 className="text-3xl font-bold text-red-600 mb-2 print:text-2xl">
            {reportTitle}
          </h2>
          <div className="w-32 h-0.5 bg-red-600 mx-auto"></div>
        </div>

        {/* Summary Info */}
        <div className="mb-6 print:mb-4">
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="font-semibold text-gray-900">Total Vehicles: </span>
              <span className="text-gray-700">{reportData.totalCount || 0}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">Filtered Count: </span>
              <span className="text-gray-700">{reportData.filteredCount || reportData.totalCount || 0}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">Generated: </span>
              <span className="text-gray-700">{formatDate(new Date())}</span>
            </div>
          </div>
        </div>

        {/* Report Content */}
        {reportType === 'inventory' && reportData.vehicles && (
          <Card className="print:border print:shadow-none">
            <CardHeader>
              <CardTitle>Vehicle Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-600 hover:bg-slate-600">
                      <TableHead className="text-white font-bold">VIN</TableHead>
                      <TableHead className="text-white font-bold">Make</TableHead>
                      <TableHead className="text-white font-bold">Model</TableHead>
                      <TableHead className="text-white font-bold text-center">Year</TableHead>
                      <TableHead className="text-white font-bold">Color</TableHead>
                      <TableHead className="text-white font-bold">Status</TableHead>
                      <TableHead className="text-white font-bold">Location</TableHead>
                      <TableHead className="text-white font-bold">Owner</TableHead>
                      <TableHead className="text-white font-bold">Fuel Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.vehicles.map((vehicle: any, index: number) => (
                      <TableRow 
                        key={vehicle.id || index}
                        className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                      >
                        <TableCell className="font-mono text-xs">{vehicle.vin}</TableCell>
                        <TableCell>{vehicle.make}</TableCell>
                        <TableCell>{vehicle.model}</TableCell>
                        <TableCell className="text-center">{vehicle.year}</TableCell>
                        <TableCell>{vehicle.color}</TableCell>
                        <TableCell>{formatStatus(vehicle.status)}</TableCell>
                        <TableCell>{vehicle.currentLocation?.name || 'N/A'}</TableCell>
                        <TableCell>{vehicle.owner?.name || 'N/A'}</TableCell>
                        <TableCell>{vehicle.fuelType || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {reportType === 'status-summary' && reportData.summary && (
          <>
            <Card className="mb-6 print:border print:shadow-none">
              <CardHeader>
                <CardTitle>Status Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-600 hover:bg-slate-600">
                        <TableHead className="text-white font-bold">Status</TableHead>
                        <TableHead className="text-white font-bold text-center">Count</TableHead>
                        <TableHead className="text-white font-bold text-center">Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.summary.map((item: any, index: number) => (
                        <TableRow 
                          key={item.status}
                          className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                        >
                          <TableCell className="font-semibold">{formatStatus(item.status)}</TableCell>
                          <TableCell className="text-center">{item.count}</TableCell>
                          <TableCell className="text-center">{item.percentage}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Detailed breakdown by status */}
            {reportData.vehiclesByStatus && Object.entries(reportData.vehiclesByStatus).map(([status, vehicles]: [string, any]) => (
              <Card key={status} className="mb-6 print:border print:shadow-none">
                <CardHeader>
                  <CardTitle>{formatStatus(status)} ({vehicles.length} vehicles)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-600 hover:bg-slate-600">
                          <TableHead className="text-white font-bold">VIN</TableHead>
                          <TableHead className="text-white font-bold">Make</TableHead>
                          <TableHead className="text-white font-bold">Model</TableHead>
                          <TableHead className="text-white font-bold text-center">Year</TableHead>
                          <TableHead className="text-white font-bold">Color</TableHead>
                          <TableHead className="text-white font-bold">Location</TableHead>
                          <TableHead className="text-white font-bold">Owner</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vehicles.map((vehicle: any, index: number) => (
                          <TableRow 
                            key={vehicle.id || index}
                            className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                          >
                            <TableCell className="font-mono text-xs">{vehicle.vin}</TableCell>
                            <TableCell>{vehicle.make}</TableCell>
                            <TableCell>{vehicle.model}</TableCell>
                            <TableCell className="text-center">{vehicle.year}</TableCell>
                            <TableCell>{vehicle.color}</TableCell>
                            <TableCell>{vehicle.currentLocation?.name || 'N/A'}</TableCell>
                            <TableCell>{vehicle.owner?.name || 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}

        {reportType === 'location-based' && reportData.locationSummary && (
          <>
            <Card className="mb-6 print:border print:shadow-none">
              <CardHeader>
                <CardTitle>Location Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-600 hover:bg-slate-600">
                        <TableHead className="text-white font-bold">Location</TableHead>
                        <TableHead className="text-white font-bold">Type</TableHead>
                        <TableHead className="text-white font-bold text-center">Vehicle Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.locationSummary.map((item: any, index: number) => (
                        <TableRow 
                          key={item.locationId}
                          className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                        >
                          <TableCell className="font-semibold">{item.locationName}</TableCell>
                          <TableCell>{item.locationType}</TableCell>
                          <TableCell className="text-center">{item.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Detailed breakdown by location */}
            {reportData.vehiclesByLocation && Object.entries(reportData.vehiclesByLocation).map(([locationId, vehicles]: [string, any]) => {
              const locationInfo = reportData.locationSummary.find((loc: any) => loc.locationId === locationId);
              return (
                <Card key={locationId} className="mb-6 print:border print:shadow-none">
                  <CardHeader>
                    <CardTitle>{locationInfo?.locationName || 'Unknown Location'} ({vehicles.length} vehicles)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-600 hover:bg-slate-600">
                            <TableHead className="text-white font-bold">VIN</TableHead>
                            <TableHead className="text-white font-bold">Make</TableHead>
                            <TableHead className="text-white font-bold">Model</TableHead>
                            <TableHead className="text-white font-bold text-center">Year</TableHead>
                            <TableHead className="text-white font-bold">Color</TableHead>
                            <TableHead className="text-white font-bold">Status</TableHead>
                            <TableHead className="text-white font-bold">Owner</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {vehicles.map((vehicle: any, index: number) => (
                            <TableRow 
                              key={vehicle.id || index}
                              className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                            >
                              <TableCell className="font-mono text-xs">{vehicle.vin}</TableCell>
                              <TableCell>{vehicle.make}</TableCell>
                              <TableCell>{vehicle.model}</TableCell>
                              <TableCell className="text-center">{vehicle.year}</TableCell>
                              <TableCell>{vehicle.color}</TableCell>
                              <TableCell>{formatStatus(vehicle.status)}</TableCell>
                              <TableCell>{vehicle.owner?.name || 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </>
        )}
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:mb-4 {
            margin-bottom: 1rem !important;
          }
          .print\\:mb-6 {
            margin-bottom: 1.5rem !important;
          }
          .print\\:mb-8 {
            margin-bottom: 2rem !important;
          }
          .print\\:border {
            border: 1px solid #e5e7eb !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:text-2xl {
            font-size: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}