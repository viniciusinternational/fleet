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
  Upload
} from 'lucide-react';
import { VehicleStatus, LocationType } from '@/types';
import type { Vehicle, Owner, Location } from '@/types';

const EditBasicInfo: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);

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
    weightKg: 0,
    lengthMm: 0,
    widthMm: 0,
    heightMm: 0,
    orderDate: '',
    estimatedDelivery: '',
    status: 'ORDERED' as VehicleStatus,
    currentLocationId: '',
    ownerId: ''
  });

  // Image state
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);

  // Fetch vehicle data and form options
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [vehicleResponse, locationsResponse, ownersResponse] = await Promise.all([
          fetch(`/api/vehicles/${vehicleId}`),
          fetch('/api/locations?limit=1000'),
          fetch('/api/owners?limit=1000'),
        ]);
        
        if (!vehicleResponse.ok || !locationsResponse.ok || !ownersResponse.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const [vehicleResult, locationsResult, ownersResult] = await Promise.all([
          vehicleResponse.json(),
          locationsResponse.json(),
          ownersResponse.json(),
        ]);
        
        // Set vehicle data
        if (vehicleResult) {
          setVehicle(vehicleResult);
          setFormData({
            vin: vehicleResult.vin || '',
            make: vehicleResult.make || '',
            model: vehicleResult.model || '',
            year: vehicleResult.year || new Date().getFullYear(),
            color: vehicleResult.color || '',
            trim: vehicleResult.trim || '',
            engineType: vehicleResult.engineType || '',
            fuelType: vehicleResult.fuelType || 'Gasoline',
            weightKg: vehicleResult.weightKg || 0,
            lengthMm: vehicleResult.lengthMm || 0,
            widthMm: vehicleResult.widthMm || 0,
            heightMm: vehicleResult.heightMm || 0,
            orderDate: vehicleResult.orderDate ? new Date(vehicleResult.orderDate).toISOString().split('T')[0] : '',
            estimatedDelivery: vehicleResult.estimatedDelivery ? new Date(vehicleResult.estimatedDelivery).toISOString().split('T')[0] : '',
            status: vehicleResult.status || 'ORDERED',
            currentLocationId: vehicleResult.currentLocationId || '',
            ownerId: vehicleResult.ownerId || ''
          });
          
          // Set existing images
          if (vehicleResult.images && vehicleResult.images.length > 0) {
            setExistingImages(vehicleResult.images);
          }
        }
        
        // Set locations and owners
        if (locationsResult.locations && ownersResult.success) {
          setLocations(locationsResult.locations);
          setOwners(ownersResult.data.owners);
        } else {
          throw new Error('Failed to load locations and owners');
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
      formDataToSubmit.append('year', formData.year.toString());
      formDataToSubmit.append('color', formData.color);
      formDataToSubmit.append('trim', formData.trim);
      formDataToSubmit.append('engineType', formData.engineType);
      formDataToSubmit.append('fuelType', formData.fuelType);
      formDataToSubmit.append('weightKg', formData.weightKg.toString());
      formDataToSubmit.append('lengthMm', formData.lengthMm.toString());
      formDataToSubmit.append('widthMm', formData.widthMm.toString());
      formDataToSubmit.append('heightMm', formData.heightMm.toString());
      formDataToSubmit.append('orderDate', formData.orderDate ? new Date(formData.orderDate).toISOString() : '');
      formDataToSubmit.append('estimatedDelivery', formData.estimatedDelivery ? new Date(formData.estimatedDelivery).toISOString() : '');
      formDataToSubmit.append('status', formData.status);
      formDataToSubmit.append('currentLocationId', formData.currentLocationId);
      formDataToSubmit.append('ownerId', formData.ownerId);
      
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
        router.push(`/admin/vehicles/${vehicleId}`);
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
            onClick={() => router.push(`/admin/vehicles/${vehicleId}`)}
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
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => handleInputChange('make', e.target.value)}
                  placeholder="Enter make"
                  className={errors.make ? 'border-red-500' : ''}
                />
                {errors.make && <p className="text-sm text-red-500">{errors.make}</p>}
              </div>

              {/* Model */}
              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder="Enter model"
                  className={errors.model ? 'border-red-500' : ''}
                />
                {errors.model && <p className="text-sm text-red-500">{errors.model}</p>}
              </div>

              {/* Year */}
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
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
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="Enter color"
                  className={errors.color ? 'border-red-500' : ''}
                />
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
                  <SelectTrigger className={errors.fuelType ? 'border-red-500' : ''}>
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

              {/* Weight */}
              <div className="space-y-2">
                <Label htmlFor="weightKg">Weight (kg) *</Label>
                <Input
                  id="weightKg"
                  type="number"
                  value={formData.weightKg}
                  onChange={(e) => handleInputChange('weightKg', parseFloat(e.target.value))}
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
                  value={formData.lengthMm}
                  onChange={(e) => handleInputChange('lengthMm', parseInt(e.target.value))}
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
                  value={formData.widthMm}
                  onChange={(e) => handleInputChange('widthMm', parseInt(e.target.value))}
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
                  value={formData.heightMm}
                  onChange={(e) => handleInputChange('heightMm', parseInt(e.target.value))}
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
                  <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Location */}
              <div className="space-y-2">
                <Label htmlFor="currentLocationId">Current Location *</Label>
                <Select value={formData.currentLocationId} onValueChange={(value) => handleInputChange('currentLocationId', value)}>
                  <SelectTrigger className={errors.currentLocationId ? 'border-red-500' : ''}>
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
                <Label htmlFor="ownerId">Owner *</Label>
                <Select value={formData.ownerId} onValueChange={(value) => handleInputChange('ownerId', value)}>
                  <SelectTrigger className={errors.ownerId ? 'border-red-500' : ''}>
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
            onClick={() => router.push(`/admin/vehicles/${vehicleId}`)}
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
