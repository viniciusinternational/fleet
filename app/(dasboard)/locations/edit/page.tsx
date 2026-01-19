'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  MapPin, 
  Building, 
  Ship, 
  Warehouse, 
  FileText, 
  Phone, 
  Mail, 
  User, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Globe, 
  Calendar, 
  Truck, 
  Navigation,
  Save,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { LocationType, LocationStatus } from '@/types';

interface FormData {
  name: string;
  type: LocationType;
  status: LocationStatus;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  contactName: string;
  phone: string;
  email: string;
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

const EditLocation: React.FC = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: 'Port',
    status: 'Active',
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    latitude: '',
    longitude: '',
    contactName: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      if (!id) return;
      
      try {
        setIsLoadingData(true);
        const response = await fetch(`/api/locations/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch location');
        }
        
        const location = await response.json();
        
        // Populate form with location data
        setFormData({
          name: location.name,
          type: location.type,
          status: location.status,
          street: location.street,
          city: location.city,
          state: location.state || '',
          country: location.country,
          postalCode: location.postalCode || '',
          latitude: location.latitude.toString(),
          longitude: location.longitude.toString(),
          contactName: location.contactName || '',
          phone: location.contactPhone || '',
          email: location.contactEmail || '',
          notes: location.notes || ''
        });
      } catch (error) {
        console.error('Error fetching location:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchLocation();
  }, [id]);

  const locationTypes = [
    { value: 'Port', label: 'Port' },
    { value: 'Warehouse', label: 'Warehouse' },
    { value: 'Customs Office', label: 'Customs Office' },
    { value: 'Dealership', label: 'Dealership' },
    { value: 'Delivery Point', label: 'Delivery Point' }
  ];

  const locationStatuses = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' }
  ];

  const countries = [
    { value: 'USA', label: 'United States' },
    { value: 'Canada', label: 'Canada' },
    { value: 'Mexico', label: 'Mexico' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'Germany', label: 'Germany' },
    { value: 'France', label: 'France' },
    { value: 'Japan', label: 'Japan' },
    { value: 'China', label: 'China' },
    { value: 'Australia', label: 'Australia' }
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Location name is required';
    }

    if (!formData.street.trim()) {
      newErrors.street = 'Street address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    if (!formData.latitude.trim()) {
      newErrors.latitude = 'Latitude is required';
    } else if (isNaN(Number(formData.latitude))) {
      newErrors.latitude = 'Latitude must be a valid number';
    }

    if (!formData.longitude.trim()) {
      newErrors.longitude = 'Longitude is required';
    } else if (isNaN(Number(formData.longitude))) {
      newErrors.longitude = 'Longitude must be a valid number';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !id) {
      return;
    }

    setIsLoading(true);

    try {
      const locationData = {
        name: formData.name,
        type: formData.type,
        status: formData.status,
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postalCode: formData.postalCode,
        contactName: formData.contactName,
        contactPhone: formData.phone,
        contactEmail: formData.email,
        notes: formData.notes
      };

      const response = await fetch(`/api/locations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update location');
      }

      // Navigate back to location detail
      router.push(`/locations/${id}`);
    } catch (error) {
      console.error('Failed to update location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/locations/${id}`);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
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

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading location data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                className="hover:bg-accent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Location
              </Button>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Edit Location</h1>
                <p className="text-muted-foreground mt-1 text-lg">Update location information and details</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline"
                onClick={handleCancel}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Location Overview Banner */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Building className="h-6 w-6" />
                <span>Location Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Location Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter location name"
                    className={errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Location Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger className={errors.type ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-red-600">{errors.type}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className={errors.status ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locationStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-600">{errors.status}</p>
                  )}
                </div>
                <div className="flex items-end">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    Location ID: {id}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="bg-muted/50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <MapPin className="h-5 w-5" />
                <span>Address Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    placeholder="Enter street address"
                    className={errors.street ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
                  />
                  {errors.street && (
                    <p className="text-sm text-red-600">{errors.street}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Enter city"
                    className={errors.city ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-600">{errors.city}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="Enter state or province"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    placeholder="Enter postal code"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                    <SelectTrigger className={errors.country ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.country && (
                    <p className="text-sm text-red-600">{errors.country}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coordinates */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="bg-muted/50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Navigation className="h-5 w-5" />
                <span>Coordinates</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.000001"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange('latitude', e.target.value)}
                    placeholder="Enter latitude"
                    className={errors.latitude ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''}
                  />
                  {errors.latitude && (
                    <p className="text-sm text-destructive">{errors.latitude}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.000001"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange('longitude', e.target.value)}
                    placeholder="Enter longitude"
                    className={errors.longitude ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''}
                  />
                  {errors.longitude && (
                    <p className="text-sm text-destructive">{errors.longitude}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-center gap-2 text-foreground">
                  <Navigation className="h-4 w-4" />
                  <span className="text-sm font-medium">Coordinate Preview</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.latitude && formData.longitude 
                    ? `${formData.latitude}, ${formData.longitude}`
                    : 'Enter coordinates to see preview'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="bg-muted/50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <User className="h-5 w-5" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    placeholder="Enter contact name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    className={errors.email ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="bg-muted/50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <FileText className="h-5 w-5" />
                <span>Additional Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Enter any additional notes about this location"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <Button variant="outline" onClick={handleCancel} type="button">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLocation;
