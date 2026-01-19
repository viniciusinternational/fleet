'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Car, 
  MapPin, 
  Building, 
  ArrowLeft,
  Save,
  Loader2,
  Upload,
  Package,
  Mail,
  Phone,
  Globe,
  User
} from 'lucide-react';
import { VehicleStatus, LocationType } from '@/types';
import type { Vehicle, Owner, Location, Source } from '@/types';
import { Badge } from '@/components/ui/badge';

const EditBasicInfo: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);
  
  // Constants from API
  const [makes, setMakes] = useState<Array<{ id: string; name: string }>>([]);
  const [models, setModels] = useState<Array<{ id: string; name: string; makeId: string; make: { name: string } }>>([]);
  const [colors, setColors] = useState<Array<{ id: string; name: string }>>([]);
  const [transmissions, setTransmissions] = useState<Array<{ id: string; name: string; enumValue: string }>>([]);

  // Form data state
  const [formData, setFormData] = useState({
    vin: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    trim: '',
    engineType: '',
    fuelType: 'Gasoline' as 'Gasoline' | 'Diesel' | 'Electric' | 'Hybrid',
    transmission: undefined as string | undefined,
    weightKg: '' as number | string,
    lengthMm: '' as number | string,
    widthMm: '' as number | string,
    heightMm: '' as number | string,
    orderDate: '',
    estimatedDelivery: '',
    status: 'ORDERED' as VehicleStatus,
    currentLocationId: '',
    ownerId: '',
    sourceId: ''
  });

  // Image state
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);

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

  // Get transmission display map
  const getTransmissionDisplayMap = () => {
    const map: Record<string, string> = {};
    transmissions.forEach(t => {
      map[t.enumValue] = t.name;
    });
    return map;
  };

  // Fetch vehicle data and form options
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [vehicleResponse, locationsResponse, ownersResponse, sourcesResponse, makesResponse, modelsResponse, colorsResponse, transmissionsResponse] = await Promise.all([
          fetch(`/api/vehicles/${vehicleId}`),
          fetch('/api/locations?limit=1000'),
          fetch('/api/owners?limit=1000'),
          fetch('/api/sources?limit=1000'),
          fetch('/api/settings/makes'),
          fetch('/api/settings/models'),
          fetch('/api/settings/colors'),
          fetch('/api/settings/transmissions'),
        ]);
        
        if (!vehicleResponse.ok || !locationsResponse.ok || !ownersResponse.ok || !sourcesResponse.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const [vehicleResult, locationsResult, ownersResult, sourcesResult, makesResult, modelsResult, colorsResult, transmissionsResult] = await Promise.all([
          vehicleResponse.json(),
          locationsResponse.json(),
          ownersResponse.json(),
          sourcesResponse.json(),
          makesResponse.json(),
          modelsResponse.json(),
          colorsResponse.json(),
          transmissionsResponse.json(),
        ]);
        
        // Set makes, models, colors, and transmissions
        if (makesResult.success && Array.isArray(makesResult.data)) {
          setMakes(makesResult.data);
        }
        if (modelsResult.success && Array.isArray(modelsResult.data)) {
          setModels(modelsResult.data);
        }
        if (colorsResult.success && Array.isArray(colorsResult.data)) {
          setColors(colorsResult.data);
        }
        if (transmissionsResult.success && Array.isArray(transmissionsResult.data)) {
          setTransmissions(transmissionsResult.data);
        }
        
        // Set vehicle data
        if (vehicleResult) {
          setVehicle(vehicleResult);
          // Get transmission display map after transmissions are loaded
          const displayMap: Record<string, string> = {};
          if (transmissionsResult.success && Array.isArray(transmissionsResult.data)) {
            transmissionsResult.data.forEach((t: any) => {
              displayMap[t.enumValue] = t.name;
            });
          }
          setFormData({
            vin: vehicleResult.vin || '',
            make: vehicleResult.make || '',
            model: vehicleResult.model || '',
            year: vehicleResult.year || new Date().getFullYear(),
            color: vehicleResult.color || '',
            trim: vehicleResult.trim || '',
            engineType: vehicleResult.engineType || '',
            fuelType: vehicleResult.fuelType || 'Gasoline',
            transmission: vehicleResult.transmission ? (displayMap[vehicleResult.transmission] || vehicleResult.transmission) : undefined,
            weightKg: vehicleResult.weightKg && vehicleResult.weightKg !== 0 ? vehicleResult.weightKg : '',
            lengthMm: vehicleResult.lengthMm && vehicleResult.lengthMm !== 0 ? vehicleResult.lengthMm : '',
            widthMm: vehicleResult.widthMm && vehicleResult.widthMm !== 0 ? vehicleResult.widthMm : '',
            heightMm: vehicleResult.heightMm && vehicleResult.heightMm !== 0 ? vehicleResult.heightMm : '',
            orderDate: vehicleResult.orderDate ? new Date(vehicleResult.orderDate).toISOString().split('T')[0] : '',
            estimatedDelivery: vehicleResult.estimatedDelivery ? new Date(vehicleResult.estimatedDelivery).toISOString().split('T')[0] : '',
            status: vehicleResult.status || 'ORDERED',
            currentLocationId: vehicleResult.currentLocationId || '',
            ownerId: vehicleResult.ownerId || '',
            sourceId: vehicleResult.sourceId || ''
          });
          
          // Set existing images
          if (vehicleResult.images && vehicleResult.images.length > 0) {
            setExistingImages(vehicleResult.images);
          }
        }
        
        // Set locations, owners, and sources
        if (locationsResult.locations && ownersResult.success && sourcesResult.success) {
          setLocations(locationsResult.locations);
          setOwners(ownersResult.data.owners);
          setSources(sourcesResult.data.sources);
        } else {
          throw new Error('Failed to load locations, owners, and sources');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrors({ fetch: 'Failed to load vehicle data' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vehicleId]);

  // Helper function to format number input values for display
  const formatNumberValue = (value: number | string): string => {
    if (value === '' || value === 0 || value === null || value === undefined) {
      return '';
    }
    return String(value);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      // Reset model when make changes
      if (field === 'make') {
        newData.model = '';
      }
      return newData;
    });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setSuccess(null);

    try {
      // Create FormData for vehicle details and images
      const formDataToSubmit = new FormData();
      
      // Add vehicle details
      formDataToSubmit.append('vin', formData.vin);
      formDataToSubmit.append('make', formData.make);
      formDataToSubmit.append('model', formData.model);
      formDataToSubmit.append('year', (typeof formData.year === 'string' && formData.year === '' ? new Date().getFullYear() : (typeof formData.year === 'number' ? formData.year : parseInt(formData.year) || new Date().getFullYear())).toString());
      formDataToSubmit.append('color', formData.color);
      formDataToSubmit.append('trim', formData.trim);
      formDataToSubmit.append('engineType', formData.engineType);
      formDataToSubmit.append('fuelType', formData.fuelType);
      if (formData.transmission) {
        const enumMap = getTransmissionEnumMap();
        formDataToSubmit.append('transmission', enumMap[formData.transmission] || formData.transmission);
      }
      formDataToSubmit.append('weightKg', (typeof formData.weightKg === 'string' && formData.weightKg === '' ? 0 : (typeof formData.weightKg === 'number' ? formData.weightKg : parseFloat(formData.weightKg) || 0)).toString());
      formDataToSubmit.append('lengthMm', (typeof formData.lengthMm === 'string' && formData.lengthMm === '' ? 0 : (typeof formData.lengthMm === 'number' ? formData.lengthMm : parseInt(formData.lengthMm) || 0)).toString());
      formDataToSubmit.append('widthMm', (typeof formData.widthMm === 'string' && formData.widthMm === '' ? 0 : (typeof formData.widthMm === 'number' ? formData.widthMm : parseInt(formData.widthMm) || 0)).toString());
      formDataToSubmit.append('heightMm', (typeof formData.heightMm === 'string' && formData.heightMm === '' ? 0 : (typeof formData.heightMm === 'number' ? formData.heightMm : parseInt(formData.heightMm) || 0)).toString());
      formDataToSubmit.append('orderDate', formData.orderDate ? new Date(formData.orderDate).toISOString() : '');
      formDataToSubmit.append('estimatedDelivery', formData.estimatedDelivery ? new Date(formData.estimatedDelivery).toISOString() : '');
      formDataToSubmit.append('status', formData.status);
      formDataToSubmit.append('currentLocationId', formData.currentLocationId);
      if (formData.ownerId) {
        formDataToSubmit.append('ownerId', formData.ownerId);
      }
      formDataToSubmit.append('sourceId', formData.sourceId);
      
      // Add new images
      images.forEach(file => {
        formDataToSubmit.append('images', file);
      });

      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'PUT',
        body: formDataToSubmit,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update vehicle');
      }

      setSuccess('Vehicle basic information updated successfully!');
      
      // Redirect back to vehicle view after a short delay
      setTimeout(() => {
        router.push(`/vehicles/${vehicleId}`);
      }, 1500);

    } catch (error) {
      console.error('Error updating vehicle:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to update vehicle' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading vehicle data...</span>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Alert>
          <AlertDescription>
            Vehicle not found. Please check the URL and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/vehicles/${vehicleId}`)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Vehicle</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Basic Information</h1>
            <p className="text-muted-foreground">
              Update basic vehicle details for {vehicle.make} {vehicle.model} ({vehicle.vin})
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="mb-6">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Error Messages */}
      {errors.fetch && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{errors.fetch}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Car className="h-5 w-5" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* VIN */}
              <div className="space-y-2">
                <Label htmlFor="vin">VIN *</Label>
                <Input
                  id="vin"
                  value={formData.vin}
                  onChange={(e) => handleInputChange('vin', e.target.value)}
                  placeholder="Enter VIN"
                  className={errors.vin ? 'border-red-500' : ''}
                />
                {errors.vin && <p className="text-sm text-red-500">{errors.vin}</p>}
              </div>

              {/* Make */}
              <div className="space-y-2">
                <Label htmlFor="make">Make *</Label>
                <Select value={formData.make} onValueChange={(value) => handleInputChange('make', value)}>
                  <SelectTrigger className={errors.make ? 'border-red-500 w-full' : 'w-full'}>
                    <SelectValue placeholder="Select make" />
                  </SelectTrigger>
                  <SelectContent>
                    {makes.map((make) => (
                      <SelectItem key={make.id} value={make.name}>
                        {make.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.make && <p className="text-sm text-red-500">{errors.make}</p>}
              </div>

              {/* Model */}
              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Select 
                  value={formData.model} 
                  onValueChange={(value) => handleInputChange('model', value)}
                  disabled={!formData.make}
                >
                  <SelectTrigger className={errors.model ? 'border-red-500 w-full' : 'w-full'}>
                    <SelectValue placeholder={formData.make ? "Select model" : "Select make first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.make && getModelsForMake(formData.make).map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.model && <p className="text-sm text-red-500">{errors.model}</p>}
              </div>

              {/* Year */}
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formatNumberValue(formData.year)}
                  onChange={(e) => handleInputChange('year', e.target.value === '' ? '' : (parseInt(e.target.value) || ''))}
                  placeholder="Enter year"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className={errors.year ? 'border-red-500' : ''}
                />
                {errors.year && <p className="text-sm text-red-500">{errors.year}</p>}
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label htmlFor="color">Color *</Label>
                <Select value={formData.color} onValueChange={(value) => handleInputChange('color', value)}>
                  <SelectTrigger className={errors.color ? 'border-red-500 w-full' : 'w-full'}>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color.id} value={color.name}>
                        {color.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.color && <p className="text-sm text-red-500">{errors.color}</p>}
              </div>

              {/* Trim */}
              <div className="space-y-2">
                <Label htmlFor="trim">Trim</Label>
                <Input
                  id="trim"
                  value={formData.trim}
                  onChange={(e) => handleInputChange('trim', e.target.value)}
                  placeholder="Enter trim"
                />
              </div>

              {/* Engine Type */}
              <div className="space-y-2">
                <Label htmlFor="engineType">Engine Type</Label>
                <Input
                  id="engineType"
                  value={formData.engineType}
                  onChange={(e) => handleInputChange('engineType', e.target.value)}
                  placeholder="Enter engine type"
                />
              </div>

              {/* Fuel Type */}
              <div className="space-y-2">
                <Label htmlFor="fuelType">Fuel Type *</Label>
                <Select value={formData.fuelType} onValueChange={(value) => handleInputChange('fuelType', value)}>
                  <SelectTrigger className={errors.fuelType ? 'border-red-500 w-full' : 'w-full'}>
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gasoline">Gasoline</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
                {errors.fuelType && <p className="text-sm text-red-500">{errors.fuelType}</p>}
              </div>

              {/* Transmission */}
              <div className="space-y-2">
                <Label htmlFor="transmission">Transmission</Label>
                <Select value={formData.transmission || ''} onValueChange={(value) => handleInputChange('transmission', value || undefined)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select transmission" />
                  </SelectTrigger>
                  <SelectContent>
                    {transmissions.map((transmission) => (
                      <SelectItem key={transmission.id} value={transmission.name}>
                        {transmission.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <Label htmlFor="weightKg">Weight (kg) *</Label>
                <Input
                  id="weightKg"
                  type="number"
                  value={formatNumberValue(formData.weightKg)}
                  onChange={(e) => handleInputChange('weightKg', e.target.value)}
                  placeholder="Enter weight"
                  min="0"
                  step="0.1"
                  className={errors.weightKg ? 'border-red-500' : ''}
                />
                {errors.weightKg && <p className="text-sm text-red-500">{errors.weightKg}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dimensions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Dimensions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Length */}
              <div className="space-y-2">
                <Label htmlFor="lengthMm">Length (mm)</Label>
                <Input
                  id="lengthMm"
                  type="number"
                  value={formatNumberValue(formData.lengthMm)}
                  onChange={(e) => handleInputChange('lengthMm', e.target.value)}
                  placeholder="Enter length"
                  min="0"
                />
              </div>

              {/* Width */}
              <div className="space-y-2">
                <Label htmlFor="widthMm">Width (mm)</Label>
                <Input
                  id="widthMm"
                  type="number"
                  value={formatNumberValue(formData.widthMm)}
                  onChange={(e) => handleInputChange('widthMm', e.target.value)}
                  placeholder="Enter width"
                  min="0"
                />
              </div>

              {/* Height */}
              <div className="space-y-2">
                <Label htmlFor="heightMm">Height (mm)</Label>
                <Input
                  id="heightMm"
                  type="number"
                  value={formatNumberValue(formData.heightMm)}
                  onChange={(e) => handleInputChange('heightMm', e.target.value)}
                  placeholder="Enter height"
                  min="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dates and Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Dates and Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Order Date */}
              <div className="space-y-2">
                <Label htmlFor="orderDate">Order Date</Label>
                <Input
                  id="orderDate"
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => handleInputChange('orderDate', e.target.value)}
                />
              </div>

              {/* Estimated Delivery */}
              <div className="space-y-2">
                <Label htmlFor="estimatedDelivery">Estimated Delivery</Label>
                <Input
                  id="estimatedDelivery"
                  type="date"
                  value={formData.estimatedDelivery}
                  onChange={(e) => handleInputChange('estimatedDelivery', e.target.value)}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger className={errors.status ? 'border-red-500 w-full' : 'w-full'}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ORDERED">Ordered</SelectItem>
                    <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                    <SelectItem value="CLEARING_CUSTOMS">Clearing Customs</SelectItem>
                    <SelectItem value="AT_PORT">At Port</SelectItem>
                    <SelectItem value="IN_LOCAL_DELIVERY">In Local Delivery</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location and Owner Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Location and Owner</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Location */}
              <div className="space-y-2">
                <Label htmlFor="currentLocationId">Current Location *</Label>
                <Select value={formData.currentLocationId} onValueChange={(value) => handleInputChange('currentLocationId', value)}>
                  <SelectTrigger className={errors.currentLocationId ? 'border-red-500 w-full' : 'w-full'}>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name || 'Unknown Location'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.currentLocationId && <p className="text-sm text-red-500">{errors.currentLocationId}</p>}
              </div>

              {/* Owner */}
              <div className="space-y-2">
                <Label htmlFor="ownerId">Owner</Label>
                <Select value={formData.ownerId} onValueChange={(value) => handleInputChange('ownerId', value)}>
                  <SelectTrigger className={errors.ownerId ? 'border-red-500 w-full' : 'w-full'}>
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {owners.map((owner) => (
                      <SelectItem key={owner.id} value={owner.id}>
                        {owner.name} ({owner.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.ownerId && <p className="text-sm text-red-500">{errors.ownerId}</p>}
              </div>

              {/* Source */}
              <div className="space-y-2">
                <Label htmlFor="sourceId">Source *</Label>
                <Select value={formData.sourceId || ''} onValueChange={(value) => handleInputChange('sourceId', value)}>
                  <SelectTrigger className={errors.sourceId ? 'border-red-500 w-full' : 'w-full'}>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map((source) => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.sourceId && <p className="text-sm text-red-500">{errors.sourceId}</p>}
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Vehicle Images Card */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image Upload */}
            <div className="flex items-center gap-4">
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png"
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
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="space-y-2">
                <Label>Existing Images</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden border">
                        <img
                          src={image.url}
                          alt={image.alt || `Vehicle image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeExistingImage(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* New Images Preview */}
            {images.length > 0 && (
              <div className="space-y-2">
                <Label>New Images to Upload</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Error */}
        {errors.submit && (
          <Alert variant="destructive">
            <AlertDescription>{errors.submit}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/vehicles/${vehicleId}`)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditBasicInfo;
