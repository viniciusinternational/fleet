'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  FileText,
  CheckCircle,
  CheckCircle2
} from 'lucide-react';
import type { Owner } from '@/types';

const AddOwner: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    nationality: 'Nigerian',
    idNumber: ''
  });

  const handleInputChange = (field: string, value: string) => {
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.nationality.trim()) {
      newErrors.nationality = 'Nationality is required';
    }

    if (!formData.idNumber.trim()) {
      newErrors.idNumber = 'ID Number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/owners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create owner');
      }

      if (result.success) {
        setShowSuccess(true);
        
        // Redirect to owners list after 2 seconds
        setTimeout(() => {
          router.push('/admin/owners');
        }, 2000);
      } else {
        throw new Error(result.error || 'Failed to create owner');
      }

    } catch (error) {
      console.error('Error adding owner:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add owner. Please try again.';
      setErrors({ submit: errorMessage });
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/owners')}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Add New Owner</h1>
              <p className="text-muted-foreground mt-2">Fill out the required information to add a new vehicle owner</p>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {showSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Owner added successfully! Redirecting to owners list...
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {errors.submit && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {errors.submit}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Owner Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter full name"
                      className="pl-10"
                      required
                    />
                  </div>
                  {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email address"
                      className="pl-10"
                      required
                    />
                  </div>
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                      className="pl-10"
                      required
                    />
                  </div>
                  {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality *</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nationality"
                      value={formData.nationality}
                      onChange={(e) => handleInputChange('nationality', e.target.value)}
                      placeholder="Enter nationality"
                      className="pl-10"
                      required
                    />
                  </div>
                  {errors.nationality && <p className="text-sm text-red-600">{errors.nationality}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idNumber">ID Number *</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="idNumber"
                      value={formData.idNumber}
                      onChange={(e) => handleInputChange('idNumber', e.target.value)}
                      placeholder="Enter ID number"
                      className="pl-10"
                      required
                    />
                  </div>
                  {errors.idNumber && <p className="text-sm text-red-600">{errors.idNumber}</p>}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter complete address"
                    className="pl-10 min-h-[100px]"
                    required
                  />
                </div>
                {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/owners')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding Owner...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Add Owner
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default AddOwner;
