'use client';

import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Vehicle, VehicleStatus } from '@/types';

interface VehicleSelectionTableProps {
  vehicles: Vehicle[];
  selectedVehicleIds: Set<string>;
  onToggleVehicle: (vehicleId: string) => void;
  onToggleAll: (select: boolean) => void;
}

export function VehicleSelectionTable({
  vehicles,
  selectedVehicleIds,
  onToggleVehicle,
  onToggleAll,
}: VehicleSelectionTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter and search vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      // Status filter
      if (statusFilter !== 'all' && vehicle.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          vehicle.vin.toLowerCase().includes(query) ||
          vehicle.make.toLowerCase().includes(query) ||
          vehicle.model.toLowerCase().includes(query) ||
          vehicle.color.toLowerCase().includes(query) ||
          vehicle.owner.name.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [vehicles, searchQuery, statusFilter]);

  const allFilteredSelected =
    filteredVehicles.length > 0 &&
    filteredVehicles.every((v) => selectedVehicleIds.has(v.id));

  const someFilteredSelected =
    filteredVehicles.some((v) => selectedVehicleIds.has(v.id)) &&
    !allFilteredSelected;

  const handleToggleAll = () => {
    if (allFilteredSelected) {
      // Deselect all filtered
      onToggleAll(false);
    } else {
      // Select all filtered
      onToggleAll(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by VIN, make, model, color, or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Ordered">Ordered</SelectItem>
              <SelectItem value="In Transit">In Transit</SelectItem>
              <SelectItem value="Clearing Customs">Clearing Customs</SelectItem>
              <SelectItem value="At Port">At Port</SelectItem>
              <SelectItem value="In Local Delivery">In Local Delivery</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredVehicles.length} of {vehicles.length} vehicles
        </span>
        {selectedVehicleIds.size > 0 && (
          <span className="text-primary font-medium">
            {selectedVehicleIds.size} selected
          </span>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allFilteredSelected}
                  onCheckedChange={handleToggleAll}
                  aria-label="Select all"
                  className={someFilteredSelected ? 'data-[state=checked]:bg-primary/50' : ''}
                />
              </TableHead>
              <TableHead>VIN</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Owner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No vehicles found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredVehicles.map((vehicle) => (
                <TableRow
                  key={vehicle.id}
                  className={
                    selectedVehicleIds.has(vehicle.id)
                      ? 'bg-muted/50'
                      : 'hover:bg-muted/30'
                  }
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedVehicleIds.has(vehicle.id)}
                      onCheckedChange={() => onToggleVehicle(vehicle.id)}
                      aria-label={`Select ${vehicle.make} ${vehicle.model}`}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {vehicle.vin}
                  </TableCell>
                  <TableCell className="font-medium">
                    {vehicle.make} {vehicle.model}
                  </TableCell>
                  <TableCell>{vehicle.year}</TableCell>
                  <TableCell>{vehicle.color}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        vehicle.status === 'Delivered'
                          ? 'default'
                          : vehicle.status === 'In Transit'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {vehicle.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {vehicle.owner.name}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

