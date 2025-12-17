'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Car, 
  MapPin, 
  Clock, 
  Ship, 
  Building, 
  CheckCircle, 
  Search,
  RefreshCw,
  Activity,
  History,
  Route,
  Target,
  Calendar,
  Package,
  Globe,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { VehicleStatus } from '@/types';
import type { Vehicle, TrackingEvent, Location } from '@/types';
import { useAuthStore } from '@/store/auth';

const TrackingView: React.FC = () => {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Track Events state
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({
    location: '',
    status: '' as VehicleStatus,
    notes: ''
  });
  
  const userLocation = currentUser?.location;

  // Load vehicles data filtered by user location
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/vehicles?limit=1000');
        if (response.ok) {
          const data = await response.json();
          let filteredVehicles = data.vehicles || [];
          
          // Filter vehicles by user's location if available
          if (userLocation) {
            filteredVehicles = filteredVehicles.filter((vehicle: Vehicle) => 
              vehicle.currentLocation.id === userLocation.id ||
              vehicle.currentLocation.type === userLocation.type
            );
          }
          
          setVehicles(filteredVehicles);
          setFilteredVehicles(filteredVehicles);
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [userLocation]);

  // Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations?limit=100');
        if (response.ok) {
          const data = await response.json();
          setLocations(data.locations || []);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    fetchLocations();
  }, []);

  // Filter vehicles
  useEffect(() => {
    let filtered = vehicles;

    if (searchTerm) {
      filtered = filtered.filter(vehicle =>
        vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.status === statusFilter);
    }

    setFilteredVehicles(filtered);
  }, [vehicles, searchTerm, statusFilter]);

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

  const getDaysUntilDelivery = (vehicle: Vehicle) => {
    const deliveryDate = new Date(vehicle.estimatedDelivery);
    const currentDate = new Date();
    const diffTime = deliveryDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
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

  // Handle adding new tracking event
  const handleAddEvent = () => {
    if (!selectedVehicle || !newEvent.location || !newEvent.status) return;

    const newTrackingEvent: TrackingEvent = {
      id: `event-${Date.now()}`,
      timestamp: new Date(),
      location: newEvent.location,
      status: newEvent.status,
      notes: newEvent.notes || undefined
    };

    // Update vehicle with new tracking event
    const updatedVehicle = {
      ...selectedVehicle,
      trackingHistory: [newTrackingEvent, ...selectedVehicle.trackingHistory],
      status: newEvent.status // Update current status
    };

    setSelectedVehicle(updatedVehicle);
    
    // Update the vehicles list
    const updatedVehicles = vehicles.map(v => 
      v.id === selectedVehicle.id ? updatedVehicle : v
    );
    setVehicles(updatedVehicles);
    
    // Reset form
    setNewEvent({
      location: '',
      status: '' as VehicleStatus,
      notes: ''
    });
    setShowAddEvent(false);
  };

  // Handle editing existing event
  const handleEditEvent = (eventId: string) => {
    const event = selectedVehicle?.trackingHistory.find(e => e.id === eventId);
    if (event) {
      setNewEvent({
        location: event.location,
        status: event.status,
        notes: event.notes || ''
      });
      setEditingEvent(eventId);
      setShowAddEvent(true);
    }
  };

  // Handle updating existing event
  const handleUpdateEvent = () => {
    if (!selectedVehicle || !editingEvent || !newEvent.location || !newEvent.status) return;

    const updatedVehicle = {
      ...selectedVehicle,
      trackingHistory: selectedVehicle.trackingHistory.map(event => 
        event.id === editingEvent 
          ? {
              ...event,
              location: newEvent.location,
              status: newEvent.status,
              notes: newEvent.notes || undefined
            }
          : event
      ),
      status: newEvent.status // Update current status if this is the latest event
    };

    setSelectedVehicle(updatedVehicle);
    
    // Update the vehicles list
    const updatedVehicles = vehicles.map(v => 
      v.id === selectedVehicle.id ? updatedVehicle : v
    );
    setVehicles(updatedVehicles);
    
    // Reset form and editing state
    setNewEvent({
      location: '',
      status: '' as VehicleStatus,
      notes: ''
    });
    setEditingEvent(null);
    setShowAddEvent(false);
  };

  // Handle deleting event
  const handleDeleteEvent = (eventId: string) => {
    if (!selectedVehicle) return;

    const updatedVehicle = {
      ...selectedVehicle,
      trackingHistory: selectedVehicle.trackingHistory.filter(event => event.id !== eventId)
    };

    // Update current status to the most recent event if we deleted the latest one
    if (updatedVehicle.trackingHistory.length > 0) {
      updatedVehicle.status = updatedVehicle.trackingHistory[0].status;
    }

    setSelectedVehicle(updatedVehicle);
    
    // Update the vehicles list
    const updatedVehicles = vehicles.map(v => 
      v.id === selectedVehicle.id ? updatedVehicle : v
    );
    setVehicles(updatedVehicles);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-lg text-muted-foreground">Loading event tracking data...</p>
          </div>
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
              onClick={() => router.push('/dashboard')}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Event Tracking</h1>
              <p className="text-muted-foreground mt-2 text-lg">View and track vehicle journey events and status changes</p>
          </div>
        </div>
      </div>

        {/* Main Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Event Tracking Dashboard
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search vehicles by make, model, or VIN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Ordered">Ordered</SelectItem>
                    <SelectItem value="In Transit">In Transit</SelectItem>
                    <SelectItem value="Clearing Customs">Clearing Customs</SelectItem>
                    <SelectItem value="At Port">At Port</SelectItem>
                    <SelectItem value="In Local Delivery">Local Delivery</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vehicle List */}
              <div className="lg:col-span-1">
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Available Vehicles ({filteredVehicles.length})
                  </h3>
                  
              <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredVehicles.length > 0 ? (
                      filteredVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedVehicle?.id === vehicle.id
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedVehicle(vehicle)}
                  >
                          <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{vehicle.make} {vehicle.model}</span>
                      </div>
                      <Badge variant="outline" className={getStatusColor(vehicle.status)}>
                        {getStatusIcon(vehicle.status)}
                        <span className="ml-1 text-xs">{vehicle.status}</span>
                      </Badge>
                    </div>
                    
                          <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-mono">{vehicle.vin}</p>
                      <p className="text-xs text-muted-foreground">{vehicle.currentLocation?.name}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Delivery</span>
                        <span className="text-xs font-medium">{getDaysUntilDelivery(vehicle)}</span>
                      </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Car className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No vehicles found</p>
                        <p className="text-xs">Try adjusting your search or filters</p>
                    </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Event Tracking Details */}
              <div className="lg:col-span-2">
                {selectedVehicle ? (
                  <div className="space-y-6">
                    {/* Vehicle Overview Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{selectedVehicle.make} {selectedVehicle.model}</h3>
                        <p className="text-sm text-muted-foreground">{selectedVehicle.vin}</p>
                      </div>
                      <Button 
                        onClick={() => {
                          setShowAddEvent(!showAddEvent);
                          setEditingEvent(null);
                          setNewEvent({
                            location: '',
                            status: '' as VehicleStatus,
                            notes: ''
                          });
                        }}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Event
                      </Button>
                    </div>

                    {/* Add/Edit Event Form */}
                    {showAddEvent && (
                      <div className="p-4 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/25">
                        <div className="space-y-4">
                          <h4 className="font-semibold">
                            {editingEvent ? 'Edit Tracking Event' : 'Add New Tracking Event'}
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="event-location">Location</Label>
                              <Select
                                value={newEvent.location}
                                onValueChange={(value) => setNewEvent({ ...newEvent, location: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select location" />
                                </SelectTrigger>
                                <SelectContent>
                                  {locations.map((location) => (
                                    <SelectItem key={location.id} value={location.name}>
                                      {location.name} - {location.type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="event-status">Status</Label>
                              <Select
                                value={newEvent.status}
                                onValueChange={(value: VehicleStatus) => setNewEvent({ ...newEvent, status: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Ordered">Ordered</SelectItem>
                                  <SelectItem value="In Transit">In Transit</SelectItem>
                                  <SelectItem value="Clearing Customs">Clearing Customs</SelectItem>
                                  <SelectItem value="At Port">At Port</SelectItem>
                                  <SelectItem value="In Local Delivery">In Local Delivery</SelectItem>
                                  <SelectItem value="Delivered">Delivered</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="event-notes">Notes (Optional)</Label>
                            <Textarea
                              id="event-notes"
                              placeholder="Add any additional notes about this event..."
                              value={newEvent.notes}
                              onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                              rows={3}
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              onClick={editingEvent ? handleUpdateEvent : handleAddEvent}
                              disabled={!newEvent.location || !newEvent.status}
                              className="flex items-center gap-2"
                            >
                              {editingEvent ? (
                                <>
                                  <Edit className="h-4 w-4" />
                                  Update Event
                  </>
                ) : (
                  <>
                                  <Plus className="h-4 w-4" />
                                  Add Event
                  </>
                )}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setShowAddEvent(false);
                                setEditingEvent(null);
                                setNewEvent({
                                  location: '',
                                  status: '' as VehicleStatus,
                                  notes: ''
                                });
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Overview
                        </TabsTrigger>
                        <TabsTrigger value="events" className="flex items-center gap-2">
                          <History className="h-4 w-4" />
                          Events
                        </TabsTrigger>
                        <TabsTrigger value="journey" className="flex items-center gap-2">
                          <Route className="h-4 w-4" />
                          Journey
                        </TabsTrigger>
                      </TabsList>

                      {/* Overview Tab */}
                      <TabsContent value="overview" className="space-y-6">
                  {/* Vehicle Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">{selectedVehicle.make} {selectedVehicle.model}</h4>
                      <p className="text-sm text-muted-foreground">{selectedVehicle.vin}</p>
                    </div>
                    <div className="text-center">
                      <Badge variant="outline" className={getStatusColor(selectedVehicle.status)}>
                        {getStatusIcon(selectedVehicle.status)}
                        <span className="ml-1">{selectedVehicle.status}</span>
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{getDaysUntilDelivery(selectedVehicle)}</p>
                      <p className="text-xs text-muted-foreground">until delivery</p>
                    </div>
                  </div>

                        {/* Current Location & Progress */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                              <MapPin className="h-4 w-4" />
                              <span className="font-semibold">Current Location</span>
                            </div>
                        <div className="space-y-2">
                          <p className="font-medium">{selectedVehicle.currentLocation?.name}</p>
                          <p className="text-sm text-muted-foreground">{selectedVehicle.currentLocation?.address?.street}</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedVehicle.currentLocation?.address?.city}, {selectedVehicle.currentLocation?.address?.country}
                          </p>
                        </div>
                          </div>

                          <div className="p-4 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                          <Target className="h-4 w-4" />
                              <span className="font-semibold">Delivery Timeline</span>
                            </div>
                        <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Order Date</span>
                                <span className="text-sm font-medium">{formatDate(selectedVehicle.orderDate)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Estimated Delivery</span>
                                <span className="text-sm font-medium">{formatDate(selectedVehicle.estimatedDelivery)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Status</span>
                                <span className="text-sm font-medium">{selectedVehicle.status}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      {/* Events Tab */}
                      <TabsContent value="events" className="space-y-6">
                        <div>
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Tracking Events ({selectedVehicle.trackingHistory?.length || 0})
                          </h4>
                          
                          {selectedVehicle.trackingHistory && selectedVehicle.trackingHistory.length > 0 ? (
                            <div className="space-y-4">
                              {selectedVehicle.trackingHistory.map((event, index) => (
                                <div key={index} className="flex gap-4">
                                  {/* Timeline connector */}
                                  <div className="flex flex-col items-center">
                                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                                    {index < selectedVehicle.trackingHistory.length - 1 && (
                                      <div className="w-0.5 h-8 bg-muted-foreground/25 mt-1"></div>
                                    )}
                                  </div>
                                  
                                  {/* Event content */}
                                  <div className="flex-1 pb-4">
                                    <div className="p-4 bg-muted/30 rounded-lg">
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
                                        
                                        {/* Event Actions */}
                                        <div className="flex items-center gap-2 ml-4">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditEvent(event.id)}
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
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p>No tracking events recorded yet.</p>
                              <p className="text-sm">Add the first event to start tracking this vehicle&apos;s journey.</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      {/* Journey Tab */}
                      <TabsContent value="journey" className="space-y-6">
                        <div>
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <Route className="h-4 w-4" />
                            Journey Overview
                          </h4>
                          
                          {/* Journey Route Visualization */}
                          <div className="relative p-6">
                            <div className="relative h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full mb-8">
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full animate-pulse"></div>
                            </div>
                            
                            {/* Route Points */}
                            <div className="grid grid-cols-3 gap-4">
                              {/* Origin */}
                              <div className="text-center">
                                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                                  <Ship className="h-8 w-8 text-white" />
                                </div>
                                <div className="font-semibold text-blue-700 dark:text-blue-300 text-sm">Origin</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {selectedVehicle.shippingDetails.originPort}
                                </div>
                              </div>

                              {/* Current Status */}
                              <div className="text-center">
                                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                                  <Globe className="h-8 w-8 text-white" />
                                </div>
                                <div className="font-semibold text-purple-700 dark:text-purple-300 text-sm">Current</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {selectedVehicle.status}
                                </div>
                              </div>

                              {/* Destination */}
                              <div className="text-center">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                                  <MapPin className="h-8 w-8 text-white" />
                                </div>
                                <div className="font-semibold text-green-700 dark:text-green-300 text-sm">Destination</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {selectedVehicle.shippingDetails.destinationPort}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Journey Statistics */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-muted/30 rounded-lg">
                              <div className="flex items-center gap-2 mb-3">
                                <Calendar className="h-4 w-4" />
                                <span className="font-semibold">Journey Duration</span>
                              </div>
                              <div className="text-2xl font-bold">
                                {Math.ceil((new Date(selectedVehicle.estimatedDelivery).getTime() - new Date(selectedVehicle.orderDate).getTime()) / (1000 * 60 * 60 * 24))} days
                              </div>
                              <p className="text-sm text-muted-foreground">Total journey time</p>
                            </div>

                            <div className="p-4 bg-muted/30 rounded-lg">
                              <div className="flex items-center gap-2 mb-3">
                                <Activity className="h-4 w-4" />
                                <span className="font-semibold">Events Recorded</span>
                              </div>
                              <div className="text-2xl font-bold">
                                {selectedVehicle.trackingHistory?.length || 0}
                              </div>
                              <p className="text-sm text-muted-foreground">Tracking events</p>
                            </div>
                          </div>
                  </div>
                      </TabsContent>
                    </Tabs>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <Car className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Select a vehicle to view event tracking details</p>
                    <p className="text-xs text-muted-foreground">Choose from the list on the left</p>
                  </div>
                </div>
              )}
              </div>
            </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
};

export default TrackingView;
