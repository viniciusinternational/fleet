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

    // Make/model distribution
    const makeCount = vehicles.reduce((acc, v) => {
      acc[v.make] = (acc[v.make] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const makeDistribution = Object.entries(makeCount)
      .map(([make, count]) => ({ make, count }))
      .sort((a, b) => b.count - a.count);

    // Fuel type distribution
    const fuelTypeCount = vehicles.reduce((acc, v) => {
      acc[v.fuelType] = (acc[v.fuelType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const fuelTypeDistribution = Object.entries(fuelTypeCount)
      .map(([fuelType, count]) => ({ fuelType, count }))
      .sort((a, b) => b.count - a.count);

    // Year distribution
    const yearCount = vehicles.reduce((acc, v) => {
      acc[v.year] = (acc[v.year] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const yearDistribution = Object.entries(yearCount)
      .map(([year, count]) => ({ year: parseInt(year), count }))
      .sort((a, b) => b.year - a.year);

    // Average vehicle age
    const currentYear = new Date().getFullYear();
    const totalAge = vehicles.reduce((sum, v) => sum + (currentYear - v.year), 0);
    const averageAge = vehicles.length > 0 ? totalAge / vehicles.length : 0;

    // Weight statistics
    const totalWeight = vehicles.reduce((sum, v) => sum + v.weightKg, 0);
    const averageWeight = vehicles.length > 0 ? totalWeight / vehicles.length : 0;

    // Vehicle inventory list
    const vehicleInventory = vehicles
      .slice(0, 20)
      .map(v => ({
        id: v.id,
        vin: v.vin,
        make: v.make,
        model: v.model,
        year: v.year,
        fuelType: v.fuelType,
        engineType: v.engineType,
        color: v.color,
        weightKg: v.weightKg,
        status: v.status,
        location: v.currentLocation.name,
        owner: v.owner.name,
      }));

    return NextResponse.json({
      success: true,
      data: {
        makeDistribution,
        fuelTypeDistribution,
        yearDistribution,
        averageVehicleAge: Math.round(averageAge),
        averageWeight: Math.round(averageWeight),
        totalWeight: Math.round(totalWeight),
        vehicleInventory,
        totalVehicles: vehicles.length,
      },
    });
  } catch (error) {
    console.error('Error fetching fleet data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch fleet data' },
      { status: 500 }
    );
  }
}

