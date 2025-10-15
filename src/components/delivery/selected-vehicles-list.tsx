'use client';

import React from 'react';
import { X, Car, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { Vehicle } from '@/types';

interface SelectedVehiclesListProps {
  vehicles: Vehicle[];
  onRemove: (vehicleId: string) => void;
}

export function SelectedVehiclesList({
  vehicles,
  onRemove,
}: SelectedVehiclesListProps) {
  if (vehicles.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">
          No vehicles selected for delivery
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Select vehicles from the table below to add them to the delivery note
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Car className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Selected Vehicles</h3>
          <Badge variant="secondary">{vehicles.length}</Badge>
        </div>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {vehicles.map((vehicle) => (
          <Card
            key={vehicle.id}
            className="p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-foreground">
                    {vehicle.make} {vehicle.model}
                  </h4>
                  <Badge variant="outline">{vehicle.year}</Badge>
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
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">VIN:</span> {vehicle.vin}
                  </div>
                  <div>
                    <span className="font-medium">Color:</span> {vehicle.color}
                  </div>
                  {vehicle.trim && (
                    <div>
                      <span className="font-medium">Trim:</span> {vehicle.trim}
                    </div>
                  )}
                  {vehicle.engineType && (
                    <div>
                      <span className="font-medium">Engine:</span>{' '}
                      {vehicle.engineType}
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(vehicle.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

