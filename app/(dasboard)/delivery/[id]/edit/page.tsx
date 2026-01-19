'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, AlertCircle, Save, X, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { VehicleSelectionTable } from '@/components/delivery/vehicle-selection-table';
import { SelectedVehiclesList } from '@/components/delivery/selected-vehicles-list';
import { OwnerSelector } from '@/components/delivery/owner-selector';
import { generateDeliveryNotePDF } from '@/lib/services/pdf-generator';
import { useRouter } from 'next/navigation';
import type { Vehicle, Owner, DeliveryNote } from '@/types';

interface EditDeliveryNotePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditDeliveryNotePage({ params }: EditDeliveryNotePageProps) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<Set<string>>(new Set());
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const { id } = await params;
        
        // Fetch delivery note
        const noteResponse = await fetch(`/api/delivery-notes/${id}`);
        const noteResult = await noteResponse.json();

        if (!noteResult.success) {
          setError(noteResult.error || 'Failed to fetch delivery note');
          return;
        }

        const deliveryNote = noteResult.data;

        // Set form data
        setSelectedOwner(deliveryNote.owner);
        setDeliveryDate(new Date(deliveryNote.deliveryDate).toISOString().split('T')[0]);
        setNotes(deliveryNote.notes || '');
        setSelectedVehicleIds(new Set(deliveryNote.vehicleIds));

        // Fetch all vehicles and owners for selection
        const [vehiclesResponse, ownersResponse] = await Promise.all([
          fetch('/api/vehicles?limit=1000'),
          fetch('/api/owners?limit=1000'),
        ]);

        if (vehiclesResponse.ok) {
          const vehiclesResult = await vehiclesResponse.json();
          if (vehiclesResult.success && vehiclesResult.data) {
            const vehiclesList = vehiclesResult.data.vehicles || vehiclesResult.data;
            setVehicles(vehiclesList);
          }
        }

        if (ownersResponse.ok) {
          const ownersResult = await ownersResponse.json();
          if (ownersResult.success && ownersResult.data) {
            const ownersList = ownersResult.data.owners || ownersResult.data;
            setOwners(ownersList);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load delivery note data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [params]);

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

  // Save delivery note
  const handleSave = async () => {
    if (!selectedOwner || selectedVehicles.length === 0) {
      return;
    }

    setIsSaving(true);

    try {
      const { id } = await params;
      const response = await fetch(`/api/delivery-notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerId: selectedOwner.id,
          deliveryDate: deliveryDate,
          notes: notes || null,
          vehicleIds: Array.from(selectedVehicleIds),
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Navigate to view page
        const { id } = await params;
        router.push(`/admin/delivery/${id}`);
      } else {
        alert(`Failed to update delivery note: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating delivery note:', error);
      alert('Failed to update delivery note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Generate PDF and save
  const handleGenerateAndSave = async () => {
    if (!selectedOwner || selectedVehicles.length === 0) {
      return;
    }

    setIsGenerating(true);

    try {
      const { id } = await params;
      // First save to database
      const saveResponse = await fetch(`/api/delivery-notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerId: selectedOwner.id,
          deliveryDate: deliveryDate,
          notes: notes || null,
          vehicleIds: Array.from(selectedVehicleIds),
        }),
      });

      const saveResult = await saveResponse.json();

      if (saveResult.success) {
        // Generate PDF
        const deliveryNote: DeliveryNote = {
          id: id,
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
          notes: notes || undefined,
        };

        await generateDeliveryNotePDF(deliveryNote);

        // Navigate to view page
        router.push(`/admin/delivery/${id}`);
      } else {
        alert(`Failed to update delivery note: ${saveResult.error}`);
      }
    } catch (error) {
      console.error('Error generating and saving delivery note:', error);
      alert('Failed to generate and save delivery note. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Cancel and go back to view
  const handleCancel = async () => {
    const { id } = await params;
    router.push(`/admin/delivery/${id}`);
  };

  const canSave = selectedOwner && selectedVehicles.length > 0;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading delivery note...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to View
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              Edit Delivery Note
            </h1>
            <p className="text-muted-foreground mt-2">
              Update delivery note details
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch" style={{ height: 'calc(100vh - 250px)' }}>
        {/* Left Column - Selected Vehicles & Owner Selection */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Selected Vehicles Card - 30% */}
          <Card className="flex-[0.3] flex flex-col">
            <CardHeader>
              <CardTitle>Selected Vehicles</CardTitle>
              <CardDescription>
                Vehicles to include in the delivery note
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden min-h-0">
              <SelectedVehiclesList
                vehicles={selectedVehicles}
                onRemove={handleRemoveVehicle}
              />
            </CardContent>
          </Card>

          {/* Owner & Delivery Info Card - 70% */}
          <Card className="flex-[0.7] flex flex-col">
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
              <CardDescription>
                Select owner and delivery details
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto space-y-4">
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

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Notes
                </label>
                <Textarea
                  placeholder="Add any additional notes for this delivery..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <Separator />

              {/* Validation Messages */}
              {!canSave && (
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

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleGenerateAndSave}
                  disabled={!canSave || isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full mr-2"></div>
                      Generating & Saving...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generate & Save
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleSave}
                  disabled={!canSave || isSaving}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleCancel}
                  variant="ghost"
                  className="w-full"
                  size="lg"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>

              {canSave && (
                <p className="text-xs text-muted-foreground text-center">
                  Generate & Save will update the note and download PDF
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Vehicle Selection Table */}
        <div className="lg:col-span-2">
          <Card className="h-full">
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
