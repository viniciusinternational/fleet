import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Car, 
  User, 
  MapPin, 
  Ship, 
  Building, 
  CheckCircle, 
  FileText, 
  Globe, 
  Clock, 
  Package,
  ArrowLeft,
  Route,
  XCircle,
  Activity,
  Plus,
  History,
  Edit,
  Trash2,
  Upload,
  Paperclip,
  Save,
  X
} from 'lucide-react';
import { VehicleStatus } from '@/types';
import type { Vehicle, TrackingEvent } from '@/types';
import { VehicleImageMiniGallery } from '@/components/ui/vehicle-image-mini-gallery';
import { useAuthStore } from '@/store/auth';
import AddEventModal from './add-event-modal';
import { EntityAuditLogs } from '@/components/audit/entity-audit-logs';

interface VehicleDetailsProps {
  vehicleId: string;
  backUrl?: string;
  showEditButton?: boolean;
  className?: string;
}

const VehicleDetails: React.FC<VehicleDetailsProps> = ({ 
  vehicleId, 
  backUrl = '/vehicles',
  showEditButton = true 
}) => {
  const router = useRouter();
  const { user: authUser } = useAuthStore();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [imagesLoading, setImagesLoading] = useState(false);
  
  // Track Events state
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TrackingEvent | null>(null);

  // Admin editing state (removed inline editing)
  
  // Check if user is admin - Force admin mode for testing
  const user = useMemo(() => authUser || { 
    role: 'Admin',
    location: { id: 'test-location', name: 'Test Location', type: 'Port' }
  }, [authUser]); // Use auth user or mock for testing
  const isAdmin = true; // Force admin mode for testing

  // Helper function to safely get location address
  const getLocationAddress = (location: any) => {
    return {
      street: location.street || location.address?.street || 'N/A',
      city: location.city || location.address?.city || 'N/A',
      country: location.country || location.address?.country || 'N/A'
    };
  };

  // Helper function to safely get shipping details
  const getShippingDetails = (shippingDetails: any) => {
    if (!shippingDetails) {
      return {
        originPort: 'N/A',
        destinationPort: 'N/A',
        shippingCompany: 'N/A',
        bookingNumber: 'N/A',
        vesselName: null,
        containerNumber: null,
        departureDate: null,
        expectedArrivalDate: null,
        documents: []
      };
    }
    return shippingDetails;
  };

  // Helper function to safely get customs details
  const getCustomsDetails = (vehicle: any) => {
    return {
      customsStatus: vehicle.customsStatus || 'PENDING',
      importDuty: vehicle.importDuty || 0,
      customsClearanceDate: vehicle.customsClearanceDate || null,
      customsNotes: vehicle.customsNotes || null,
      documents: vehicle.customsDetails?.documents || []
    };
  };

  // Load specific vehicle data from API
  useEffect(() => {
    const fetchVehicle = async () => {
      if (!vehicleId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/vehicles/${vehicleId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Vehicle not found');
          }
          throw new Error('Failed to fetch vehicle');
        }
        
        const vehicleData = await response.json();
        if (vehicleData) {
          // For admin users, show all vehicles
          // For normal users, check location-based access
          // If no user is logged in, show the vehicle anyway (for public access)
          if (isAdmin) {
            setVehicle({
              ...vehicleData,
              images: [],
            });
            await fetchVehicleImages(vehicleData.id);
          } else if (user) {
            const userLocation = user.location;
            const hasAccess = userLocation && (
              vehicleData.currentLocation.id === userLocation.id ||
              (vehicleData.shippingDetails?.destinationPort && 
               vehicleData.shippingDetails.destinationPort.includes(userLocation.name.split(' ')[0])) ||
              vehicleData.currentLocation.type === userLocation.type
            );
            
            if (hasAccess) {
              setVehicle({
                ...vehicleData,
                images: [],
              });
              await fetchVehicleImages(vehicleData.id);
            } else {
              setVehicle(null);
            }
          } else {
            // No user logged in - show vehicle for public access
            setVehicle({
              ...vehicleData,
              images: [],
            });
            await fetchVehicleImages(vehicleData.id);
          }
        } else {
          setVehicle(null);
        }
      } catch (error) {
        console.error('Error fetching vehicle:', error);
        setError(error instanceof Error ? error.message : 'Failed to load vehicle');
        setVehicle(null);
        // Don't retry on error to prevent infinite loop
      } finally {
      setLoading(false);
      }
    };

    fetchVehicle();
  }, [vehicleId]); // Only depend on vehicleId to prevent infinite loop

  const fetchVehicleImages = async (targetVehicleId: string) => {
    setImagesLoading(true);
    try {
      const response = await fetch(`/api/vehicles/${targetVehicleId}/images`);

      if (!response.ok) {
        throw new Error('Failed to fetch vehicle images');
      }

      const payload = await response.json();
      const images = Array.isArray(payload?.data) ? payload.data : [];

      setVehicle(prev =>
        prev
          ? {
              ...prev,
              images,
            }
          : prev
      );
    } catch (imageError) {
      console.error('Error fetching vehicle images:', imageError);
    } finally {
      setImagesLoading(false);
    }
  };


  const getStatusColor = (status: VehicleStatus) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-700';
      case 'In Local Delivery':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700';
      case 'At Port':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-700';
      case 'Clearing Customs':
        return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-700';
      case 'In Transit':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-700';
      case 'Ordered':
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-700';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status: VehicleStatus) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'In Local Delivery':
        return <Package className="h-4 w-4" />;
      case 'At Port':
        return <Ship className="h-4 w-4" />;
      case 'Clearing Customs':
        return <Building className="h-4 w-4" />;
      case 'In Transit':
        return <Globe className="h-4 w-4" />;
      case 'Ordered':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };


  // Admin editing functions removed - now using separate edit pages

  // Handle adding/updating tracking event from modal
  const handleEventSubmit = async (eventData: Omit<TrackingEvent, 'id' | 'timestamp'>) => {
    if (!vehicle) return;

    if (editingEvent) {
      // Update existing event
      const updatedVehicle = {
        ...vehicle,
        trackingHistory: vehicle.trackingHistory.map(event => 
          event.id === editingEvent.id 
            ? {
                ...event,
                location: eventData.location,
                status: eventData.status,
                notes: eventData.notes
              }
            : event
        ),
        status: eventData.status // Update current status if this is the latest event
      };
      setVehicle(updatedVehicle);
    } else {
      // Add new event
      const newTrackingEvent: TrackingEvent = {
        id: `event-${Date.now()}`,
        timestamp: new Date(),
        location: eventData.location,
        status: eventData.status,
        notes: eventData.notes
      };

      const updatedVehicle = {
        ...vehicle,
        trackingHistory: [newTrackingEvent, ...vehicle.trackingHistory],
        status: eventData.status // Update current status
      };
      setVehicle(updatedVehicle);
    }
  };

  // Handle deleting event
  const handleDeleteEvent = (eventId: string) => {
    if (!vehicle) return;

    const updatedVehicle = {
      ...vehicle,
      trackingHistory: vehicle.trackingHistory.filter(event => event.id !== eventId)
    };

    // Update current status to the most recent event if we deleted the latest one
    if (updatedVehicle.trackingHistory.length > 0) {
      updatedVehicle.status = updatedVehicle.trackingHistory[0].status;
    }

    setVehicle(updatedVehicle);
  };


  // Get the correct back navigation path
  const getBackPath = () => {
    return backUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-lg text-muted-foreground">Loading vehicle details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <Card>
            <CardHeader>
              <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold text-destructive">Error Loading Vehicle</h1>
                <p className="text-muted-foreground">{error}</p>
                <Button onClick={() => router.push(getBackPath())}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Vehicles
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <Card>
            <CardHeader>
              <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold text-destructive">Vehicle Not Found</h1>
                <p className="text-muted-foreground">This vehicle does not exist or you do not have access.</p>
                <Button onClick={() => router.push(getBackPath())}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Vehicles
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
 
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(getBackPath())}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">{vehicle.make} {vehicle.model}</h1>
              <p className="text-muted-foreground mt-2 text-lg">Vehicle Details & Tracking Information</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    VIN: {vehicle.vin}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {vehicle.year} • {vehicle.color}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline" className={`${getStatusColor(vehicle.status)} text-xs px-2 py-1`}>
                    {getStatusIcon(vehicle.status)}
                    <span className="ml-1">{vehicle.status}</span>
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="shipping" className="flex items-center gap-2">
              <Ship className="h-4 w-4" />
              Shipping
            </TabsTrigger>
            <TabsTrigger value="track-events" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Track Events
            </TabsTrigger>
            <TabsTrigger value="audit-logs" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Audit Logs
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Side - Vehicle Information (50%) */}
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Car className="h-5 w-5" />
                      Vehicle Information
                    </CardTitle>
                    {/* Admin Edit Button - Only for Admin users */}
                    {user && isAdmin && showEditButton && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => router.push(`/vehicles/${vehicleId}/edit/basic`)}
                      >
                          <Edit className="h-4 w-4 mr-2" />
                        Edit Basic Info
                        </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  {/* Vehicle Images */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Images</label>
                    {imagesLoading ? (
                      <div className="w-full h-32 bg-muted/30 rounded-lg flex items-center justify-center text-sm text-muted-foreground">
                        Loading images...
                      </div>
                    ) : (
                      <VehicleImageMiniGallery 
                        images={vehicle.images || []} 
                        vehicleName={`${vehicle.make} ${vehicle.model}`}
                      />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Make</label>
                        <p className="text-sm">{vehicle.make}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Model</label>
                        <p className="text-sm">{vehicle.model}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Year</label>
                        <p className="text-sm">{vehicle.year}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Color</label>
                        <p className="text-sm">{vehicle.color}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Trim</label>
                      <p className="text-sm">{vehicle.trim || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Engine</label>
                      <p className="text-sm">{vehicle.engineType || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Right Side - Split into two parts (50%) */}
              <div className="space-y-6 flex flex-col h-full">
                {/* Top - Owner Information */}
                <Card className="flex-1 flex flex-col">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Owner Information
                      </CardTitle>
                      {/* Owner editing is handled in separate edit pages */}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1">
                    {vehicle.owner ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Name</label>
                          <p className="text-sm">{vehicle.owner.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Email</label>
                          <p className="text-sm">{vehicle.owner.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Phone</label>
                          <p className="text-sm">{vehicle.owner.phone}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Country</label>
                          <p className="text-sm">{vehicle.owner.country}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No owner assigned</p>
                    )}

                    {/* Source Information Section */}
                    {vehicle.source && (
                      <>
                        <div className="border-t pt-4 mt-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <label className="text-sm font-medium text-muted-foreground">Source Information</label>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Name</label>
                              <p className="text-sm">{vehicle.source.name}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Email</label>
                              <p className="text-sm">{vehicle.source.email}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Phone</label>
                              <p className="text-sm">{vehicle.source.phone}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Country</label>
                              <p className="text-sm">{vehicle.source.country}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Address</label>
                              <p className="text-sm">{vehicle.source.address}</p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Bottom - Current Location & Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Route className="h-5 w-5" />
                      Current Location & Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Current Location</label>
                      <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                        <div className="font-medium text-sm">{vehicle.currentLocation.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {getLocationAddress(vehicle.currentLocation).street}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getLocationAddress(vehicle.currentLocation).city}, {getLocationAddress(vehicle.currentLocation).country}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Current Status</label>
                      <div className="mt-2">
                        <Badge variant="outline" className={`${getStatusColor(vehicle.status)} text-xs px-2 py-1`}>
                          {getStatusIcon(vehicle.status)}
                          <span className="ml-1">{vehicle.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Shipping Tab */}
          <TabsContent value="shipping" className="space-y-6">
            {/* Main Shipping Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Shipping Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                      <Ship className="h-5 w-5" />
                      Shipping Details
                  </CardTitle>
                  {/* Admin Edit Button - Only for Admin users */}
                  {user && isAdmin && showEditButton && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => router.push(`/vehicles/${vehicleId}/edit/shipping`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Shipping
                    </Button>
                  )}
                </div>
              </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Origin Port</Label>
                      <p className="font-medium">{getShippingDetails(vehicle.shippingDetails).originPort}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Destination Port</Label>
                      <p className="font-medium">{getShippingDetails(vehicle.shippingDetails).destinationPort}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-muted-foreground">Shipping Company</Label>
                    <p className="font-medium">{getShippingDetails(vehicle.shippingDetails).shippingCompany}</p>
                  </div>
                    
                  <div>
                    <Label className="text-sm text-muted-foreground">Booking Number</Label>
                    <p className="font-mono text-sm bg-muted px-2 py-1 rounded">{getShippingDetails(vehicle.shippingDetails).bookingNumber}</p>
                  </div>
                    
                  {/* Optional fields - show in edit mode or if they exist */}
                  <div>
                    <Label className="text-sm text-muted-foreground">Vessel Name</Label>
                    <p className="font-medium">{getShippingDetails(vehicle.shippingDetails).vesselName || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-muted-foreground">Container Number</Label>
                    <p className="font-mono text-sm bg-muted px-2 py-1 rounded">{getShippingDetails(vehicle.shippingDetails).containerNumber || 'Not specified'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline & Dates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <Label className="text-sm text-muted-foreground">Departure Date</Label>
                        <p className="text-sm">
                          {getShippingDetails(vehicle.shippingDetails).departureDate 
                            ? formatDate(new Date(getShippingDetails(vehicle.shippingDetails).departureDate))
                            : 'Not scheduled'
                          }
                        </p>
                    </div>
                  </div>

                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                        <Label className="text-sm text-muted-foreground">Expected Arrival</Label>
                        <p className="text-sm">
                          {getShippingDetails(vehicle.shippingDetails).expectedArrivalDate 
                            ? formatDate(new Date(getShippingDetails(vehicle.shippingDetails).expectedArrivalDate))
                            : 'Not scheduled'
                          }
                        </p>
                      </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>

            {/* Customs Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Customs Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                    <Label className="text-sm text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      <Badge variant="outline" className={`${getStatusColor(vehicle.status)} text-sm px-2 py-1`}>
                        {getCustomsDetails(vehicle).customsStatus}
                      </Badge>
                    </div>
                  </div>
                  
                    <div>
                    <Label className="text-sm text-muted-foreground">Import Duty</Label>
                    <p className="font-medium">₦{getCustomsDetails(vehicle).importDuty.toLocaleString()}</p>
                    </div>
                  
                    <div>
                    <Label className="text-sm text-muted-foreground">Clearance Date</Label>
                      <p className="text-sm">
                        {getCustomsDetails(vehicle).customsClearanceDate 
                          ? formatDate(new Date(getCustomsDetails(vehicle).customsClearanceDate))
                          : 'Pending'
                        }
                      </p>
                    </div>
                    </div>
                
                {getCustomsDetails(vehicle).customsNotes && (
                  <div className="mt-4">
                    <Label className="text-sm text-muted-foreground">Notes</Label>
                    <p className="text-sm mt-1">{getCustomsDetails(vehicle).customsNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documents Section - Always show */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Check if there are any documents */}
                {((getShippingDetails(vehicle.shippingDetails).documents && getShippingDetails(vehicle.shippingDetails).documents.length > 0) || 
                  (getCustomsDetails(vehicle).documents && getCustomsDetails(vehicle).documents.length > 0)) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Shipping Documents */}
                    {getShippingDetails(vehicle.shippingDetails).documents?.map((doc: any) => (
                      <div key={doc.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" 
                           onClick={() => window.open(doc.url, '_blank')}>
                        <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{doc.name}</div>
                          <div className="text-xs text-muted-foreground">Shipping Document</div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Customs Documents */}
                    {getCustomsDetails(vehicle).documents?.map((doc: any) => (
                      <div key={doc.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                           onClick={() => window.open(doc.url, '_blank')}>
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded flex items-center justify-center">
                          <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{doc.name}</div>
                          <div className="text-xs text-muted-foreground">Customs Document</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No Documents</h3>
                    <p className="text-sm text-muted-foreground">
                      No shipping or customs documents have been uploaded for this vehicle yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Track Events Tab */}
          <TabsContent value="track-events" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Tracking History
                  </CardTitle>
                  {/* Show Add Event button for Normal users only, Admin users have view-only access */}
                  {user && !isAdmin && showEditButton && (
                    <Button 
                      onClick={() => {
                        setEditingEvent(null);
                        setShowAddEventModal(true);
                      }}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Event
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Tracking History Timeline */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Journey Timeline
                  </h3>
                  
                  {vehicle.trackingHistory && vehicle.trackingHistory.length > 0 ? (
                    <div className="space-y-4">
                      {(() => {
                        const sortedEvents = vehicle.trackingHistory
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                        
                        return sortedEvents.map((event, index) => (
                        <div key={event.id} className="flex gap-4">
                          {/* Timeline connector */}
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-primary"></div>
                            {index < sortedEvents.length - 1 && (
                              <div className="w-0.5 h-8 bg-muted-foreground/25 mt-1"></div>
                            )}
                          </div>
                          
                          {/* Event content */}
                          <div className="flex-1 pb-4">
                            <Card>
                              <CardContent className="pt-4">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className={`${getStatusColor(event.status)} text-xs px-2 py-1`}>
                                        {getStatusIcon(event.status)}
                                        <span className="ml-1">{event.status}</span>
                                      </Badge>
                                      <span className="text-sm text-muted-foreground">
                                        {formatDate(event.timestamp)}
                                      </span>
                                    </div>
                                    <div className="font-medium">{event.location}</div>
                                    {event.notes && (
                                      <p className="text-sm text-muted-foreground">{event.notes}</p>
                                    )}
                                  </div>
                                  
                                  {/* Event Actions - For Normal users only, Admin users have view-only access */}
                                  {user && !isAdmin && showEditButton && (
                                    <div className="flex items-center gap-2 ml-4">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setEditingEvent(event);
                                          setShowAddEventModal(true);
                                        }}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteEvent(event.id)}
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                        ));
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No tracking events recorded yet.</p>
                      {user && !isAdmin && showEditButton && (
                        <p className="text-sm">Add the first event to start tracking this vehicle's journey.</p>
                      )}
                      {user && isAdmin && (
                        <p className="text-sm">Track events are view-only for administrators.</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit-logs" className="space-y-6">
            <EntityAuditLogs entityType="Vehicle" entityId={vehicleId} limit={20} />
          </TabsContent>

        </Tabs>
      </div>

      {/* Add/Edit Event Modal */}
      <AddEventModal
        isOpen={showAddEventModal}
        onClose={() => {
          setShowAddEventModal(false);
          setEditingEvent(null);
        }}
        onSubmit={handleEventSubmit}
        editingEvent={editingEvent}
      />
    </div>
  );
};

export default VehicleDetails;
          