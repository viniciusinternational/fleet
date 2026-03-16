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
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  MapPin, 
  Ship, 
  Building, 
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CheckCircle,
  Upload,
  User,
  Mail,
  Phone,
  Globe,
  Warehouse,
  Truck,
  Package,
  AlertTriangle,
  Wrench
} from 'lucide-react';
import { VehicleStatus, LocationType, LocationStatus } from '@/types';
import type { Vehicle, Owner, Location, Source, VehicleFormData } from '@/types';
type ValidationErrors = Record<string, string>;

const validateBasicStep = (data: VehicleFormData): ValidationErrors => {
  const errors: ValidationErrors = {};
  const currentYear = new Date().getFullYear();

  if (!data.vin || String(data.vin).trim().length === 0) {
    errors.vin = 'VIN is required.';
  }

  if (!data.make || String(data.make).trim().length === 0) {
    errors.make = 'Make is required.';
  }

  if (!data.model || String(data.model).trim().length === 0) {
    errors.model = 'Model is required.';
  }

  if (data.year === '' || data.year === undefined || data.year === null) {
    errors.year = 'Year is required.';
  } else {
    const yearNumber = typeof data.year === 'number' ? data.year : parseInt(String(data.year), 10);
    if (Number.isNaN(yearNumber)) {
      errors.year = 'Year must be a valid number.';
    } else if (yearNumber < 1900 || yearNumber > currentYear + 1) {
      errors.year = `Year must be between 1900 and ${currentYear + 1}.`;
    }
  }

  if (!data.color || String(data.color).trim().length === 0) {
    errors.color = 'Color is required.';
  }

  if (!data.trim || String(data.trim).trim().length === 0) {
    errors.trim = 'Trim is required.';
  }

  if (!data.engineType || String(data.engineType).trim().length === 0) {
    errors.engineType = 'Engine type is required.';
  }

  if (!data.fuelType || String(data.fuelType).trim().length === 0) {
    errors.fuelType = 'Fuel type is required.';
  }

  if (!data.orderDate || String(data.orderDate).trim().length === 0) {
    errors.orderDate = 'Order date is required.';
  }

  if (!data.estimatedDelivery || String(data.estimatedDelivery).trim().length === 0) {
    errors.estimatedDelivery = 'Estimated delivery date is required.';
  }

  if (!data.status || String(data.status).trim().length === 0) {
    errors.status = 'Initial status is required.';
  }

  if (!data.currentLocationId || String(data.currentLocationId).trim().length === 0) {
    errors.currentLocationId = 'Current location is required.';
  }

  if (!data.sourceId || String(data.sourceId).trim().length === 0) {
    errors.sourceId = 'Source is required.';
  }

  if (!data.customsStatus || String(data.customsStatus).trim().length === 0) {
    errors.customsStatus = 'Customs status is required.';
  }

  if (data.importDuty === '' || data.importDuty === undefined || data.importDuty === null) {
    errors.importDuty = 'Import duty is required.';
  } else {
    const dutyNumber = typeof data.importDuty === 'number' ? data.importDuty : parseFloat(String(data.importDuty));
    if (Number.isNaN(dutyNumber) || dutyNumber < 0) {
      errors.importDuty = 'Import duty must be a non-negative number.';
    }
  }

  if (!data.images || data.images.length === 0) {
    errors.images = 'Vehicle images are required. Please upload at least one image.';
  }

  // Optional numeric fields must be non-negative when provided
  const numericFields: Array<keyof VehicleFormData> = ['weightKg', 'lengthMm', 'widthMm', 'heightMm'];
  numericFields.forEach((fieldKey) => {
    const value = data[fieldKey];
    if (value !== '' && value !== null && value !== undefined) {
      const numericValue = typeof value === 'number' ? value : parseFloat(String(value));
      if (Number.isNaN(numericValue) || numericValue < 0) {
        errors[fieldKey as string] = 'Value must be a non-negative number.';
      }
    }
  });

  return errors;
};

const validateShippingStep = (data: VehicleFormData): ValidationErrors => {
  // All shipping fields are optional based on the server schema.
  // This helper exists for future extension and parity with basic step validation.
  const errors: ValidationErrors = {};
  return errors;
};

