import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        owner: true,
        currentLocation: true,
      },
    });

    const owners = await prisma.owner.findMany({
      include: {
        vehicles: true,
      },
    });

    // Vehicles per owner
    const ownersWithVehicleCount = owners.map(owner => ({
      id: owner.id,
      name: owner.name,
      email: owner.email,
      phone: owner.phone,
      nationality: owner.nationality,
      vehicleCount: owner.vehicles.length,
    })).sort((a, b) => b.vehicleCount - a.vehicleCount);

    // Top owners by vehicle count
    const topOwners = ownersWithVehicleCount.slice(0, 10);

    // Nationality distribution
    const nationalityCount = owners.reduce((acc, o) => {
      acc[o.nationality] = (acc[o.nationality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const nationalityDistribution = Object.entries(nationalityCount)
      .map(([nationality, count]) => ({ nationality, count }))
      .sort((a, b) => b.count - a.count);

    // Chart data for top owners
    const chartData = topOwners.map(owner => ({
      name: owner.name,
      vehicles: owner.vehicleCount,
    }));

    // Average vehicles per owner
    const totalVehicles = vehicles.length;
    const totalOwners = owners.length;
    const averageVehiclesPerOwner = totalOwners > 0 ? totalVehicles / totalOwners : 0;

    return NextResponse.json({
      success: true,
      data: {
        ownersWithVehicleCount,
        topOwners,
        chartData,
        nationalityDistribution,
        averageVehiclesPerOwner: Math.round(averageVehiclesPerOwner * 10) / 10,
        totalOwners,
        totalVehicles,
      },
    });
  } catch (error) {
    console.error('Error fetching owner data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch owner data' },
      { status: 500 }
    );
  }
}

