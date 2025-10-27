import { NextRequest, NextResponse } from 'next/server';
import { VehicleService } from '@/lib/services/vehicle';
import { LocationService } from '@/lib/services/location';
import { OwnerService } from '@/lib/services/owner';
import type { VehicleStatus } from '@/types';
import { VehicleStatus as VehicleStatusEnum } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId') || 'all';

    // Get basic counts
    const vehiclesResult = await VehicleService.getVehicles({ limit: 10000 });
    const locationsResult = await LocationService.getLocations({ limit: 1000 });
    const ownersResult = await OwnerService.getOwners({ limit: 1000 });

    const vehicles = vehiclesResult?.vehicles || [];
    const locations = locationsResult?.locations || [];
    const owners = ownersResult?.owners || [];

    // Ensure we have arrays
    if (!Array.isArray(vehicles) || !Array.isArray(locations) || !Array.isArray(owners)) {
      throw new Error('Invalid data structure returned from services');
    }

    // Calculate status distribution
    const statusDistribution = vehicles.reduce((acc, vehicle) => {
      acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
      return acc;
    }, {} as Record<VehicleStatus, number>);

    // Calculate average delivery time for delivered vehicles
    const deliveredVehicles = vehicles.filter(v => v.status === VehicleStatusEnum.DELIVERED);
    const averageDeliveryTime = deliveredVehicles.length > 0 
      ? deliveredVehicles.reduce((sum, v) => {
          const orderDate = new Date(v.orderDate);
          const deliveryDate = new Date(v.estimatedDelivery);
          return sum + (deliveryDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / deliveredVehicles.length
      : 0;

    // Calculate total import duties
    const totalImportDuties = vehicles.reduce((sum, v) => {
      return sum + (v.customsDetails?.importDuty || 0);
    }, 0);

    // Calculate location performance
    const locationPerformance = locations.map(location => {
      const vehiclesAtLocation = vehicles.filter(v => v.currentLocation.id === location.id);
      const averageDwellTime = vehiclesAtLocation.length > 0 
        ? vehiclesAtLocation.reduce((sum, v) => {
            const orderDate = new Date(v.orderDate);
            const currentDate = new Date();
            return sum + (currentDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
          }, 0) / vehiclesAtLocation.length
        : 0;

      return {
        location: {
          id: location.id,
          name: location.name,
          type: location.type,
          address: {
            city: location.city,
            country: location.country
          }
        },
        vehicleCount: vehiclesAtLocation.length,
        averageDwellTime: Math.round(averageDwellTime)
      };
    }).sort((a, b) => b.vehicleCount - a.vehicleCount);

    // Generate recent activity (mock data for now)
    const recentActivity = [
      {
        type: 'vehicle',
        description: 'New vehicle order placed',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        location: 'Tokyo Port'
      },
      {
        type: 'delivery',
        description: 'Vehicle delivered successfully',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        location: 'New York Dealership'
      },
      {
        type: 'customs',
        description: 'Customs clearance completed',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        location: 'Los Angeles Port'
      }
    ];

    const dashboardData = {
      totalVehicles: vehicles.length,
      totalLocations: locations.length,
      totalOwners: owners.length,
      statusDistribution,
      averageDeliveryTime: Math.round(averageDeliveryTime),
      totalImportDuties,
      locationPerformance,
      recentActivity
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Error fetching CEO dashboard data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