const AddVehicle: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submissionStep, setSubmissionStep] = useState<'idle' | 'vehicle' | 'shipping' | 'complete'>('idle');
  const [savedVehicleId, setSavedVehicleId] = useState<string | null>(null);
  const [isSavingBasicInfo, setIsSavingBasicInfo] = useState(false);
  
  // Constants from API
  const [makes, setMakes] = useState<Array<{ id: string; name: string }>>([]);
  const [models, setModels] = useState<Array<{ id: string; name: string; makeId: string; make: { name: string } }>>([]);
  const [colors, setColors] = useState<Array<{ id: string; name: string }>>([]);
  const [transmissions, setTransmissions] = useState<Array<{ id: string; name: string; enumValue: string }>>([]);
  const [engineTypes, setEngineTypes] = useState<Array<{ id: string; name: string }>>([]);

  // Fetch locations, owners, sources, and constants on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [locationsResponse, ownersResponse, sourcesResponse, makesResponse, modelsResponse, colorsResponse, transmissionsResponse, engineTypesResponse] = await Promise.all([
          fetch('/api/locations?limit=1000'),
          fetch('/api/owners?limit=1000'),
          fetch('/api/sources?limit=1000'),
          fetch('/api/settings/makes'),
          fetch('/api/settings/models'),
          fetch('/api/settings/colors'),
          fetch('/api/settings/transmissions'),
          fetch('/api/settings/engine-types'),
        ]);
        
        if (!locationsResponse.ok || !ownersResponse.ok || !sourcesResponse.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const [locationsResult, ownersResult, sourcesResult, makesResult, modelsResult, colorsResult, transmissionsResult, engineTypesResult] = await Promise.all([
          locationsResponse.json(),
          ownersResponse.json(),
          sourcesResponse.json(),
          makesResponse.json(),
          modelsResponse.json(),
          colorsResponse.json(),
          transmissionsResponse.json(),
          engineTypesResponse.json(),
        ]);
        
        // Locations API returns { locations: [...], total: ... }
        // Owners API returns { success: true, data: { owners: [...], pagination: {...} } }
        // Sources API returns { success: true, data: { sources: [...], pagination: {...} } }
        if (locationsResult.locations && ownersResult.success && sourcesResult.success) {
          setLocations(locationsResult.locations);
          setOwners(ownersResult.data.owners);
          setSources(sourcesResult.data.sources);
        } else {
          throw new Error('Failed to load data');
        }

        // Settings API returns { success: true, data: [...] }
        if (makesResult.success) setMakes(makesResult.data);
        if (modelsResult.success) setModels(modelsResult.data);
        if (colorsResult.success) setColors(colorsResult.data);
        if (transmissionsResult.success) setTransmissions(transmissionsResult.data);
        if (engineTypesResult.success) setEngineTypes(engineTypesResult.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrors({ fetch: 'Failed to load data' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get models for selected make
  const getModelsForMake = (makeName: string) => {
    const selectedMake = makes.find(m => m.name === makeName);
    if (!selectedMake) return [];
    return models
      .filter(m => m.makeId === selectedMake.id)
      .map(m => m.name);
  };

  // Get transmission enum map
  const getTransmissionEnumMap = () => {
    const map: Record<string, string> = {};
    transmissions.forEach(t => {
      map[t.name] = t.enumValue;
    });
    return map;
  };

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
      const validationErrors = validateBasicStep(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsSavingBasicInfo(false);
        return;
      }

      // Create FormData for basic vehicle information only
      const vehicleFormData = new FormData();

      // Add vehicle data to FormData
      vehicleFormData.append('vin', formData.vin);
      vehicleFormData.append('make', formData.make);
      vehicleFormData.append('model', formData.model);
      vehicleFormData.append('year', (typeof formData.year === 'string' && formData.year === '' ? new Date().getFullYear() : (typeof formData.year === 'number' ? formData.year : parseInt(formData.year) || new Date().getFullYear())).toString());
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
      if (formData.transmission) {
        const transmissionEnumMap = getTransmissionEnumMap();
        vehicleFormData.append('transmission', transmissionEnumMap[formData.transmission] || formData.transmission);
      }
      vehicleFormData.append('weightKg', (typeof formData.weightKg === 'string' && formData.weightKg === '' ? 0 : (typeof formData.weightKg === 'number' ? formData.weightKg : parseFloat(formData.weightKg) || 0)).toString());
      vehicleFormData.append('lengthMm', (typeof formData.lengthMm === 'string' && formData.lengthMm === '' ? 0 : (typeof formData.lengthMm === 'number' ? formData.lengthMm : parseInt(formData.lengthMm) || 0)).toString());
      vehicleFormData.append('widthMm', (typeof formData.widthMm === 'string' && formData.widthMm === '' ? 0 : (typeof formData.widthMm === 'number' ? formData.widthMm : parseInt(formData.widthMm) || 0)).toString());
      vehicleFormData.append('heightMm', (typeof formData.heightMm === 'string' && formData.heightMm === '' ? 0 : (typeof formData.heightMm === 'number' ? formData.heightMm : parseInt(formData.heightMm) || 0)).toString());
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
      if (formData.ownerId) {
        vehicleFormData.append('ownerId', formData.ownerId);
      }
      vehicleFormData.append('sourceId', formData.sourceId);
      
      // Convert customs status to proper enum format
      const customsStatusMap: Record<string, string> = {
        'Pending': 'PENDING',
        'In Progress': 'IN_PROGRESS',
        'Cleared': 'CLEARED',
        'Held': 'HELD'
      };
      
      vehicleFormData.append('customsStatus', customsStatusMap[formData.customsStatus] || formData.customsStatus.toUpperCase());
      vehicleFormData.append('importDuty', (typeof formData.importDuty === 'string' && formData.importDuty === '' ? 0 : (typeof formData.importDuty === 'number' ? formData.importDuty : parseFloat(formData.importDuty) || 0)).toString());
      vehicleFormData.append('customsNotes', formData.customsNotes || '');
      vehicleFormData.append('notes', formData.notes || '');

      // Add images to FormData (required)
      formData.images.forEach(file => {
        vehicleFormData.append('images', file);
      });

      // Create vehicle
      const vehicleResponse = await fetch('/api/vehicles', {
        method: 'POST',
        body: vehicleFormData,
      });

      if (!vehicleResponse.ok) {
        const errorData = await vehicleResponse.json();
        console.error('Vehicle creation error:', errorData);

        const fieldErrors: ValidationErrors = {};
        if (Array.isArray(errorData.details)) {
          errorData.details.forEach((detail: any) => {
            const path = Array.isArray(detail.path) ? detail.path[0] : detail.path;
            if (typeof path === 'string' && detail.message) {
              fieldErrors[path] = detail.message;
            }
          });
        }

        const submitMessage = errorData.error || 'Failed to create vehicle';
        setErrors((prev) => ({
          ...prev,
          ...fieldErrors,
          submit: submitMessage,
        }));
        setIsSavingBasicInfo(false);
        return;
      }

      const vehicleData = await vehicleResponse.json();
      const vehicleId = vehicleData.data.id;
      
      // Store the vehicle ID and move to next step
      setSavedVehicleId(vehicleId);
      setCurrentStep(1); // Move to shipping step
      
    } catch (error) {
      console.error('Error saving basic vehicle info:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save basic vehicle information. Please try again.';
      setErrors((prev) => ({
        ...prev,
        submit: errorMessage,
      }));
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
    transmission: undefined,
    weightKg: '',
    
    // Dimensions
    lengthMm: '',
    widthMm: '',
    heightMm: '',
    
    // Dates
    orderDate: '',
    estimatedDelivery: '',
    
    // Status and Location
    status: VehicleStatus.ORDERED,
    currentLocationId: '',
    
    // Owner
    ownerId: '',
    
    // Source
    sourceId: '',
    
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
    importDuty: '',
    customsNotes: '',
    
    // Notes
    notes: '',
    
    // Images
    images: [],
    
    // Shipping Documents
    shippingDocuments: []
  } as unknown as VehicleFormData);

  const handleInputChange = (field: keyof VehicleFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper function to format number input values for display
  const formatNumberValue = (value: number | string): string => {
    if (value === '' || value === 0 || value === null || value === undefined) {
      return '';
    }
    return String(value);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      const incomingFiles = Array.from(files);
      const validImages: File[] = [];
      const rejectedMessages: string[] = [];

      incomingFiles.forEach((file) => {
        if (!allowedTypes.includes(file.type)) {
          rejectedMessages.push(
            `${file.name}: Invalid file type. Only JPG, JPEG, and PNG files are allowed.`
          );
          return;
        }

        if (file.size > maxSize) {
          rejectedMessages.push(
            `${file.name}: File is too large. Maximum size is 5MB.`
          );
          return;
        }

        validImages.push(file);
      });

      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...validImages]
      }));

      if (rejectedMessages.length > 0) {
        setErrors(prev => ({
          ...prev,
          images: rejectedMessages.join(' '),
        }));
      } else if (validImages.length > 0) {
        setErrors(prev => {
          const { images, ...rest } = prev;
          return rest;
        });
      }
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

      const shippingErrors = validateShippingStep(formData);
      if (Object.keys(shippingErrors).length > 0) {
        setErrors(shippingErrors);
        setIsSubmitting(false);
        return;
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

        const fieldErrors: ValidationErrors = {};
        if (Array.isArray(errorData.details)) {
          errorData.details.forEach((detail: any) => {
            const path = Array.isArray(detail.path) ? detail.path[0] : detail.path;
            if (typeof path === 'string' && detail.message) {
              fieldErrors[path] = detail.message;
            }
          });
        }

        const submitMessage = errorData.error || 'Failed to create shipping details';
        setErrors((prev) => ({
          ...prev,
          ...fieldErrors,
          submit: submitMessage,
        }));
        setIsSubmitting(false);
        return;
      }

      setSubmissionStep('complete');
      setShowSuccess(true);
      
      // Redirect to vehicles list after 2 seconds
      setTimeout(() => {
        router.push('/vehicles');
      }, 2000);

    } catch (error) {
      console.error('Error adding shipping details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add shipping details. Please try again.';
      setErrors((prev) => ({
        ...prev,
        submit: errorMessage,
      }));
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

  const basicStepErrors = validateBasicStep(formData);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-32">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 -ml-2" 
                onClick={() => router.push('/vehicles')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">Add New Vehicle</h1>
            </div>
            <p className="text-muted-foreground ml-8">Register a new vehicle into the fleet management system.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/vehicles')}
              className="bg-background"
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* Success Alert */}
        {showSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50 animate-in fade-in slide-in-from-top-4">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 font-medium">
              Vehicle added successfully! Redirecting to vehicles list...
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alerts */}
        {(errors.fetch || errors.submit) && (
          <Alert className="mb-6 border-red-200 bg-red-50 animate-in fade-in slide-in-from-top-4">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 font-medium">
              {errors.fetch || errors.submit}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-8">
          {/* Stepper Card */}
          <Card className="border-none shadow-sm bg-background">
            <CardContent className="p-0">
              <Stepper 
                steps={steps}
                currentStep={currentStep}
                onStepClick={goToStep}
                className="py-2"
              />
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit}>
            {/* Basic Information Step */}
            {currentStep === 0 && (
              <div className="space-y-6">
                {/* Vehicle Specifications Section */}
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Car className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-xl">Vehicle Specifications</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="vin" className="text-sm font-semibold">VIN *</Label>
                        <Input
                          id="vin"
                          value={formData.vin}
                          onChange={(e) => handleInputChange('vin', e.target.value)}
                          placeholder="Vehicle Identification Number"
                          className="bg-muted/30 focus-visible:bg-background transition-colors"
                          aria-invalid={!!errors.vin}
                          aria-describedby={errors.vin ? 'vin-error' : undefined}
                          required
                        />
                        {errors.vin && (
                          <p id="vin-error" className="text-xs text-red-500 mt-1">{errors.vin}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="make" className="text-sm font-semibold">Make *</Label>
                        <Select value={formData.make} onValueChange={(value) => handleInputChange('make', value)}>
                          <SelectTrigger className="bg-muted/30 focus:bg-background transition-colors w-full">
                            <SelectValue placeholder="Select make" />
                          </SelectTrigger>
                          <SelectContent>
                            {makes.map((make) => (
                              <SelectItem key={make.id} value={make.name}>{make.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.make && (
                          <p className="text-xs text-red-500 mt-1">{errors.make}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="model" className="text-sm font-semibold">Model *</Label>
                        <Select 
                          value={formData.model} 
                          onValueChange={(value) => handleInputChange('model', value)}
                          disabled={!formData.make}
                        >
                          <SelectTrigger className="bg-muted/30 focus:bg-background transition-colors w-full">
                            <SelectValue placeholder={formData.make ? "Select model" : "Select make first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {formData.make && getModelsForMake(formData.make).map((model) => (
                              <SelectItem key={model} value={model}>{model}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.model && (
                          <p className="text-xs text-red-500 mt-1">{errors.model}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year" className="text-sm font-semibold">Year *</Label>
                        <Input
                          id="year"
                          type="number"
                          value={formData.year === 0 ? '' : (formData.year || '')}
                          onChange={(e) => handleInputChange('year', e.target.value === '' ? '' : (parseInt(e.target.value) || ''))}
                          min="1900"
                          max={new Date().getFullYear() + 1}
                          className="bg-muted/30 focus-visible:bg-background transition-colors"
                          aria-invalid={!!errors.year}
                          aria-describedby={errors.year ? 'year-error' : undefined}
                          required
                        />
                        {errors.year && (
                          <p id="year-error" className="text-xs text-red-500 mt-1">{errors.year}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="color" className="text-sm font-semibold">Color *</Label>
                        <Select value={formData.color} onValueChange={(value) => handleInputChange('color', value)}>
                          <SelectTrigger className="bg-muted/30 focus:bg-background transition-colors w-full">
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                          <SelectContent>
                            {colors.map((color) => (
                              <SelectItem key={color.id} value={color.name}>{color.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.color && (
                          <p className="text-xs text-red-500 mt-1">{errors.color}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="trim" className="text-sm font-semibold">Trim *</Label>
                        <Input
                          id="trim"
                          value={formData.trim}
                          onChange={(e) => handleInputChange('trim', e.target.value)}
                          placeholder="Vehicle trim level"
                          className="bg-muted/30 focus-visible:bg-background transition-colors"
                          aria-invalid={!!errors.trim}
                          aria-describedby={errors.trim ? 'trim-error' : undefined}
                        />
                        {errors.trim && (
                          <p id="trim-error" className="text-xs text-red-500 mt-1">{errors.trim}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="engineType" className="text-sm font-semibold">Engine Type *</Label>
                        <Select value={formData.engineType} onValueChange={(value) => handleInputChange('engineType', value)}>
                          <SelectTrigger className="bg-muted/30 focus:bg-background transition-colors w-full">
                            <SelectValue placeholder="Select engine type" />
                          </SelectTrigger>
                          <SelectContent>
                            {engineTypes.map((engineType) => (
                              <SelectItem key={engineType.id} value={engineType.name}>{engineType.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.engineType && (
                          <p className="text-xs text-red-500 mt-1">{errors.engineType}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fuelType" className="text-sm font-semibold">Fuel Type *</Label>
                        <Select value={formData.fuelType} onValueChange={(value) => handleInputChange('fuelType', value as VehicleFormData['fuelType'])}>
                          <SelectTrigger className="bg-muted/30 focus:bg-background transition-colors w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Gasoline">Gasoline</SelectItem>
                            <SelectItem value="Diesel">Diesel</SelectItem>
                            <SelectItem value="Electric">Electric</SelectItem>
                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.fuelType && (
                          <p className="text-xs text-red-500 mt-1">{errors.fuelType}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transmission" className="text-sm font-semibold">Transmission</Label>
                        <Select value={formData.transmission || ''} onValueChange={(value) => handleInputChange('transmission', value || '')}>
                          <SelectTrigger className="bg-muted/30 focus:bg-background transition-colors w-full">
                            <SelectValue placeholder="Select transmission" />
                          </SelectTrigger>
                          <SelectContent>
                            {transmissions.map((transmission) => (
                              <SelectItem key={transmission.id} value={transmission.name}>{transmission.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Dimensions Section */}
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Truck className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-xl">Dimensions & Weight</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="weightKg" className="text-sm font-semibold">Weight (kg)</Label>
                        <Input
                          id="weightKg"
                          type="number"
                          value={formatNumberValue(formData.weightKg)}
                          onChange={(e) => handleInputChange('weightKg', e.target.value)}
                          placeholder="0"
                          className="bg-muted/30 focus-visible:bg-background transition-colors"
                        />
                        {errors.weightKg && (
                          <p className="text-xs text-red-500 mt-1">{errors.weightKg}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lengthMm" className="text-sm font-semibold">Length (mm)</Label>
                        <Input
                          id="lengthMm"
                          type="number"
                          value={formatNumberValue(formData.lengthMm)}
                          onChange={(e) => handleInputChange('lengthMm', e.target.value)}
                          placeholder="0"
                          className="bg-muted/30 focus-visible:bg-background transition-colors"
                        />
                        {errors.lengthMm && (
                          <p className="text-xs text-red-500 mt-1">{errors.lengthMm}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="widthMm" className="text-sm font-semibold">Width (mm)</Label>
                        <Input
                          id="widthMm"
                          type="number"
                          value={formatNumberValue(formData.widthMm)}
                          onChange={(e) => handleInputChange('widthMm', e.target.value)}
                          placeholder="0"
                          className="bg-muted/30 focus-visible:bg-background transition-colors"
                        />
                        {errors.widthMm && (
                          <p className="text-xs text-red-500 mt-1">{errors.widthMm}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="heightMm" className="text-sm font-semibold">Height (mm)</Label>
                        <Input
                          id="heightMm"
                          type="number"
                          value={formatNumberValue(formData.heightMm)}
                          onChange={(e) => handleInputChange('heightMm', e.target.value)}
                          placeholder="0"
                          className="bg-muted/30 focus-visible:bg-background transition-colors"
                        />
                        {errors.heightMm && (
                          <p className="text-xs text-red-500 mt-1">{errors.heightMm}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Operational Details Section */}
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-xl">Operational Details</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Top Row: Current Location and Source (Required Fields) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Current Location */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentLocationId" className="text-sm font-semibold">Current Location *</Label>
                          <Select value={formData.currentLocationId} onValueChange={(value) => handleInputChange('currentLocationId', value)}>
                            <SelectTrigger className="bg-muted/30 focus:bg-background transition-colors w-full min-w-[280px] max-w-full">
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                              {locations.map((location) => (
                                <SelectItem key={location.id} value={location.id}>
                                  {location.name} ({location.type}) - {location.address?.city || 'Unknown'}, {location.address?.country || 'Unknown'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                            </Select>
                            {errors.currentLocationId && (
                              <p className="text-xs text-red-500 mt-1">{errors.currentLocationId}</p>
                            )}
                        </div>

                        {formData.currentLocationId && (() => {
                          const loc = locations.find(l => l.id === formData.currentLocationId);
                          if (!loc) return null;
                          return (
                            <div className="p-4 rounded-xl border bg-muted/20 flex items-start gap-3">
                              <MapPin className="h-5 w-5 text-primary mt-0.5" />
                              <div className="space-y-1">
                                <p className="text-sm font-semibold">{loc.name}</p>
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">{loc.type}</Badge>
                                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-green-600 border-green-200 bg-green-50">{loc.status}</Badge>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Source */}
                      <div className="space-y-2">
                        <Label htmlFor="sourceId" className="text-sm font-semibold">From *</Label>
                        <Select value={formData.sourceId || ''} onValueChange={(value) => handleInputChange('sourceId', value)}>
                          <SelectTrigger className="bg-muted/30 focus:bg-background transition-colors w-full min-w-[280px] max-w-full">
                            <SelectValue placeholder="Select from" />
                          </SelectTrigger>
                          <SelectContent>
                            {sources.map((source) => (
                              <SelectItem key={source.id} value={source.id}>
                                {source.name} - {source.country || 'Unknown'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.sourceId && (
                          <p className="text-xs text-red-500 mt-1">{errors.sourceId}</p>
                        )}
                      </div>
                    </div>

                    {/* Second Row: Order Date, Estimated Delivery, Initial Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="orderDate" className="text-sm font-semibold">Order Date *</Label>
                        <Input
                          id="orderDate"
                          type="date"
                          value={formData.orderDate}
                          onChange={(e) => handleInputChange('orderDate', e.target.value)}
                          className="bg-muted/30 focus-visible:bg-background transition-colors"
                          aria-invalid={!!errors.orderDate}
                          aria-describedby={errors.orderDate ? 'orderDate-error' : undefined}
                        />
                        {errors.orderDate && (
                          <p id="orderDate-error" className="text-xs text-red-500 mt-1">{errors.orderDate}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estimatedDelivery" className="text-sm font-semibold">Estimated Delivery *</Label>
                        <Input
                          id="estimatedDelivery"
                          type="date"
                          value={formData.estimatedDelivery}
                          onChange={(e) => handleInputChange('estimatedDelivery', e.target.value)}
                          className="bg-muted/30 focus-visible:bg-background transition-colors"
                          aria-invalid={!!errors.estimatedDelivery}
                          aria-describedby={errors.estimatedDelivery ? 'estimatedDelivery-error' : undefined}
                        />
                        {errors.estimatedDelivery && (
                          <p id="estimatedDelivery-error" className="text-xs text-red-500 mt-1">{errors.estimatedDelivery}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-semibold">Initial Status *</Label>
                        <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value as VehicleStatus)}>
                          <SelectTrigger className="bg-muted/30 focus:bg-background transition-colors w-full min-w-[280px] max-w-full">
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
                        {errors.status && (
                          <p className="text-xs text-red-500 mt-1">{errors.status}</p>
                        )}
                      </div>
                    </div>

                    {/* Third Row: Owner / Client */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="ownerId" className="text-sm font-semibold">To</Label>
                        <Select value={formData.ownerId} onValueChange={(value) => handleInputChange('ownerId', value)}>
                          <SelectTrigger className="bg-muted/30 focus:bg-background transition-colors w-full min-w-[280px] max-w-full">
                            <SelectValue placeholder="Select to" />
                          </SelectTrigger>
                          <SelectContent>
                            {owners.map((owner) => (
                              <SelectItem key={owner.id} value={owner.id}>{owner.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Media Section */}
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Upload className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-xl">Vehicle Images *</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {errors.images && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800 text-sm">
                          {errors.images}
                        </AlertDescription>
                      </Alert>
                    )}
                    <div 
                      className="border-2 border-dashed border-muted-foreground/25 rounded-2xl p-10 flex flex-col items-center justify-center bg-muted/10 hover:bg-muted/20 transition-all cursor-pointer group"
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      <div className="p-4 rounded-full bg-background shadow-sm group-hover:scale-110 transition-transform mb-4">
                        <Upload className="h-8 w-8 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold mb-1">Upload photos of the vehicle</p>
                        <p className="text-sm text-muted-foreground">Select multiple images to showcase the vehicle condition.</p>
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>

                    {formData.images && formData.images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border-2 border-muted">
                            <img
                              src={URL.createObjectURL(image)}
                              alt="preview"
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full shadow-lg"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(index);
                                }}
                              >
                                ×
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Shipping Step */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Ship className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-xl">Shipping Details</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="originPort" className="text-sm font-semibold">Origin Port</Label>
                        <Input
                          id="originPort"
                          value={formData.originPort}
                          onChange={(e) => handleInputChange('originPort', e.target.value)}
                          placeholder="Departure port"
                          className="bg-muted/30 focus-visible:bg-background transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="destinationPort" className="text-sm font-semibold">Destination Port</Label>
                        <Input
                          id="destinationPort"
                          value={formData.destinationPort}
                          onChange={(e) => handleInputChange('destinationPort', e.target.value)}
                          placeholder="Arrival port"
                          className="bg-muted/30 focus-visible:bg-background transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shippingCompany" className="text-sm font-semibold">Shipping Line</Label>
                        <Input
                          id="shippingCompany"
                          value={formData.shippingCompany}
                          onChange={(e) => handleInputChange('shippingCompany', e.target.value)}
                          placeholder="Company name"
                          className="bg-muted/30 focus-visible:bg-background transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vesselName" className="text-sm font-semibold">Vessel Name</Label>
                        <Input
                          id="vesselName"
                          value={formData.vesselName}
                          onChange={(e) => handleInputChange('vesselName', e.target.value)}
                          placeholder="Ship name"
                          className="bg-muted/30 focus-visible:bg-background transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="containerNumber" className="text-sm font-semibold">Container Number</Label>
                        <Input
                          id="containerNumber"
                          value={formData.containerNumber}
                          onChange={(e) => handleInputChange('containerNumber', e.target.value)}
                          placeholder="e.g. MSKU1234567"
                          className="bg-muted/30 focus-visible:bg-background transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bookingNumber" className="text-sm font-semibold">Booking Number</Label>
                        <Input
                          id="bookingNumber"
                          value={formData.bookingNumber}
                          onChange={(e) => handleInputChange('bookingNumber', e.target.value)}
                          placeholder="Reference number"
                          className="bg-muted/30 focus-visible:bg-background transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="departureDate" className="text-sm font-semibold">Departure Date</Label>
                        <Input
                          id="departureDate"
                          type="date"
                          value={formData.departureDate}
                          onChange={(e) => handleInputChange('departureDate', e.target.value)}
                          className="bg-muted/30 focus-visible:bg-background transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expectedArrivalDate" className="text-sm font-semibold">Expected Arrival</Label>
                        <Input
                          id="expectedArrivalDate"
                          type="date"
                          value={formData.expectedArrivalDate}
                          onChange={(e) => handleInputChange('expectedArrivalDate', e.target.value)}
                          className="bg-muted/30 focus-visible:bg-background transition-colors"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Building className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-xl">Customs Information</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="customsStatus" className="text-sm font-semibold">Customs Status *</Label>
                        <Select value={formData.customsStatus} onValueChange={(value) => handleInputChange('customsStatus', value as VehicleFormData['customsStatus'])}>
                          <SelectTrigger className="bg-muted/30 focus:bg-background transition-colors w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Cleared">Cleared</SelectItem>
                            <SelectItem value="Held">Held</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.customsStatus && (
                          <p className="text-xs text-red-500 mt-1">{errors.customsStatus}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="importDuty" className="text-sm font-semibold">Import Duty (USD) *</Label>
                        <Input
                          id="importDuty"
                          type="number"
                          value={formatNumberValue(formData.importDuty)}
                          onChange={(e) => handleInputChange('importDuty', e.target.value)}
                          className="bg-muted/30 focus-visible:bg-background transition-colors"
                          aria-invalid={!!errors.importDuty}
                          aria-describedby={errors.importDuty ? 'importDuty-error' : undefined}
                        />
                        {errors.importDuty && (
                          <p id="importDuty-error" className="text-xs text-red-500 mt-1">{errors.importDuty}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customsNotes" className="text-sm font-semibold">Customs Notes</Label>
                      <Textarea
                        id="customsNotes"
                        value={formData.customsNotes}
                        onChange={(e) => handleInputChange('customsNotes', e.target.value)}
                        placeholder="Additional information for customs clearance..."
                        rows={3}
                        className="bg-muted/30 focus-visible:bg-background transition-colors resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-xl">Documents & Notes</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div 
                      className="border-2 border-dashed border-muted-foreground/25 rounded-2xl p-8 flex flex-col items-center justify-center bg-muted/10 hover:bg-muted/20 transition-all cursor-pointer group"
                      onClick={() => document.getElementById('shipping-docs-upload')?.click()}
                    >
                      <Upload className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                      <p className="font-semibold text-center">Click to upload shipping documents</p>
                      <p className="text-xs text-muted-foreground mt-1 text-center">PDF, JPG, PNG, DOCX up to 10MB</p>
                      <input
                        id="shipping-docs-upload"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleShippingDocumentUpload}
                        className="hidden"
                      />
                    </div>

                    {formData.shippingDocuments && formData.shippingDocuments.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {formData.shippingDocuments.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-background rounded-xl border group hover:border-primary/50 transition-colors">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0 font-bold text-[10px] text-primary">
                                {doc.name.split('.').pop()?.toUpperCase()}
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-sm font-medium truncate">{doc.name}</p>
                                <p className="text-[10px] text-muted-foreground uppercase">{(doc.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                              onClick={() => removeShippingDocument(index)}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-sm font-semibold">General Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Any additional remarks..."
                        rows={4}
                        className="bg-muted/30 focus-visible:bg-background transition-colors resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t z-50 py-4 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button 
                variant="outline" 
                onClick={prevStep}
                className="bg-background shadow-sm h-11"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep === 0 ? (
              <Button 
                onClick={saveBasicInfo}
                disabled={isSavingBasicInfo || Object.keys(basicStepErrors).length > 0}
                className="h-11 px-8 shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px] active:translate-y-[0px]"
              >
                {isSavingBasicInfo ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Continue to Shipping
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-11 px-8 shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px] active:translate-y-[0px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Finalizing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Complete Vehicle Registration
                  </div>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVehicle;
