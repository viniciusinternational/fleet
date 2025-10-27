import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        currentLocation: true,
        owner: true,
        trackingHistory: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    // Status distribution
    const statusDistribution = {
      ORDERED: 0,
      IN_TRANSIT: 0,
      CLEARING_CUSTOMS: 0,
      AT_PORT: 0,
      IN_LOCAL_DELIVERY: 0,
      DELIVERED: 0,
    };

    vehicles.forEach(v => {
      statusDistribution[v.status as keyof typeof statusDistribution]++;
    });

    // Calculate time in each stage
    const stageTimeData = vehicles
      .filter(v => v.status !== 'DELIVERED')
      .map(v => {
        const orderDate = new Date(v.orderDate);
        const now = new Date();
        const daysSince = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          status: v.status,
          days: daysSince,
        };
      });

    // Average time per status
    const avgTimePerStatus = Object.keys(statusDistribution).map(status => {
      const filtered = stageTimeData.filter(s => s.status === status);
      const avg = filtered.length > 0 
        ? filtered.reduce((sum, s) => sum + s.days, 0) / filtered.length 
        : 0;
      
      return {
        status,
        averageDays: Math.round(avg),
        count: statusDistribution[status as keyof typeof statusDistribution],
      };
    });

    // Lifecycle stages data for funnel visualization
    const lifecycleStages = [
      { stage: 'ORDERED', count: statusDistribution.ORDERED, color: '#94a3b8' },
      { stage: 'IN_TRANSIT', count: statusDistribution.IN_TRANSIT, color: '#3b82f6' },
      { stage: 'CLEARING_CUSTOMS', count: statusDistribution.CLEARING_CUSTOMS, color: '#f59e0b' },
      { stage: 'AT_PORT', count: statusDistribution.AT_PORT, color: '#eab308' },
      { stage: 'IN_LOCAL_DELIVERY', count: statusDistribution.IN_LOCAL_DELIVERY, color: '#8b5cf6' },
      { stage: 'DELIVERED', count: statusDistribution.DELIVERED, color: '#10b981' },
    ];

    // Top 10 vehicles by status for table
    const vehiclesByStatus = vehicles
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, 10)
      .map(v => ({
        id: v.id,
        vin: v.vin,
        make: v.make,
        model: v.model,
        year: v.year,
        status: v.status,
        location: v.currentLocation.name,
        owner: v.owner.name,
        orderDate: v.orderDate.toISOString(),
        estimatedDelivery: v.estimatedDelivery.toISOString(),
      }));

    return NextResponse.json({
      success: true,
      data: {
        statusDistribution,
        lifecycleStages,
        averageTimePerStatus: avgTimePerStatus,
        vehiclesByStatus,
        totalVehicles: vehicles.length,
      },
    });
  } catch (error) {
    console.error('Error fetching lifecycle data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lifecycle data' },
      { status: 500 }
    );
  }
}

