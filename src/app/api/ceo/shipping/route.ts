import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        shippingDetails: true,
        owner: true,
        currentLocation: true,
      },
    });

    // Routes analysis
    const routes = vehicles
      .filter(v => v.shippingDetails)
      .map(v => ({
        origin: v.shippingDetails!.originPort,
        destination: v.shippingDetails!.destinationPort,
        shippingCompany: v.shippingDetails!.shippingCompany,
        vesselName: v.shippingDetails!.vesselName || 'Unknown',
      }));

    // Most common routes
    const routeCount = routes.reduce((acc, r) => {
      const key = `${r.origin} → ${r.destination}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topRoutes = Object.entries(routeCount)
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Shipping companies
    const shippingCompanies = routes.reduce((acc, r) => {
      acc[r.shippingCompany] = (acc[r.shippingCompany] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const companyDistribution = Object.entries(shippingCompanies)
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count);

    // Active shipments
    const activeShipments = vehicles
      .filter(v => v.status === 'IN_TRANSIT' && v.shippingDetails)
      .slice(0, 10)
      .map(v => ({
        id: v.id,
        vin: v.vin,
        make: v.make,
        model: v.model,
        year: v.year,
        originPort: v.shippingDetails!.originPort,
        destinationPort: v.shippingDetails!.destinationPort,
        shippingCompany: v.shippingDetails!.shippingCompany,
        bookingNumber: v.shippingDetails!.bookingNumber,
        departureDate: v.shippingDetails!.departureDate?.toISOString(),
        expectedArrival: v.shippingDetails!.expectedArrivalDate?.toISOString(),
        status: v.status,
        owner: v.owner.name,
      }));

    // Transit times calculation
    const transitTimeData = vehicles
      .filter(v => v.shippingDetails?.departureDate && v.shippingDetails?.expectedArrivalDate)
      .map(v => {
        const departure = v.shippingDetails!.departureDate!;
        const arrival = v.shippingDetails!.expectedArrivalDate!;
        const days = Math.floor((arrival.getTime() - departure.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          origin: v.shippingDetails!.originPort,
          destination: v.shippingDetails!.destinationPort,
          days,
        };
      });

    const avgTransitTime = transitTimeData.length > 0
      ? transitTimeData.reduce((sum, t) => sum + t.days, 0) / transitTimeData.length
      : 0;

    // Origin and destination ports
    const ports = routes.reduce((acc, r) => {
      acc[r.origin] = (acc[r.origin] || 0) + 1;
      acc[r.destination] = (acc[r.destination] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topPorts = Object.entries(ports)
      .map(([port, count]) => ({ port, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      data: {
        topRoutes,
        companyDistribution,
        activeShipments,
        averageTransitTime: Math.round(avgTransitTime),
        topPorts,
        totalShipments: routes.length,
        vehiclesWithShipping: vehicles.filter(v => v.shippingDetails).length,
      },
    });
  } catch (error) {
    console.error('Error fetching shipping data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shipping data' },
      { status: 500 }
    );
  }
}

