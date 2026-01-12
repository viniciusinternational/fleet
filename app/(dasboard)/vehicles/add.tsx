'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Stepper } from '@/components/ui/stepper';
import { 
  Car, 
  MapPin, 
  Ship, 
  Building, 
  ArrowLeft,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { VehicleStatus } from '@/types';
import type { VehicleFormData, Location, Owner } from '@/types';
import { useEffect } from 'react';

const AddVehicle: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [locations, setLocations] = useState<Location[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [isLoadingOwners, setIsLoadingOwners] = useState(true);

  // Step navigation functions
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  // Stepper configuration
  const steps = [
    {
      id: 'basic',
      title: 'Basic Information',
      icon: <Car className="h-4 w-4" />
    },
    {
      id: 'details',
      title: 'Details & Location',
      icon: <MapPin className="h-4 w-4" />
    },
    {
      id: 'shipping',
      title: 'Shipping Information',
      icon: <Ship className="h-4 w-4" />
    },
    {
      id: 'customs',
      title: 'Customs & Final',
      icon: <Building className="h-4 w-4" />
    }
  ];

  // Form state
  const [formData, setFormData] = useState<VehicleFormData>({
    // Basic Vehicle Information
    vin: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    trim: '',
    engineType: '',
    fuelType: 'Gasoline',
    weightKg: 0,
    
    // Dimensions
    lengthMm: 0,
    widthMm: 0,
    heightMm: 0,
    
    // Dates
    orderDate: new Date().toISOString().split('T')[0],
    estimatedDelivery: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    
    // Status and Location
    status: VehicleStatus.ORDERED,
    currentLocationId: '',
    
    // Owner
    ownerId: '',
    
    // Shipping Details
    originPort: '',
    destinationPort: '',
    shippingCompany: '',
    vesselName: '',
    containerNumber: '',
    bookingNumber: '',
    departureDate: '',
    expectedArrivalDate: '',
    
    // Customs Details
    customsStatus: 'Pending',
    importDuty: 0,
    customsNotes: '',
    
    // Notes
    notes: '',
    
    // Images
    images: [],
    
    // Shipping Documents
    shippingDocuments: []
  });

  const vehicleStatusApiMap: Record<VehicleStatus, string> = {
    [VehicleStatus.ORDERED]: 'ORDERED',
    [VehicleStatus.IN_TRANSIT]: 'IN_TRANSIT',
    [VehicleStatus.AT_PORT]: 'AT_PORT',
    [VehicleStatus.CLEARING_CUSTOMS]: 'CLEARING_CUSTOMS',
    [VehicleStatus.IN_LOCAL_DELIVERY]: 'IN_LOCAL_DELIVERY',
    [VehicleStatus.DELIVERED]: 'DELIVERED'
  };

  const customsStatusApiMap: Record<VehicleFormData['customsStatus'], string> = {
    'Pending': 'PENDING',
    'In Progress': 'IN_PROGRESS',
    'Cleared': 'CLEARED',
    'Held': 'HELD'
  };

  const handleInputChange = (field: keyof VehicleFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const fileToBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(typeof reader.result === 'string' ? reader.result : '');
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImages = Array.from(files);
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newImages]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || []
    }));
  };

  // Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations?limit=100');
        if (response.ok) {
          const data = await response.json();
          setLocations(data.locations || []);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setIsLoadingLocations(false);
      }
    };
    fetchLocations();
  }, []);

  // Fetch owners
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await fetch('/api/owners?limit=100');
        if (response.ok) {
          const data = await response.json();
          setOwners(data.owners || []);
        }
      } catch (error) {
        console.error('Error fetching owners:', error);
      } finally {
        setIsLoadingOwners(false);
      }
    };
    fetchOwners();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setShowSuccess(false);

    try {
      const selectedLocation = locations.find(loc => loc.id === formData.currentLocationId);
      const selectedOwner = owners.find(owner => owner.id === formData.ownerId);

      if (!selectedLocation || !selectedOwner) {
        throw new Error('Please select a valid location and owner');
      }

      const imagesPayload = formData.images && formData.images.length > 0
        ? await Promise.all(
            formData.images.map(async (file, index) => ({
              data: await fileToBase64(file),
              caption: file.name,
              alt: `${formData.make} ${formData.model}`.trim() || `Vehicle image ${index + 1}`,
              isPrimary: index === 0,
            }))
          )
        : [];

      const payload = {
        vin: formData.vin.trim(),
        make: formData.make.trim(),
        model: formData.model.trim(),
        year: Number(formData.year),
        color: formData.color.trim(),
        trim: formData.trim.trim(),
        engineType: formData.engineType.trim(),
        fuelType: formData.fuelType.toUpperCase(),
        weightKg: Number(formData.weightKg) || 0,
        lengthMm: formData.lengthMm > 0 ? formData.lengthMm : undefined,
        widthMm: formData.widthMm > 0 ? formData.widthMm : undefined,
        heightMm: formData.heightMm > 0 ? formData.heightMm : undefined,
        orderDate: new Date(formData.orderDate).toISOString(),
        estimatedDelivery: new Date(formData.estimatedDelivery).toISOString(),
        status: vehicleStatusApiMap[formData.status],
        currentLocationId: formData.currentLocationId,
        ownerId: formData.ownerId || undefined,
        sourceId: formData.sourceId,
        customsStatus: customsStatusApiMap[formData.customsStatus],
        importDuty: Number(formData.importDuty) || 0,
        customsNotes: formData.customsNotes.trim() !== '' ? formData.customsNotes.trim() : undefined,
      };

      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          images: imagesPayload,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error || 'Failed to add vehicle');
      }

      setShowSuccess(true);

      setTimeout(() => {
        router.push('/admin/vehicles');
      }, 2000);
    } catch (error) {
      console.error('Error adding vehicle:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to add vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Add New Vehicle</h1>
              <p className="text-muted-foreground mt-2">Fill out the required information and submit from any tab</p>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {showSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Vehicle added successfully! Redirecting to vehicles list...
            </AlertDescription>
          </Alert>
        )}
        {submitError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {submitError}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Stepper */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <Stepper 
                steps={steps}
                currentStep={currentStep}
                onStepClick={goToStep}
              />
            </CardContent>
          </Card>

          {/* Form Content */}
          <Card>
            <CardContent className="p-6">

                {/* Basic Information Step */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Vehicle Specifications</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="vin">VIN *</Label>
                          <Input
                            id="vin"
                            value={formData.vin}
                            onChange={(e) => handleInputChange('vin', e.target.value)}
                            placeholder="Vehicle Identification Number"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="make">Make *</Label>
                          <Input
                            id="make"
                            value={formData.make}
                            onChange={(e) => handleInputChange('make', e.target.value)}
                            placeholder="Vehicle make"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="model">Model *</Label>
                          <Input
                            id="model"
                            value={formData.model}
                            onChange={(e) => handleInputChange('model', e.target.value)}
                            placeholder="Vehicle model"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="year">Year *</Label>
                          <Input
                            id="year"
                            type="number"
                            value={formData.year}
                            onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                            min="1900"
                            max={new Date().getFullYear() + 1}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="color">Color</Label>
                          <Input
                            id="color"
                            value={formData.color}
                            onChange={(e) => handleInputChange('color', e.target.value)}
                            placeholder="Vehicle color"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="trim">Trim</Label>
                          <Input
                            id="trim"
                            value={formData.trim}
                            onChange={(e) => handleInputChange('trim', e.target.value)}
                            placeholder="Vehicle trim level"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="engineType">Engine Type</Label>
                          <Input
                            id="engineType"
                            value={formData.engineType}
                            onChange={(e) => handleInputChange('engineType', e.target.value)}
                            placeholder="Engine type"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fuelType">Fuel Type</Label>
                          <Select value={formData.fuelType} onValueChange={(value) => handleInputChange('fuelType', value as VehicleFormData['fuelType'])}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Gasoline">Gasoline</SelectItem>
                              <SelectItem value="Diesel">Diesel</SelectItem>
                              <SelectItem value="Electric">Electric</SelectItem>
                              <SelectItem value="Hybrid">Hybrid</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="weightKg">Weight (kg)</Label>
                          <Input
                            id="weightKg"
                            type="number"
                            value={formData.weightKg}
                            onChange={(e) => handleInputChange('weightKg', parseInt(e.target.value))}
                            placeholder="Weight in kg"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Dimensions (mm)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="lengthMm">Length</Label>
                          <Input
                            id="lengthMm"
                            type="number"
                            value={formData.lengthMm}
                            onChange={(e) => handleInputChange('lengthMm', parseInt(e.target.value))}
                            placeholder="Length in mm"
                            min="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="widthMm">Width</Label>
                          <Input
                            id="widthMm"
                            type="number"
                            value={formData.widthMm}
                            onChange={(e) => handleInputChange('widthMm', parseInt(e.target.value))}
                            placeholder="Width in mm"
                            min="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="heightMm">Height</Label>
                          <Input
                            id="heightMm"
                            type="number"
                            value={formData.heightMm}
                            onChange={(e) => handleInputChange('heightMm', parseInt(e.target.value))}
                            placeholder="Height in mm"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Vehicle Images</h3>
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                          <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                              <Car className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium">Upload Vehicle Images</p>
                              <p className="text-xs text-muted-foreground">
                                Drag and drop images here, or click to select files
                              </p>
                            </div>
                            <label htmlFor="image-upload" className="w-full max-w-xs">
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                asChild
                              >
                                <span>Choose Images</span>
                              </Button>
                              <input
                                id="image-upload"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                        
                        {/* Image Preview Area - Only show when images exist */}
                        {formData.images && formData.images.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {formData.images.map((image, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square bg-muted rounded-lg overflow-hidden border">
                                  <img
                                    src={URL.createObjectURL(image)}
                                    alt={`Vehicle image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeImage(index)}
                                >
                                  ×
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="text-xs text-muted-foreground">
                          <p>• Supported formats: JPG, PNG, WebP</p>
                          <p>• Maximum file size: 5MB per image</p>
                          <p>• Recommended: At least 800x600 pixels</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                        <Button 
                          type="button"
                        onClick={nextStep}
                        className="flex items-center gap-2"
                      >
                        Save and Continue
                        <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                  </div>
                )}

                {/* Details & Location Step */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Dates and Status</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="orderDate">Order Date *</Label>
                          <Input
                            id="orderDate"
                            type="date"
                            value={formData.orderDate}
                            onChange={(e) => handleInputChange('orderDate', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="estimatedDelivery">Estimated Delivery</Label>
                          <Input
                            id="estimatedDelivery"
                            type="date"
                            value={formData.estimatedDelivery}
                            onChange={(e) => handleInputChange('estimatedDelivery', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value as VehicleStatus)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={VehicleStatus.ORDERED}>Ordered</SelectItem>
                              <SelectItem value={VehicleStatus.IN_TRANSIT}>In Transit</SelectItem>
                              <SelectItem value={VehicleStatus.AT_PORT}>At Port</SelectItem>
                              <SelectItem value={VehicleStatus.CLEARING_CUSTOMS}>Clearing Customs</SelectItem>
                              <SelectItem value={VehicleStatus.IN_LOCAL_DELIVERY}>In Local Delivery</SelectItem>
                              <SelectItem value={VehicleStatus.DELIVERED}>Delivered</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Location and Owner</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="currentLocationId">Current Location *</Label>
                          <Select value={formData.currentLocationId} onValueChange={(value) => handleInputChange('currentLocationId', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                              {isLoadingLocations ? (
                                <SelectItem value="loading" disabled>Loading locations...</SelectItem>
                              ) : locations.length > 0 ? (
                                locations.map((location) => (
                                  <SelectItem key={location.id} value={location.id}>
                                    {location.name} - {location.address?.city || 'Unknown'}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-locations" disabled>No locations available</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ownerId">Owner *</Label>
                          <Select value={formData.ownerId} onValueChange={(value) => handleInputChange('ownerId', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select owner" />
                            </SelectTrigger>
                            <SelectContent>
                              {isLoadingOwners ? (
                                <SelectItem value="loading" disabled>Loading owners...</SelectItem>
                              ) : owners.length > 0 ? (
                                owners.map((owner) => (
                                  <SelectItem key={owner.id} value={owner.id}>
                                    {owner.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-owners" disabled>No owners available</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={prevStep}
                      >
                        Previous
                      </Button>
                        <Button 
                          type="button" 
                        onClick={nextStep}
                        className="flex items-center gap-2"
                      >
                        Save and Continue
                        <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                  </div>
                )}

                {/* Shipping Step */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="originPort">Origin Port</Label>
                          <Input
                            id="originPort"
                            value={formData.originPort}
                            onChange={(e) => handleInputChange('originPort', e.target.value)}
                            placeholder="Origin port"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="destinationPort">Destination Port</Label>
                          <Input
                            id="destinationPort"
                            value={formData.destinationPort}
                            onChange={(e) => handleInputChange('destinationPort', e.target.value)}
                            placeholder="Destination port"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shippingCompany">Shipping Company</Label>
                          <Input
                            id="shippingCompany"
                            value={formData.shippingCompany}
                            onChange={(e) => handleInputChange('shippingCompany', e.target.value)}
                            placeholder="Shipping company name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="vesselName">Vessel Name</Label>
                          <Input
                            id="vesselName"
                            value={formData.vesselName}
                            onChange={(e) => handleInputChange('vesselName', e.target.value)}
                            placeholder="Vessel name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="containerNumber">Container Number</Label>
                          <Input
                            id="containerNumber"
                            value={formData.containerNumber}
                            onChange={(e) => handleInputChange('containerNumber', e.target.value)}
                            placeholder="Container number"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bookingNumber">Booking Number</Label>
                          <Input
                            id="bookingNumber"
                            value={formData.bookingNumber}
                            onChange={(e) => handleInputChange('bookingNumber', e.target.value)}
                            placeholder="Booking number"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="departureDate">Departure Date</Label>
                          <Input
                            id="departureDate"
                            type="date"
                            value={formData.departureDate}
                            onChange={(e) => handleInputChange('departureDate', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expectedArrivalDate">Expected Arrival Date</Label>
                          <Input
                            id="expectedArrivalDate"
                            type="date"
                            value={formData.expectedArrivalDate}
                            onChange={(e) => handleInputChange('expectedArrivalDate', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={prevStep}
                      >
                        Previous
                      </Button>
                        <Button 
                          type="button" 
                        onClick={nextStep}
                        className="flex items-center gap-2"
                      >
                        Save and Continue
                        <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                  </div>
                )}

                {/* Customs Step */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Customs Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="customsStatus">Customs Status</Label>
                          <Select value={formData.customsStatus} onValueChange={(value) => handleInputChange('customsStatus', value as VehicleFormData['customsStatus'])}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Cleared">Cleared</SelectItem>
                              <SelectItem value="Held">Held</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="importDuty">Import Duty</Label>
                          <Input
                            id="importDuty"
                            type="number"
                            value={formData.importDuty}
                            onChange={(e) => handleInputChange('importDuty', parseInt(e.target.value))}
                            placeholder="Import duty amount"
                            min="0"
                          />
                        </div>
                      </div>
                      <div className="mt-6">
                        <Label htmlFor="customsNotes">Customs Notes</Label>
                        <Textarea
                          id="customsNotes"
                          value={formData.customsNotes}
                          onChange={(e) => handleInputChange('customsNotes', e.target.value)}
                          placeholder="Customs notes and comments"
                          rows={3}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Additional Notes</h3>
                      <div className="space-y-4">
                        <Textarea
                          value={formData.notes}
                          onChange={(e) => handleInputChange('notes', e.target.value)}
                          placeholder="Add any additional notes or comments..."
                          rows={4}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={prevStep}
                      >
                        Previous
                      </Button>
                      <Button 
                        type="submit"
                        disabled={isSubmitting}
                        className="min-w-[120px]"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Adding Vehicle...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Add Vehicle
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/vehicles')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicle;
