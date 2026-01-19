'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AuditLogFilters = {
  entityType?: string;
  action?: string;
  actorId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
};

interface AuditLogFiltersProps {
  filters: AuditLogFilters;
  onFiltersChange: (filters: AuditLogFilters) => void;
  onReset: () => void;
}

const entityTypes = [
  'User', 
  'Vehicle', 
  'Owner', 
  'Location', 
  'Source', 
  'DeliveryNote',
  'ShippingDetails',
  'VehicleDocument',
  'TrackingEvent',
  'VehicleImage',
  'VehicleMake',
  'VehicleModel',
  'VehicleColor',
  'TransmissionType',
  'EngineType'
];
const actions = [
  'CREATE', 
  'UPDATE', 
  'DELETE',
  'LOGIN',
  'USER_CREATED',
  'PERMISSION_CHANGE',
  'STATUS_CHANGE'
];

export function AuditLogFiltersComponent({
  filters,
  onFiltersChange,
  onReset,
}: AuditLogFiltersProps) {
  const updateFilter = (key: keyof AuditLogFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilter = (key: keyof AuditLogFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Entity Type Filter */}
          <div className="space-y-2">
            <Label>Entity Type</Label>
            <Select
              value={filters.entityType || 'all'}
              onValueChange={(value) =>
                updateFilter('entityType', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {entityTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Filter */}
          <div className="space-y-2">
            <Label>Action</Label>
            <Select
              value={filters.action || 'all'}
              onValueChange={(value) =>
                updateFilter('action', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="LOGIN">User Login</SelectItem>
                <SelectItem value="USER_CREATED">User Created</SelectItem>
                <SelectItem value="PERMISSION_CHANGE">Permission Change</SelectItem>
                <SelectItem value="STATUS_CHANGE">Status Change</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <Label>Search</Label>
            <Input
              placeholder="Search..."
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value || undefined)}
            />
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !filters.startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate ? (
                    filters.startDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.startDate}
                  onSelect={(date) => updateFilter('startDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {filters.startDate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter('startDate')}
                className="h-6 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !filters.endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate ? (
                    filters.endDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.endDate}
                  onSelect={(date) => updateFilter('endDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {filters.endDate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter('endDate')}
                className="h-6 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex justify-end">
            <Button variant="outline" onClick={onReset}>
              Reset Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
