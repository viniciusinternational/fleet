'use client';

import React from 'react';
import type { TrackingEvent, VehicleStatus } from '@/types';
import { useVehicleDetails } from './use-vehicle-details';
import { SimpleVehicleGallery } from './simple-vehicle-gallery';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Car, MapPin, Clock, Package, Ship, Building, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SimpleVehicleDetailsPageProps {
  vehicleId: string;
}

const statusStyles: Record<VehicleStatus, string> = {
  'Delivered':
    'bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-700',
  'In Local Delivery':
    'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700',
  'At Port':
    'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-700',
  'Clearing Customs':
    'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-700',
  'In Transit':
    'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-700',
  'Ordered':
    'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-700',
};

const formatDateTime = (date: Date | string | undefined) => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

const formatDate = (date: Date | string | undefined) => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
};

const SimpleVehicleDetailsPage: React.FC<SimpleVehicleDetailsPageProps> = ({ vehicleId }) => {
  const router = useRouter();
  const { vehicle, loading, error } = useVehicleDetails(vehicleId);

  const trackingEvents: TrackingEvent[] = vehicle?.trackingHistory ?? [];
  const sortedEvents = [...trackingEvents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="space-y-4">
            <div className="h-8 w-40 bg-muted rounded-md animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              <div className="h-64 bg-muted rounded-xl animate-pulse" />
              <div className="space-y-4">
                <div className="h-32 bg-muted rounded-xl animate-pulse" />
                <div className="h-40 bg-muted rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-destructive">
                {error || 'This vehicle could not be found or is not accessible.'}
              </p>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statusClass = statusStyles[vehicle.status] ?? statusStyles['Ordered'];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                  <Car className="h-6 w-6 text-muted-foreground" />
                  {vehicle.make} {vehicle.model}
                </h1>
                <Badge variant="outline" className={statusClass + ' text-xs px-2 py-1'}>
                  {vehicle.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                VIN {vehicle.vin} · {vehicle.year} · {vehicle.color}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-1 text-left md:text-right">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Estimated Delivery
            </span>
            <span className="text-sm font-medium">{formatDate(vehicle.estimatedDelivery)}</span>
            <span className="text-xs text-muted-foreground">
              Ordered on {formatDate(vehicle.orderDate)}
            </span>
          </div>
        </div>

        {/* Main two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          {/* Left column: gallery + key specs */}
          <div className="space-y-6">
            <SimpleVehicleGallery images={vehicle.images ?? []} vehicleName={`${vehicle.make} ${vehicle.model}`} />

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Vehicle summary</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs uppercase">Make</div>
                  <div className="font-medium">{vehicle.make}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase">Model</div>
                  <div className="font-medium">{vehicle.model}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase">Year</div>
                  <div className="font-medium">{vehicle.year}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase">Color</div>
                  <div className="font-medium capitalize">{vehicle.color}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase">Engine</div>
                  <div className="font-medium">{vehicle.engineType}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase">Fuel</div>
                  <div className="font-medium">{vehicle.fuelType}</div>
                </div>
              </CardContent>
            </Card>

            {vehicle.owner && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Owner</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <div className="font-medium">{vehicle.owner.name}</div>
                  <div className="text-muted-foreground">{vehicle.owner.email}</div>
                  <div className="text-muted-foreground">{vehicle.owner.phone}</div>
                  <div className="text-muted-foreground">{vehicle.owner.country}</div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column: location, shipping, customs, tracking */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Current location
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <div className="font-medium">{vehicle.currentLocation?.name || 'Unknown location'}</div>
                <div className="text-muted-foreground">
                  {vehicle.currentLocation?.address?.street || 'Address unavailable'}
                </div>
                <div className="text-muted-foreground">
                  {vehicle.currentLocation?.address?.city || 'Unknown city'},{' '}
                  {vehicle.currentLocation?.address?.country || 'Unknown country'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Ship className="h-4 w-4" />
                  Shipping
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs uppercase">Origin port</div>
                  <div className="font-medium">
                    {vehicle.shippingDetails?.originPort || 'Not specified'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase">Destination port</div>
                  <div className="font-medium">
                    {vehicle.shippingDetails?.destinationPort || 'Not specified'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase">Shipping company</div>
                  <div className="font-medium">
                    {vehicle.shippingDetails?.shippingCompany || 'Not specified'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase">Booking number</div>
                  <div className="font-mono text-xs">
                    {vehicle.shippingDetails?.bookingNumber || 'Not specified'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase">Departure</div>
                  <div className="font-medium">
                    {formatDateTime(vehicle.shippingDetails?.departureDate)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase">Expected arrival</div>
                  <div className="font-medium">
                    {formatDateTime(vehicle.shippingDetails?.expectedArrivalDate)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Customs
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs uppercase">Status</div>
                  <div className="font-medium">
                    {vehicle.customsDetails?.customsStatus ??
                      // Fallback for API payloads with flat customsStatus field
                      (vehicle as any).customsStatus ??
                      'Pending'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase">Import duty</div>
                  <div className="font-medium">
                    {(() => {
                      const duty =
                        vehicle.customsDetails?.importDuty ??
                        (vehicle as any).importDuty ??
                        0;
                      return `₦${Number(duty).toLocaleString()}`;
                    })()}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase">Clearance date</div>
                  <div className="font-medium">
                    {formatDateTime(
                      vehicle.customsDetails?.customsClearanceDate ??
                        (vehicle as any).customsClearanceDate,
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Tracking events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {sortedEvents.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No tracking events recorded for this vehicle yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {sortedEvents.slice(0, 5).map((event) => (
                      <div key={event.id} className="flex gap-3">
                        <div className="flex flex-col items-center pt-1">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <div className="flex-1 w-px bg-border mt-1" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="font-medium">{event.location}</div>
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(event.timestamp)}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {event.status} {event.notes ? `· ${event.notes}` : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                    {sortedEvents.length > 5 && (
                      <div className="text-xs text-muted-foreground">
                        + {sortedEvents.length - 5} more events
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleVehicleDetailsPage;

