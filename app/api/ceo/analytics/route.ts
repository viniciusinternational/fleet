import { NextRequest, NextResponse } from 'next/server';
import { VehicleService } from '@/lib/services/vehicle';
import { LocationService } from '@/lib/services/location';
import { OwnerService } from '@/lib/services/owner';
import { prisma } from '@/lib/prisma';
import type { VehicleStatus } from '@/types';
import { VehicleStatus as VehicleStatusEnum } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '12months';
    const locationId = searchParams.get('locationId') || 'all';

    // Get all vehicles with related data
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

      const totalDuties = vehiclesAtLocation.reduce((sum, v) => {
        return sum + (v.customsDetails?.importDuty || 0);
      }, 0);

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
        averageDwellTime: Math.round(averageDwellTime),
        totalDuties
      };
    }).sort((a, b) => b.vehicleCount - a.vehicleCount);

    // Generate monthly trends (mock data for now - in real app, this would be calculated from actual data)
    const monthlyTrends = [
      { month: 'Jan', orders: 45, deliveries: 42, revenue: 125000 },
      { month: 'Feb', orders: 52, deliveries: 48, revenue: 145000 },
      { month: 'Mar', orders: 38, deliveries: 35, revenue: 110000 },
      { month: 'Apr', orders: 61, deliveries: 58, revenue: 175000 },
      { month: 'May', orders: 47, deliveries: 44, revenue: 135000 },
      { month: 'Jun', orders: 55, deliveries: 52, revenue: 160000 },
      { month: 'Jul', orders: 43, deliveries: 40, revenue: 125000 },
      { month: 'Aug', orders: 49, deliveries: 46, revenue: 140000 },
      { month: 'Sep', orders: 56, deliveries: 53, revenue: 165000 },
      { month: 'Oct', orders: 41, deliveries: 38, revenue: 120000 },
      { month: 'Nov', orders: 48, deliveries: 45, revenue: 135000 },
      { month: 'Dec', orders: 52, deliveries: 49, revenue: 150000 }
    ];

    // Calculate customs performance
    const customsPerformance = locations
      .filter(loc => loc.type === 'Customs Office')
      .map(location => {
        const vehiclesAtLocation = vehicles.filter(v => v.currentLocation.id === location.id);
        const clearedVehicles = vehiclesAtLocation.filter(v => v.customsDetails?.status === 'Cleared');
        const averageClearanceTime = clearedVehicles.length > 0 
          ? clearedVehicles.reduce((sum, v) => {
              const orderDate = new Date(v.orderDate);
              const currentDate = new Date();
              return sum + (currentDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
            }, 0) / clearedVehicles.length
          : 0;

        return {
          location: location.name,
          averageClearanceTime: Math.round(averageClearanceTime),
          totalVehicles: vehiclesAtLocation.length,
          successRate: vehiclesAtLocation.length > 0 
            ? Math.round((clearedVehicles.length / vehiclesAtLocation.length) * 100)
            : 0
        };
      });

    // Calculate financial summary
    const totalRevenue = monthlyTrends.reduce((sum, month) => sum + month.revenue, 0);
    const averageOrderValue = vehicles.length > 0 ? totalRevenue / vehicles.length : 0;
    const profitMargin = 0.15; // Mock 15% profit margin

    const analytics = {
      totalVehicles: vehicles.length,
      totalLocations: locations.length,
      totalOwners: owners.length,
      statusDistribution,
      averageDeliveryTime: Math.round(averageDeliveryTime) || 0,
      totalImportDuties: totalImportDuties || 0,
      locationPerformance,
      monthlyTrends,
      customsPerformance,
      financialSummary: {
        totalRevenue: totalRevenue || 0,
        totalDuties: totalImportDuties || 0,
        averageOrderValue: Math.round(averageOrderValue) || 0,
        profitMargin: Math.round(profitMargin * 100) || 0
      }
    };

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error fetching CEO analytics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
