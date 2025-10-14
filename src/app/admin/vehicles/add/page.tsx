'use client';

import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  CheckCircle,
  Upload
} from 'lucide-react';
import { VehicleStatus, LocationType } from '@/types';
import type { Vehicle, Owner, Location, VehicleFormData } from '@/types';

const AddVehicle: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submissionStep, setSubmissionStep] = useState<'idle' | 'vehicle' | 'shipping' | 'complete'>('idle');
  const [savedVehicleId, setSavedVehicleId] = useState<string | null>(null);
  const [isSavingBasicInfo, setIsSavingBasicInfo] = useState(false);

  // Fetch locations and owners on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [locationsResponse, ownersResponse] = await Promise.all([
          fetch('/api/locations?limit=1000'),
          fetch('/api/owners?limit=1000'),
        ]);
        
        if (!locationsResponse.ok || !ownersResponse.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const [locationsResult, ownersResult] = await Promise.all([
          locationsResponse.json(),
          ownersResponse.json(),
        ]);
        
        // Locations API returns { locations: [...], total: ... }
        // Owners API returns { success: true, data: { owners: [...], pagination: {...} } }
        if (locationsResult.locations && ownersResult.success) {
          setLocations(locationsResult.locations);
          setOwners(ownersResult.data.owners);
        } else {
          throw new Error('Failed to load data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrors({ fetch: 'Failed to load locations and owners' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Set default dates after component mounts (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      setFormData(prev => ({
        ...prev,
        orderDate: prev.orderDate || today,
        estimatedDelivery: prev.estimatedDelivery || futureDate,
      }));
    }
  }, []);

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

  // Save basic vehicle information
  const saveBasicInfo = async () => {
    setIsSavingBasicInfo(true);
    setErrors({});

    try {
      // Create FormData for basic vehicle information only
      const vehicleFormData = new FormData();

      // Add vehicle data to FormData
      vehicleFormData.append('vin', formData.vin);
      vehicleFormData.append('make', formData.make);
      vehicleFormData.append('model', formData.model);
      vehicleFormData.append('year', formData.year.toString());
      vehicleFormData.append('color', formData.color);
      vehicleFormData.append('trim', formData.trim);
      vehicleFormData.append('engineType', formData.engineType);
      
      // Convert fuel type to proper enum format
      const fuelTypeMap: Record<string, string> = {
        'Gasoline': 'GASOLINE',
        'Diesel': 'DIESEL',
        'Electric': 'ELECTRIC',
        'Hybrid': 'HYBRID'
      };
      
      vehicleFormData.append('fuelType', fuelTypeMap[formData.fuelType] || formData.fuelType.toUpperCase());
      vehicleFormData.append('weightKg', formData.weightKg.toString());
      vehicleFormData.append('lengthMm', (formData.lengthMm || 0).toString());
      vehicleFormData.append('widthMm', (formData.widthMm || 0).toString());
      vehicleFormData.append('heightMm', (formData.heightMm || 0).toString());
      vehicleFormData.append('orderDate', new Date(formData.orderDate).toISOString());
      vehicleFormData.append('estimatedDelivery', new Date(formData.estimatedDelivery).toISOString());
      
      // Convert status to proper enum format
      const statusMap: Record<string, string> = {
        'Ordered': 'ORDERED',
        'In Transit': 'IN_TRANSIT',
        'At Port': 'AT_PORT',
        'Clearing Customs': 'CLEARING_CUSTOMS',
        'In Local Delivery': 'IN_LOCAL_DELIVERY',
        'Delivered': 'DELIVERED'
      };
      
      vehicleFormData.append('status', statusMap[formData.status] || formData.status.toUpperCase());
      vehicleFormData.append('currentLocationId', formData.currentLocationId);
      vehicleFormData.append('ownerId', formData.ownerId);
      
      // Convert customs status to proper enum format
      const customsStatusMap: Record<string, string> = {
        'Pending': 'PENDING',
        'In Progress': 'IN_PROGRESS',
        'Cleared': 'CLEARED',
        'Held': 'HELD'
      };
      
      vehicleFormData.append('customsStatus', customsStatusMap[formData.customsStatus] || formData.customsStatus.toUpperCase());
      vehicleFormData.append('importDuty', formData.importDuty.toString());
      vehicleFormData.append('customsNotes', formData.customsNotes || '');
      vehicleFormData.append('notes', formData.notes || '');

      // Add images to FormData
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach(file => {
          vehicleFormData.append('images', file);
        });
      }

      // Create vehicle
      const vehicleResponse = await fetch('/api/vehicles', {
        method: 'POST',
        body: vehicleFormData,
      });

      if (!vehicleResponse.ok) {
        const errorData = await vehicleResponse.json();
        console.error('Vehicle creation error:', errorData);
        if (errorData.details) {
          const errorMessages = errorData.details.map((detail: any) => `${detail.path.join('.')}: ${detail.message}`).join(', ');
          throw new Error(`Vehicle validation failed: ${errorMessages}`);
        }
        throw new Error(errorData.error || 'Failed to create vehicle');
      }

      const vehicleData = await vehicleResponse.json();
      const vehicleId = vehicleData.data.id;
      
      // Store the vehicle ID and move to next step
      setSavedVehicleId(vehicleId);
      setCurrentStep(1); // Move to shipping step
      
    } catch (error) {
      console.error('Error saving basic vehicle info:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save basic vehicle information. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setIsSavingBasicInfo(false);
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
      id: 'shipping',
      title: 'Shipping & Customs',
      icon: <Ship className="h-4 w-4" />
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
    orderDate: '',
    estimatedDelivery: '',
    
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

  const handleInputChange = (field: keyof VehicleFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  const handleShippingDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newDocuments = Array.from(files);
      setFormData(prev => ({
        ...prev,
        shippingDocuments: [...(prev.shippingDocuments || []), ...newDocuments]
      }));
    }
  };

  const removeShippingDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      shippingDocuments: prev.shippingDocuments?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSubmissionStep('shipping');

    try {
      // Check if vehicle ID exists (basic info should be saved)
      if (!savedVehicleId) {
        throw new Error('Vehicle basic information must be saved first. Please go back to step 1.');
      }

      // Create Shipping Details only
      const shippingFormData = new FormData();

      // Add shipping details to FormData
      shippingFormData.append('originPort', formData.originPort || '');
      shippingFormData.append('destinationPort', formData.destinationPort || '');
      shippingFormData.append('shippingCompany', formData.shippingCompany || '');
      shippingFormData.append('vesselName', formData.vesselName || '');
      shippingFormData.append('containerNumber', formData.containerNumber || '');
      shippingFormData.append('bookingNumber', formData.bookingNumber || '');
      shippingFormData.append('departureDate', formData.departureDate || '');
      shippingFormData.append('expectedArrivalDate', formData.expectedArrivalDate || '');

      // Add shipping documents to FormData
      if (formData.shippingDocuments && formData.shippingDocuments.length > 0) {
        formData.shippingDocuments.forEach(file => {
          shippingFormData.append('documents', file);
        });
      }

      // Create shipping details
      const shippingResponse = await fetch(`/api/vehicles/${savedVehicleId}/shipping`, {
        method: 'POST',
        body: shippingFormData,
      });

      if (!shippingResponse.ok) {
        const errorData = await shippingResponse.json();
        console.error('Shipping details creation error:', errorData);
        if (errorData.details) {
          const errorMessages = errorData.details.map((detail: any) => `${detail.path.join('.')}: ${detail.message}`).join(', ');
          throw new Error(`Shipping validation failed: ${errorMessages}`);
        }
        throw new Error(errorData.error || 'Failed to create shipping details');
      }

      setSubmissionStep('complete');
      setShowSuccess(true);
      
      // Redirect to vehicles list after 2 seconds
      setTimeout(() => {
        router.push('/admin/vehicles');
      }, 2000);

    } catch (error) {
      console.error('Error adding shipping details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add shipping details. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-lg text-muted-foreground">Loading form data...</p>
          </div>
        </div>
      </div>
    );
  }

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
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Vehicle added successfully! Redirecting to vehicles list...
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alerts */}
        {errors.fetch && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {errors.fetch}
            </AlertDescription>
          </Alert>
        )}

        {errors.submit && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {errors.submit}
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
                              {locations.map((location) => (
                                <SelectItem key={location.id} value={location.id}>
                                  {location.name} - {(location as any).city || 'Unknown'}
                                </SelectItem>
                              ))}
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
                              {owners.map((owner) => (
                                <SelectItem key={owner.id} value={owner.id}>
                                  {owner.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Vehicle Images</h3>
                      <div className="space-y-4">
                        {/* Single Upload Icon */}
                        <div className="flex items-center gap-4">
                          <label htmlFor="image-upload" className="cursor-pointer">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                              <Upload className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                            </div>
                            <input
                              id="image-upload"
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Upload Vehicle Images</p>
                            <p className="text-xs text-muted-foreground">
                              Click the icon to select images • JPG, PNG, WebP • Max 5MB each
                            </p>
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
                      </div>
                    </div>

                    <div className="flex justify-end">
                        <Button 
                          type="button" 
                          onClick={saveBasicInfo}
                          disabled={isSavingBasicInfo}
                          className="flex items-center gap-2"
                        >
                          {isSavingBasicInfo ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              Save and Continue
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                    </div>
                  </div>
                )}

                {/* Shipping Step */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    {/* Success indicator for basic info */}
                    {savedVehicleId && (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          ✅ Basic vehicle information has been saved successfully! Vehicle ID: {savedVehicleId}
                        </AlertDescription>
                      </Alert>
                    )}
                    
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

                    <Separator />

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
                      <h3 className="text-lg font-semibold mb-4">Shipping Documents</h3>
                      <div className="space-y-4">
                        {/* Document Upload */}
                        <div className="flex items-center gap-4">
                          <label htmlFor="shipping-docs-upload" className="cursor-pointer">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center hover:bg-green-200 dark:hover:bg-green-800 transition-colors">
                              <Upload className="h-8 w-8 text-green-600 dark:text-green-300" />
                            </div>
                            <input
                              id="shipping-docs-upload"
                              type="file"
                              multiple
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={handleShippingDocumentUpload}
                              className="hidden"
                            />
                          </label>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Upload Shipping Documents</p>
                            <p className="text-xs text-muted-foreground">
                              Click the icon to select documents • PDF, DOC, DOCX, JPG, PNG • Max 10MB each
                            </p>
                          </div>
                        </div>
                        
                        {/* Document Preview Area - Only show when documents exist */}
                        {formData.shippingDocuments && formData.shippingDocuments.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.shippingDocuments.map((document, index) => (
                              <div key={index} className="relative group">
                                <div className="bg-muted rounded-lg p-4 border">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                      <span className="text-xs font-medium text-blue-600 dark:text-blue-300">
                                        {document.name.split('.').pop()?.toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{document.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {(document.size / 1024 / 1024).toFixed(2)} MB
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeShippingDocument(index)}
                                >
                                  ×
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
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
                        title="Basic vehicle information is already saved"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
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
                            {submissionStep === 'shipping' && 'Adding Shipping Details...'}
                            {submissionStep === 'complete' && 'Complete!'}
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Complete Vehicle
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
