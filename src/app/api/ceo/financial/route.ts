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

    // Financial metrics
    const totalImportDuties = vehicles.reduce((sum, v) => sum + v.importDuty, 0);
    const averageImportDuty = vehicles.length > 0 ? totalImportDuties / vehicles.length : 0;
    const highestImportDuty = Math.max(...vehicles.map(v => v.importDuty), 0);
    const lowestImportDuty = vehicles.length > 0 ? Math.min(...vehicles.map(v => v.importDuty), 0) : 0;

    // Duties by status
    const dutiesByStatus = vehicles.reduce((acc, v) => {
      const status = v.status;
      if (!acc[status]) {
        acc[status] = { total: 0, count: 0 };
      }
      acc[status].total += v.importDuty;
      acc[status].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const statusBreakdown = Object.entries(dutiesByStatus).map(([status, data]) => ({
      status,
      total: data.total,
      count: data.count,
      average: data.count > 0 ? data.total / data.count : 0,
      percentage: totalImportDuties > 0 ? (data.total / totalImportDuties) * 100 : 0,
    }));

    // Duties by customs status
    const dutiesByCustomsStatus = vehicles.reduce((acc, v) => {
      const customsStatus = v.customsStatus;
      if (!acc[customsStatus]) {
        acc[customsStatus] = { total: 0, count: 0 };
      }
      acc[customsStatus].total += v.importDuty;
      acc[customsStatus].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const customsBreakdown = Object.entries(dutiesByCustomsStatus).map(([status, data]) => ({
      customsStatus: status,
      total: data.total,
      count: data.count,
      average: data.count > 0 ? data.total / data.count : 0,
    }));

    // Top vehicles by import duty
    const topVehiclesByDuty = vehicles
      .sort((a, b) => b.importDuty - a.importDuty)
      .slice(0, 10)
      .map(v => ({
        id: v.id,
        vin: v.vin,
        make: v.make,
        model: v.model,
        year: v.year,
        importDuty: v.importDuty,
        status: v.status,
        customsStatus: v.customsStatus,
        owner: v.owner.name,
      }));

    // Time series data (by month)
    const monthlyData = vehicles.reduce((acc, v) => {
      const month = new Date(v.orderDate).toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += v.importDuty;
      return acc;
    }, {} as Record<string, number>);

    const monthlyBreakdown = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, total]) => ({
        month,
        total: Math.round(total),
      }));

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalImportDuties,
          averageImportDuty: Math.round(averageImportDuty),
          highestImportDuty,
          lowestImportDuty,
        },
        statusBreakdown,
        customsBreakdown,
        topVehiclesByDuty,
        monthlyBreakdown,
      },
    });
  } catch (error) {
    console.error('Error fetching financial data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch financial data' },
      { status: 500 }
    );
  }
}

