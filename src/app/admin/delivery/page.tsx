'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { VehicleSelectionTable } from '@/components/delivery/vehicle-selection-table';
import { SelectedVehiclesList } from '@/components/delivery/selected-vehicles-list';
import { OwnerSelector } from '@/components/delivery/owner-selector';
import { generateDeliveryNotePDF } from '@/lib/services/pdf-generator';
import type { Vehicle, Owner, DeliveryNote } from '@/types';

export default function DeliveryPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<Set<string>>(new Set());
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch vehicles and owners
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Fetch vehicles - get all vehicles for selection (no pagination)
        const vehiclesResponse = await fetch('/api/vehicles?limit=1000');
        if (vehiclesResponse.ok) {
          const vehiclesResult = await vehiclesResponse.json();
          if (vehiclesResult.success && vehiclesResult.data) {
            // Handle both response formats
            const vehiclesList = vehiclesResult.data.vehicles || vehiclesResult.data;
            setVehicles(vehiclesList);
          }
        }

        // Fetch owners - get all owners for selection (no pagination)
        const ownersResponse = await fetch('/api/owners?limit=1000');
        if (ownersResponse.ok) {
          const ownersResult = await ownersResponse.json();
          if (ownersResult.success && ownersResult.data) {
            // Handle response format
            const ownersList = ownersResult.data.owners || ownersResult.data;
            setOwners(ownersList);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Toggle vehicle selection
  const handleToggleVehicle = (vehicleId: string) => {
    const newSelection = new Set(selectedVehicleIds);
    if (newSelection.has(vehicleId)) {
      newSelection.delete(vehicleId);
    } else {
      newSelection.add(vehicleId);
    }
    setSelectedVehicleIds(newSelection);
  };

  // Toggle all vehicles
  const handleToggleAll = (select: boolean) => {
    if (select) {
      const allIds = new Set(vehicles.map((v) => v.id));
      setSelectedVehicleIds(allIds);
    } else {
      setSelectedVehicleIds(new Set());
    }
  };

  // Remove vehicle from selection
  const handleRemoveVehicle = (vehicleId: string) => {
    const newSelection = new Set(selectedVehicleIds);
    newSelection.delete(vehicleId);
    setSelectedVehicleIds(newSelection);
  };

  // Get selected vehicles
  const selectedVehicles = vehicles.filter((v) =>
    selectedVehicleIds.has(v.id)
  );

  // Generate PDF
  const handleGeneratePDF = () => {
    if (!selectedOwner || selectedVehicles.length === 0) {
      return;
    }

    setIsGenerating(true);

    try {
      const deliveryNote: DeliveryNote = {
        vehicles: selectedVehicles.map((v) => ({
          id: v.id,
          vin: v.vin,
          make: v.make,
          model: v.model,
          year: v.year,
          color: v.color,
          status: v.status,
          trim: v.trim,
          engineType: v.engineType,
        })),
        owner: selectedOwner,
        deliveryDate: new Date(deliveryDate),
        generatedAt: new Date(),
      };

      generateDeliveryNotePDF(deliveryNote);

      // Reset form after successful generation
      setTimeout(() => {
        setSelectedVehicleIds(new Set());
        setSelectedOwner(null);
        setDeliveryDate(new Date().toISOString().split('T')[0]);
      }, 1000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate delivery note. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const canGeneratePDF = selectedOwner && selectedVehicles.length > 0;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            Delivery Note Generator
          </h1>
          <p className="text-muted-foreground mt-2">
            Select vehicles and owner to generate a professional delivery note
          </p>
        </div>
      </div>

      <Separator />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Selected Vehicles & Owner Selection */}
        <div className="lg:col-span-1 space-y-6">
          {/* Selected Vehicles Card */}
          <Card>
            <CardHeader>
              <CardTitle>Selected Vehicles</CardTitle>
              <CardDescription>
                Vehicles to include in the delivery note
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SelectedVehiclesList
                vehicles={selectedVehicles}
                onRemove={handleRemoveVehicle}
              />
            </CardContent>
          </Card>

          {/* Owner & Delivery Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
              <CardDescription>
                Select owner and delivery date
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Owner Selector */}
              <OwnerSelector
                owners={owners}
                selectedOwner={selectedOwner}
                onSelectOwner={setSelectedOwner}
              />

              {/* Delivery Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Delivery Date
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <Separator />

              {/* Validation Messages */}
              {!canGeneratePDF && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {!selectedOwner && selectedVehicles.length === 0
                      ? 'Please select at least one vehicle and an owner'
                      : !selectedOwner
                      ? 'Please select an owner'
                      : 'Please select at least one vehicle'}
                  </AlertDescription>
                </Alert>
              )}

              {/* Generate Button */}
              <Button
                onClick={handleGeneratePDF}
                disabled={!canGeneratePDF || isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full mr-2"></div>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Delivery Note
                  </>
                )}
              </Button>

              {canGeneratePDF && (
                <p className="text-xs text-muted-foreground text-center">
                  PDF will be downloaded automatically
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Vehicle Selection Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Available Vehicles</CardTitle>
              <CardDescription>
                Search and select vehicles to add to the delivery note
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VehicleSelectionTable
                vehicles={vehicles}
                selectedVehicleIds={selectedVehicleIds}
                onToggleVehicle={handleToggleVehicle}
                onToggleAll={handleToggleAll}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

