'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { 
  Users, 
  User, 
  MapPin, 
  Shield, 
  Building2, 
  FileText, 
  Package,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowLeft,
  CheckCircle2,
  Mail,
  Phone,
  Calendar,
  Globe,
  Lock,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { Role, LocationType } from '@/types';
import type { User as UserType, Location } from '@/types';

const EditUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state - matching User schema from Prisma
  const [formData, setFormData] = useState({
    // Required fields from User interface
    fullname: '',
    phone: '',
    email: '',
    role: 'Normal' as Role,
    locationId: '', // Will be converted to Location object
    isActive: true,
    
    // Optional fields from User interface
    avatar: '',
    password: '', // For password change (optional)
    confirmPassword: '', // For validation
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  // Fetch user data from API
  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/users/${id}`, {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('User not found');
          }
          throw new Error('Failed to fetch user');
        }
        
        const userData = await response.json();
        setUser(userData);
        
        // Update form data when user is loaded
        setFormData({
          // Required fields from User interface
          fullname: userData.fullname || '',
          phone: userData.phone || '',
          email: userData.email || '',
          role: userData.role || 'Normal',
          locationId: userData.location?.id || '',
          isActive: userData.isActive ?? true,
          
          // Optional fields from User interface
          avatar: userData.avatar || '',
          password: '', // For password change (optional)
          confirmPassword: '', // For validation
        });
      } catch (error) {
        console.error('Error fetching user:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch user');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // Fetch locations from API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`/api/locations?limit=100`, {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch locations');
        }
        
        const data = await response.json();
        setLocations(data.locations || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setLocations([]);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    fetchLocations();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-4">Loading User...</h2>
          <p className="text-muted-foreground">Please wait while we fetch user details.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Error Loading User</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.push('/admin/users')}>
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">User Not Found</h2>
          <p className="text-muted-foreground mb-6">The user you're trying to edit doesn't exist.</p>
          <Button onClick={() => router.push('/admin/users')}>
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

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


  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields from User interface
    if (!formData.fullname.trim()) {
      newErrors.fullname = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.locationId || formData.locationId === 'loading' || formData.locationId === 'no-locations') {
      newErrors.locationId = 'Location is required';
    }

    // Only validate password if it's being changed
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      // Validate location selection
      if (!formData.locationId || formData.locationId === 'loading' || formData.locationId === 'no-locations') {
        setErrors({ locationId: 'Please select a valid location' });
        setIsSubmitting(false);
        return;
      }

      // Find the selected location
      const selectedLocation = locations.find(loc => loc.id === formData.locationId);
      
      if (!selectedLocation) {
        setErrors({ locationId: 'Selected location not found' });
        setIsSubmitting(false);
        return;
      }

      // Prepare update data - only include password if it's being changed
      const updateData: any = {
        fullname: formData.fullname,
        phone: formData.phone,
        email: formData.email,
        role: formData.role,
        locationId: formData.locationId,
        isActive: formData.isActive,
        avatar: formData.avatar || undefined,
      };

      // Only include password if it's being changed
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/admin/users');
      }, 2000);
    } catch (error) {
      console.error('Failed to update user:', error);
      setError(error instanceof Error ? error.message : 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case 'Admin':
        return 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200';
      case 'CEO':
        return 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200';
      case 'Normal':
        return 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'Admin':
        return <Shield className="h-4 w-4" />;
      case 'CEO':
        return <Building2 className="h-4 w-4" />;
      case 'Normal':
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

    return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/users')}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
              <p className="text-muted-foreground mt-2">Update user information and settings</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              User updated successfully! Redirecting to user list...
            </AlertDescription>
          </Alert>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullname">Full Name *</Label>
                  <Input
                    id="fullname"
                    placeholder="Enter full name"
                    value={formData.fullname}
                    onChange={(e) => handleInputChange('fullname', e.target.value)}
                    className={errors.fullname ? 'border-red-500' : ''}
                  />
                  {errors.fullname && (
                    <p className="text-sm text-red-500">{errors.fullname}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={formData.role} onValueChange={(value: Role) => handleInputChange('role', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Normal">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Normal User
                        </div>
                      </SelectItem>
                      <SelectItem value="Admin">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Administrator
                        </div>
                      </SelectItem>
                      <SelectItem value="CEO">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          CEO
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locationId">Assigned Location *</Label>
                  <Select value={formData.locationId} onValueChange={(value) => handleInputChange('locationId', value)}>
                    <SelectTrigger className={errors.locationId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingLocations ? (
                        <SelectItem value="loading" disabled>
                          Loading locations...
                        </SelectItem>
                      ) : locations.length > 0 ? (
                        locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {location.name} - {location.type}
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-locations" disabled>
                          No locations available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.locationId && (
                    <p className="text-sm text-red-500">{errors.locationId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar URL (Optional)</Label>
                  <Input
                    id="avatar"
                    placeholder="Enter avatar URL"
                    value={formData.avatar}
                    onChange={(e) => handleInputChange('avatar', e.target.value)}
                  />
                </div>
              </div>

              {/* Authentication */}
              <div className="space-y-4">
                <h4 className="font-medium">Authentication</h4>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Leave password fields empty if you don't want to change the password.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter new password (optional)"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password}</p>
                    )}
                    <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <Label htmlFor="isActive">User is active</Label>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/users')}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update User
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
