import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        currentLocation: true,
        owner: true,
      },
    });

    // Group vehicles by location
    const vehiclesPerLocation = vehicles.reduce((acc, v) => {
      const locId = v.currentLocation.id;
      const locName = v.currentLocation.name;
      
      if (!acc[locId]) {
        acc[locId] = {
          location: {
            id: locId,
            name: locName,
            type: v.currentLocation.type,
            city: v.currentLocation.city,
            country: v.currentLocation.country,
          },
          vehicles: [],
          count: 0,
        };
      }
      
      acc[locId].vehicles.push({
        id: v.id,
        vin: v.vin,
        make: v.make,
        model: v.model,
        year: v.year,
        status: v.status,
        orderDate: v.orderDate,
      });
      
      acc[locId].count++;
      return acc;
    }, {} as Record<string, any>);

    // Calculate dwell time for each location
    const locationPerformance = Object.values(vehiclesPerLocation).map((data: any) => {
      const now = new Date();
      const totalDays = data.vehicles.reduce((sum: number, v: any) => {
        const orderDate = new Date(v.orderDate);
        return sum + Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      }, 0);
      
      return {
        location: data.location,
        vehicleCount: data.count,
        averageDwellTime: data.count > 0 ? Math.round(totalDays / data.count) : 0,
        vehicles: data.vehicles.slice(0, 5), // Top 5 for preview
      };
    }).sort((a, b) => b.vehicleCount - a.vehicleCount);

    // Chart data for visualization
    const chartData = locationPerformance.map(loc => ({
      name: loc.location.name,
      vehicles: loc.vehicleCount,
      avgDwellTime: loc.averageDwellTime,
    }));

    return NextResponse.json({
      success: true,
      data: {
        locationPerformance,
        chartData,
        totalLocations: locationPerformance.length,
        totalVehicles: vehicles.length,
      },
    });
  } catch (error) {
    console.error('Error fetching location data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch location data' },
      { status: 500 }
    );
  }
}

