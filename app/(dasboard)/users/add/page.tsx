'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  MapPin, 
  Shield, 
  Crown,
  UserCheck,
  ArrowLeft,
  CheckCircle2,
  Save,
  X,
  Search
} from 'lucide-react';
import { Role } from '@/types';
import type { Location, ZitadelUser, UserPermissions } from '@/types';
import { PermissionManager } from '@/components/users/permission-manager';
import { useAuthStore } from '@/store/auth';
import { hasPermission } from '@/lib/permissions';

const AddUser: React.FC = () => {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [zitadelUsers, setZitadelUsers] = useState<ZitadelUser[]>([]);
  const [isLoadingZitadelUsers, setIsLoadingZitadelUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZitadelUser, setSelectedZitadelUser] = useState<ZitadelUser | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    zitadelUserId: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    role: 'Normal' as Role,
    locationId: '',
    isActive: true,
  });

  // Permissions state - initialize all to false
  const [permissions, setPermissions] = useState<UserPermissions>({
    view_dashboard: false,
    view_vehicles: false,
    add_vehicles: false,
    edit_vehicles: false,
    delete_vehicles: false,
    view_users: false,
    add_users: false,
    edit_users: false,
    delete_users: false,
    view_owners: false,
    add_owners: false,
    edit_owners: false,
    delete_owners: false,
    view_sources: false,
    add_sources: false,
    edit_sources: false,
    delete_sources: false,
    view_locations: false,
    add_locations: false,
    edit_locations: false,
    delete_locations: false,
    view_delivery: false,
    add_delivery: false,
    edit_delivery: false,
    view_tracking: false,
    view_analytics: false,
    view_reports: false,
    view_chatbot: false,
  });

  // Check if current user has permission to add users
  if (!currentUser || !hasPermission(currentUser, 'add_users')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">You don't have permission to add users.</p>
          <Button onClick={() => router.push('/users')}>
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch Zitadel users
  useEffect(() => {
    const fetchZitadelUsers = async () => {
      try {
        setIsLoadingZitadelUsers(true);
        const response = await fetch(`/api/users/zitadel?limit=100${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch Zitadel users');
        }
        
        const data = await response.json();
        if (data.ok && data.data) {
          setZitadelUsers(data.data);
        }
      } catch (error) {
        console.error('Error fetching Zitadel users:', error);
        setZitadelUsers([]);
      } finally {
        setIsLoadingZitadelUsers(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchZitadelUsers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

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

  // Handle Zitadel user selection
  const handleZitadelUserSelect = (userId: string) => {
    const user = zitadelUsers.find(u => u.id === userId);
    if (user) {
      setSelectedZitadelUser(user);
      setFormData(prev => ({
        ...prev,
        zitadelUserId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      }));
      // Clear errors for these fields
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.firstName;
        delete newErrors.lastName;
        delete newErrors.email;
        return newErrors;
      });
    }
  };

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

    if (!formData.zitadelUserId) {
      newErrors.zitadelUserId = 'Please select a Zitadel user by email';
      newErrors.email = 'Please select a Zitadel user by email';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.locationId || formData.locationId === 'loading' || formData.locationId === 'no-locations') {
      newErrors.locationId = 'Location is required';
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

      // Create user via API
      const response = await fetch(`/api/users/zitadel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zitadelUserId: formData.zitadelUserId,
          phone: formData.phone,
          locationId: formData.locationId,
          role: formData.role,
          permissions: permissions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      const result = await response.json();
      console.log('Created user:', result);
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/users');
      }, 2000);
    } catch (error) {
      console.error('Failed to create user:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create user'
      });
    } finally {
      setIsSubmitting(false);
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
              onClick={() => router.push('/users')}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Add New User</h1>
              <p className="text-muted-foreground mt-2">Create a new user account from Zitadel authentication system</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              User created successfully! Redirecting to user list...
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {errors.submit && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {errors.submit}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Dropdown (Zitadel User Selection) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address (Select from Zitadel) *</Label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by email, name, or username..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select 
                    value={formData.zitadelUserId} 
                    onValueChange={handleZitadelUserSelect}
                  >
                    <SelectTrigger className={errors.zitadelUserId || errors.email ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a Zitadel user by email">
                        {selectedZitadelUser ? selectedZitadelUser.email : 'Select a user'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingZitadelUsers ? (
                        <SelectItem value="loading" disabled>
                          Loading Zitadel users...
                        </SelectItem>
                      ) : zitadelUsers.length > 0 ? (
                        zitadelUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{user.email}</span>
                              <span className="text-xs text-muted-foreground">
                                {user.firstName} {user.lastName} ({user.preferredUsername})
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-users" disabled>
                          No Zitadel users found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {(errors.zitadelUserId || errors.email) && (
                  <p className="text-sm text-red-500">{errors.zitadelUserId || errors.email}</p>
                )}
              </div>

              {/* Auto-filled fields (read-only) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    readOnly
                    disabled
                    className="bg-muted"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    readOnly
                    disabled
                    className="bg-muted"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName}</p>
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
                          <UserCheck className="h-4 w-4" />
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
                          <Crown className="h-4 w-4" />
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

              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  User information will be automatically filled from Zitadel. Please provide phone number and select location.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Permissions Section */}
          <PermissionManager
            permissions={permissions}
            onChange={setPermissions}
          />

          {/* Form Actions */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => router.push('/users')}
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
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
