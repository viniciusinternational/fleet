'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VehicleStatus } from '@/types';
import { Loader2, FileText, Download } from 'lucide-react';

export type ReportType = 'inventory' | 'status-summary' | 'location-based';

export interface ReportFilters {
  status?: string;
  locationId?: string;
  fuelType?: string;
  make?: string;
  model?: string;
}

interface ReportConfigProps {
  onGenerate: (reportType: ReportType, filters: ReportFilters) => void;
  loading?: boolean;
}

interface Location {
  id: string;
  name: string;
  type: string;
}

const FUEL_TYPES = [
  { value: 'all', label: 'All Fuel Types' },
  { value: 'GASOLINE', label: 'Gasoline' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'ELECTRIC', label: 'Electric' },
  { value: 'HYBRID', label: 'Hybrid' },
];

const VEHICLE_STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'ORDERED', label: 'Ordered' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'CLEARING_CUSTOMS', label: 'Clearing Customs' },
  { value: 'AT_PORT', label: 'At Port' },
  { value: 'IN_LOCAL_DELIVERY', label: 'In Local Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
];

const REPORT_TYPES = [
  {
    value: 'inventory' as ReportType,
    label: 'Inventory List',
    description: 'Complete list of vehicles with details',
  },
  {
    value: 'status-summary' as ReportType,
    label: 'Status Summary',
    description: 'Vehicles grouped by status with counts',
  },
  {
    value: 'location-based' as ReportType,
    label: 'Location-Based',
    description: 'Vehicles grouped by location',
  },
];

export function ReportConfig({ onGenerate, loading = false }: ReportConfigProps) {
  const [reportType, setReportType] = useState<ReportType>('inventory');
  const [filters, setFilters] = useState<ReportFilters>({
    status: 'all',
    locationId: 'all',
    fuelType: 'all',
    make: '',
    model: '',
  });
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);

  // Fetch locations on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      setLocationsLoading(true);
      try {
        const response = await fetch('/api/locations?limit=1000');
        const data = await response.json();
        if (data.locations) {
          setLocations(data.locations);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setLocationsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === 'all' || value === '' ? undefined : value,
    }));
  };

  const handleGenerate = () => {
    // Convert empty strings to undefined
    const cleanedFilters: ReportFilters = {
      status: filters.status === 'all' ? undefined : filters.status,
      locationId: filters.locationId === 'all' ? undefined : filters.locationId,
      fuelType: filters.fuelType === 'all' ? undefined : filters.fuelType,
      make: filters.make || undefined,
      model: filters.model || undefined,
    };

    onGenerate(reportType, cleanedFilters);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Report Configuration
        </CardTitle>
        <CardDescription>
          Select a report type and customize filters to generate your vehicle report
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Type Selection */}
        <div className="space-y-2">
          <Label>Report Type</Label>
          <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              {REPORT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs text-muted-foreground">{type.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filters Section */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Filters</Label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status-filter">Vehicle Status</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <Label htmlFor="location-filter">Location</Label>
              <Select
                value={filters.locationId || 'all'}
                onValueChange={(value) => handleFilterChange('locationId', value)}
                disabled={locationsLoading}
              >
                <SelectTrigger id="location-filter">
                  <SelectValue placeholder={locationsLoading ? 'Loading...' : 'Select location'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name} - {location.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fuel Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="fuel-type-filter">Fuel Type</Label>
              <Select
                value={filters.fuelType || 'all'}
                onValueChange={(value) => handleFilterChange('fuelType', value)}
              >
                <SelectTrigger id="fuel-type-filter">
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  {FUEL_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Make Filter */}
            <div className="space-y-2">
              <Label htmlFor="make-filter">Make</Label>
              <Input
                id="make-filter"
                placeholder="e.g., Toyota, Honda"
                value={filters.make || ''}
                onChange={(e) => handleFilterChange('make', e.target.value)}
              />
            </div>

            {/* Model Filter */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="model-filter">Model</Label>
              <Input
                id="model-filter"
                placeholder="e.g., Camry, Accord"
                value={filters.model || ''}
                onChange={(e) => handleFilterChange('model', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Generate Report
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
