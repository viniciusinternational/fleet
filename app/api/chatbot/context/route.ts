import { NextResponse } from 'next/server';
import { VehicleService } from '@/lib/services/vehicle';
import { OwnerService } from '@/lib/services/owner';
import { LocationService } from '@/lib/services/location';

/**
 * GET /api/chatbot/context
 * Fetches all vehicles, owners, and locations to provide context to the AI chatbot
 */
export async function GET() {
  try {
    // Fetch all data without pagination (use high limit)
    const [vehiclesResult, ownersResult, locationsResult] = await Promise.all([
      VehicleService.getVehicles({ limit: 1000, page: 1 }),
      OwnerService.getOwners({ limit: 1000, page: 1 }),
      LocationService.getLocations({ limit: 1000, page: 1 }),
    ]);

    // Format the context data
    const context = {
      vehicles: vehiclesResult.vehicles.map((v: any) => ({
        id: v.id,
        vin: v.vin,
        make: v.make,
        model: v.model,
        year: v.year,
        color: v.color,
        status: v.status,
        orderDate: v.orderDate,
        estimatedDelivery: v.estimatedDelivery,
        owner: {
          name: v.owner?.name || 'Unknown',
          email: v.owner?.email || '',
          phone: v.owner?.phone || '',
        },
        currentLocation: {
          name: v.currentLocation?.name || 'Unknown',
          type: v.currentLocation?.type || '',
          city: v.currentLocation?.city || '',
          country: v.currentLocation?.country || '',
        },
        customsStatus: v.customsStatus || 'Pending',
        importDuty: v.importDuty || 0,
      })),
      owners: ownersResult.owners.map((o: any) => ({
        id: o.id,
        name: o.name,
        email: o.email,
        phone: o.phone,
        address: o.address,
        country: o.country,
        vehicleCount: o.vehicles?.length || 0,
      })),
      locations: locationsResult.locations.map((l: any) => ({
        id: l.id,
        name: l.name,
        type: l.type,
        status: l.status,
        city: l.city,
        country: l.country,
        contactName: l.contactName || '',
        phone: l.phone || '',
        email: l.email || '',
      })),
    };

    return NextResponse.json({
      success: true,
      data: context,
      stats: {
        totalVehicles: vehiclesResult.total,
        totalOwners: ownersResult.total,
        totalLocations: locationsResult.total,
      },
    });
  } catch (error) {
    console.error('Error fetching chatbot context:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch context data',
      },
      { status: 500 }
    );
  }
}

