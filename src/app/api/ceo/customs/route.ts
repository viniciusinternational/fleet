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

    // Customs status distribution
    const customsStatusDist = {
      PENDING: 0,
      IN_PROGRESS: 0,
      CLEARED: 0,
      HELD: 0,
    };

    vehicles.forEach(v => {
      customsStatusDist[v.customsStatus as keyof typeof customsStatusDist]++;
    });

    // Calculate clearance times
    const clearedVehicles = vehicles.filter(v => v.customsClearanceDate);
    const avgClearanceTime = clearedVehicles.length > 0 
      ? clearedVehicles.reduce((sum, v) => {
          const orderDate = new Date(v.orderDate);
          const clearanceDate = v.customsClearanceDate!;
          const days = Math.floor((clearanceDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / clearedVehicles.length
      : 0;

    // Customs status breakdown with details
    const customsBreakdown = Object.entries(customsStatusDist).map(([status, count]) => {
      const statusVehicles = vehicles.filter(v => v.customsStatus === status);
      const avgDuty = statusVehicles.length > 0
        ? statusVehicles.reduce((sum, v) => sum + v.importDuty, 0) / statusVehicles.length
        : 0;

      return {
        status,
        count,
        percentage: vehicles.length > 0 ? (count / vehicles.length) * 100 : 0,
        averageImportDuty: Math.round(avgDuty),
        totalImportDuty: statusVehicles.reduce((sum, v) => sum + v.importDuty, 0),
      };
    });

    // Vehicles pending customs clearance
    const pendingVehicles = vehicles
      .filter(v => v.customsStatus === 'PENDING' || v.customsStatus === 'IN_PROGRESS')
      .slice(0, 10)
      .map(v => ({
        id: v.id,
        vin: v.vin,
        make: v.make,
        model: v.model,
        year: v.year,
        customsStatus: v.customsStatus,
        importDuty: v.importDuty,
        orderDate: v.orderDate.toISOString(),
        owner: v.owner.name,
        location: v.currentLocation.name,
      }));

    return NextResponse.json({
      success: true,
      data: {
        customsStatusDistribution: customsStatusDist,
        customsBreakdown,
        averageClearanceTime: Math.round(avgClearanceTime),
        clearedVehiclesCount: clearedVehicles.length,
        pendingVehicles,
        totalVehicles: vehicles.length,
      },
    });
  } catch (error) {
    console.error('Error fetching customs data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customs data' },
      { status: 500 }
    );
  }
}

