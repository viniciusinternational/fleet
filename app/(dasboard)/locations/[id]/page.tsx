'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Edit,
  Trash2,
  ExternalLink,
  Users,
  Package,
  Activity,
  Info,
  Settings,
  Building2,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Globe as GlobeIcon,
  Clock as ClockIcon,
  AlertTriangle,
  Wrench
} from 'lucide-react';
import { LocationType, LocationStatus } from '@/types';
import type { User, Vehicle } from '@/types';
import { MetricCard } from '@/components/dashboard/metric-card';

const LocationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const [usersAtLocation, setUsersAtLocation] = useState<User[]>([]);
  const [vehiclesAtLocation, setVehiclesAtLocation] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to safely access location address data
  const getLocationAddress = (location: any) => {
    // Handle both flat structure (from API) and nested structure (from mock data)
    if (location?.address) {
      return {
        street: location.address.street || '',
        city: location.address.city || '',
        state: location.address.state || '',
        country: location.address.country || '',
        postalCode: location.address.postalCode || ''
      };
    } else {
      // Fallback for flat structure from API
      return {
        street: location?.street || '',
        city: location?.city || '',
        state: location?.state || '',
        country: location?.country || '',
        postalCode: location?.postalCode || ''
      };
    }
  };

  // Helper function to safely access location coordinates
  const getLocationCoordinates = (location: any) => {
    // Handle both flat structure (from API) and nested structure (from mock data)
    if (location?.coordinates) {
      return {
        latitude: location.coordinates.latitude || 0,
        longitude: location.coordinates.longitude || 0
      };
    } else {
      // Fallback for flat structure from API
      return {
        latitude: location?.latitude || 0,
        longitude: location?.longitude || 0
      };
    }
  };

  // Helper function to safely access location contact details
  const getLocationContactDetails = (location: any): { contactName: string; phone: string; email: string } => {
    // Handle both flat structure (from API) and nested structure (from mock data)
    if (location?.contactDetails) {
      return {
        contactName: location.contactDetails.contactName || '',
        phone: location.contactDetails.phone || '',
        email: location.contactDetails.email || ''
      };
    } else {
      // Fallback for flat structure from API
      return {
        contactName: location?.contactName || '',
        phone: location?.contactPhone || '',
        email: location?.contactEmail || ''
      };
    }
  };

  useEffect(() => {
    const fetchLocation = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/locations/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setLocation(null);
            return;
          }
          throw new Error('Failed to fetch location');
        }
        
        const locationData = await response.json();
        setLocation(locationData);
      } catch (error) {
        console.error('Error fetching location:', error);
        setLocation(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocation();
  }, [id]);

  // Fetch users at this location
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`/api/users?limit=1000`);
        if (response.ok) {
          const data = await response.json();
          const filtered = (data.users || []).filter((user: User) => user.location.id === id);
          setUsersAtLocation(filtered);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    if (id) {
      fetchUsers();
    }
  }, [id]);

  // Fetch vehicles at this location
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch(`/api/vehicles?limit=1000`);
        if (response.ok) {
          const data = await response.json();
          const filtered = (data.vehicles || []).filter((vehicle: Vehicle) => vehicle.currentLocation.id === id);
          setVehiclesAtLocation(filtered);
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      }
    };
    if (id) {
      fetchVehicles();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading location details...</p>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Location Not Found</h2>
          <p className="text-muted-foreground mb-6">The location you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/locations')}>
            Back to Locations
          </Button>
        </div>
      </div>
    );
  }

  const getTypeIcon = (type: LocationType) => {
    switch (type) {
      case 'Port':
        return <Ship className="h-6 w-6" />;
      case 'Warehouse':
        return <Warehouse className="h-6 w-6" />;
      case 'Customs Office':
        return <Building className="h-6 w-6" />;
      case 'Dealership':
        return <Truck className="h-6 w-6" />;
      case 'Delivery Point':
        return <Package className="h-6 w-6" />;
      default:
        return <MapPin className="h-6 w-6" />;
    }
  };

  const getTypeColor = (type: LocationType) => {
    switch (type) {
      case 'Port':
        return 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200 dark:from-blue-950 dark:to-blue-900 dark:text-blue-300 dark:border-blue-700';
      case 'Warehouse':
        return 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200 dark:from-green-950 dark:to-green-900 dark:text-green-300 dark:border-green-700';
      case 'Customs Office':
        return 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200 dark:from-purple-950 dark:to-purple-900 dark:text-purple-300 dark:border-purple-700';
      case 'Dealership':
        return 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border-orange-200 dark:from-orange-950 dark:to-orange-900 dark:text-orange-300 dark:border-orange-700';
      case 'Delivery Point':
        return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 dark:from-gray-950 dark:to-gray-900 dark:text-gray-300 dark:border-gray-700';
      default:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 dark:from-gray-950 dark:to-gray-900 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getStatusColor = (status: LocationStatus) => {
    switch (status) {
      case 'Operational':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-700';
      case 'Temporarily Closed':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-700';
      case 'Under Maintenance':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status: LocationStatus) => {
    switch (status) {
      case 'Operational':
        return <CheckCircle className="h-4 w-4" />;
      case 'Temporarily Closed':
        return <AlertTriangle className="h-4 w-4" />;
      case 'Under Maintenance':
        return <Wrench className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const openDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteLocation = async () => {
    try {
      const response = await fetch(`/api/locations/${location.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete location');
      }

      router.push('/locations');
    } catch (error) {
      console.error('Failed to delete location:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin/locations')}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">{location.name}</h1>
                <p className="text-muted-foreground mt-2 text-lg">Location Details & Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/locations/edit?id=${location.id}`)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Location
              </Button>
              <Button
                variant="destructive"
                onClick={openDeleteDialog}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Location Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  {React.cloneElement(getTypeIcon(location.type) as React.ReactElement, { className: 'h-8 w-8 text-primary' })}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{location.name}</h2>
                    <Badge variant="outline" className={`${getTypeColor(location.type)} text-sm px-3 py-1`}>
                      {getTypeIcon(location.type)}
                      <span className="ml-1">{location.type}</span>
                    </Badge>
                    <Badge variant="outline" className={`${getStatusColor(location.status)} text-sm px-3 py-1`}>
                      {getStatusIcon(location.status)}
                      <span className="ml-2">{location.status}</span>
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{getLocationAddress(location).city}, {getLocationAddress(location).country}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{usersAtLocation.length} users assigned</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span>{vehiclesAtLocation.length} vehicles at location</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Vehicles
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Location Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Type</label>
                      <Badge variant="outline" className={`${getTypeColor(location.type)} text-sm px-2 py-1 mt-1`}>
                        {getTypeIcon(location.type)}
                        <span className="ml-1">{location.type}</span>
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <Badge variant="outline" className={`${getStatusColor(location.status)} text-sm px-2 py-1 mt-1`}>
                        {getStatusIcon(location.status)}
                        <span className="ml-1">{location.status}</span>
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">City</label>
                      <p className="text-sm">{getLocationAddress(location).city}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Country</label>
                      <p className="text-sm">{getLocationAddress(location).country}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location Statistics */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MetricCard
                    title="Users Assigned"
                    value={usersAtLocation.length}
                    icon={Users}
                    variant="blue"
                  />
                  <MetricCard
                    title="Vehicles"
                    value={vehiclesAtLocation.length}
                    icon={Truck}
                    variant="green"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MetricCard
                    title="Operational"
                    value={location.status === 'Operational' ? 'Yes' : 'No'}
                    icon={CheckCircle}
                    variant="purple"
                  />
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-sm text-muted-foreground mb-1">Last Updated</div>
                      <div className="text-lg font-semibold text-foreground">
                        {formatDateTime(location.lastUpdated)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Notes</label>
                    <p className="text-sm mt-1">{location.notes || 'No additional notes available.'}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Coordinates</label>
                      <p className="text-sm mt-1">{getLocationCoordinates(location).latitude}, {getLocationCoordinates(location).longitude}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Postal Code</label>
                      <p className="text-sm mt-1">{getLocationAddress(location).postalCode || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Users at this Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usersAtLocation.length > 0 ? (
                  <div className="space-y-4">
                    {usersAtLocation.map((user) => (
                      <div key={user.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {((user.firstName?.[0] || '') + (user.lastName?.[0] || '')).toUpperCase()}
                    </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          <div className="text-xs text-muted-foreground">{user.phone}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {user.role}
                          </Badge>
                          <Badge variant={user.isActive ? "default" : "secondary"} className="text-xs">
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No users are currently assigned to this location</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Vehicles at this Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                {vehiclesAtLocation.length > 0 ? (
                  <div className="space-y-4">
                    {vehiclesAtLocation.map((vehicle) => (
                      <div key={vehicle.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Truck className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{vehicle.make} {vehicle.model}</div>
                          <div className="text-sm text-muted-foreground">{vehicle.year} • {vehicle.color}</div>
                          <div className="text-xs text-muted-foreground">VIN: {vehicle.vin}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {vehicle.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No vehicles are currently assigned to this location</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Address Information */}
              <Card>
                <CardHeader>
                                   <CardTitle className="flex items-center gap-2">
                   <MapPin className="h-5 w-5" />
                   Address Information
                 </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Street Address</label>
                      <p className="text-sm">{getLocationAddress(location).street}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">City</label>
                        <p className="text-sm">{getLocationAddress(location).city}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">State</label>
                        <p className="text-sm">{getLocationAddress(location).state || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Country</label>
                        <p className="text-sm">{getLocationAddress(location).country}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Postal Code</label>
                        <p className="text-sm">{getLocationAddress(location).postalCode || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
                      <p className="text-sm">{getLocationContactDetails(location).contactName || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="text-sm">{getLocationContactDetails(location).phone || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-sm">{getLocationContactDetails(location).email || 'Not specified'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Location Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Location configuration and settings will be displayed here</p>
                  <p className="text-sm">This could include operational hours, access controls, and other settings</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Location</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete this location? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteLocation}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default LocationDetail;
