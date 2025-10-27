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

    // Delivered vehicles
    const deliveredVehicles = vehicles.filter(v => v.status === 'DELIVERED');
    
    // Calculate average delivery time for delivered vehicles
    const deliveryTimes = deliveredVehicles.map(v => {
      const orderDate = new Date(v.orderDate);
      const estimatedDelivery = new Date(v.estimatedDelivery);
      return Math.floor((estimatedDelivery.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    });

    const averageDeliveryTime = deliveryTimes.length > 0
      ? deliveryTimes.reduce((sum, t) => sum + t, 0) / deliveryTimes.length
      : 0;

    // Upcoming deliveries (next 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingDeliveries = vehicles
      .filter(v => {
        const deliveryDate = new Date(v.estimatedDelivery);
        return deliveryDate >= now && deliveryDate <= thirtyDaysFromNow && v.status !== 'DELIVERED';
      })
      .sort((a, b) => new Date(a.estimatedDelivery).getTime() - new Date(b.estimatedDelivery).getTime())
      .slice(0, 10)
      .map(v => ({
        id: v.id,
        vin: v.vin,
        make: v.make,
        model: v.model,
        year: v.year,
        estimatedDelivery: v.estimatedDelivery.toISOString(),
        status: v.status,
        owner: v.owner.name,
        location: v.currentLocation.name,
      }));

    // Overdue vehicles
    const overdueVehicles = vehicles
      .filter(v => {
        const deliveryDate = new Date(v.estimatedDelivery);
        return deliveryDate < now && v.status !== 'DELIVERED';
      })
      .slice(0, 10)
      .map(v => {
        const deliveryDate = new Date(v.estimatedDelivery);
        const daysOverdue = Math.floor((now.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          id: v.id,
          vin: v.vin,
          make: v.make,
          model: v.model,
          year: v.year,
          estimatedDelivery: v.estimatedDelivery.toISOString(),
          daysOverdue,
          status: v.status,
          owner: v.owner.name,
          location: v.currentLocation.name,
        };
      });

    // Delivery timeline data (monthly)
    const monthlyDeliveries = vehicles.reduce((acc, v) => {
      const month = new Date(v.estimatedDelivery).toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { estimated: 0, delivered: 0 };
      }
      acc[month].estimated += 1;
      if (v.status === 'DELIVERED') {
        acc[month].delivered += 1;
      }
      return acc;
    }, {} as Record<string, { estimated: number; delivered: number }>);

    const monthlyTimeline = Object.entries(monthlyDeliveries)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        estimated: data.estimated,
        delivered: data.delivered,
        onTimeRate: data.estimated > 0 ? (data.delivered / data.estimated) * 100 : 0,
      }));

    const onTimeRate = deliveredVehicles.length > 0
      ? vehicles.filter(v => {
          const deliveryDate = new Date(v.estimatedDelivery);
          const orderDate = new Date(v.orderDate);
          const actualDays = (deliveryDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
          return v.status === 'DELIVERED' && actualDays <= averageDeliveryTime;
        }).length / deliveredVehicles.length * 100
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        averageDeliveryTime: Math.round(averageDeliveryTime),
        onTimeRate: Math.round(onTimeRate),
        upcomingDeliveries,
        overdueVehicles,
        monthlyTimeline,
        deliveredCount: deliveredVehicles.length,
        totalVehicles: vehicles.length,
      },
    });
  } catch (error) {
    console.error('Error fetching delivery data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch delivery data' },
      { status: 500 }
    );
  }
}

