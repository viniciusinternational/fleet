import { NextRequest, NextResponse } from 'next/server';
import { VehicleService } from '@/lib/services/vehicle';
import { Role } from '@/types';
import { createVehicleSchema } from '../route';

// GET /api/vehicles/[id] - Get vehicle by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // TODO: Get user role and location from authentication/session
    const userRole = Role.ADMIN; // This should come from your auth system
    const userLocationId = undefined; // This should come from your auth system
    
    const vehicle = await VehicleService.getVehicleById(id);

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch vehicle' },
      { status: 500 }
    );
  }
}

// PUT /api/vehicles/[id] - Update vehicle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // TODO: Get user role and location from authentication/session
    const userRole = Role.ADMIN; // This should come from your auth system
    const userLocationId = undefined; // This should come from your auth system
    
    const body = await request.json();

    const {
      images,
      ...vehiclePayload
    } = body ?? {};

    const normalizedVehicleData = {
      vin: String(vehiclePayload.vin ?? '').trim(),
      make: String(vehiclePayload.make ?? '').trim(),
      model: String(vehiclePayload.model ?? '').trim(),
      year: Number(vehiclePayload.year),
      color: String(vehiclePayload.color ?? '').trim(),
      trim: String(vehiclePayload.trim ?? '').trim(),
      engineType: String(vehiclePayload.engineType ?? '').trim(),
      fuelType: String(vehiclePayload.fuelType ?? '').toUpperCase(),
      weightKg: Number(vehiclePayload.weightKg ?? 0),
      lengthMm: vehiclePayload.lengthMm !== undefined && vehiclePayload.lengthMm !== null
        ? Number(vehiclePayload.lengthMm)
        : undefined,
      widthMm: vehiclePayload.widthMm !== undefined && vehiclePayload.widthMm !== null
        ? Number(vehiclePayload.widthMm)
        : undefined,
      heightMm: vehiclePayload.heightMm !== undefined && vehiclePayload.heightMm !== null
        ? Number(vehiclePayload.heightMm)
        : undefined,
      orderDate: String(vehiclePayload.orderDate ?? ''),
      estimatedDelivery: String(vehiclePayload.estimatedDelivery ?? ''),
      status: String(vehiclePayload.status ?? '').toUpperCase(),
      currentLocationId: String(vehiclePayload.currentLocationId ?? '').trim(),
      ownerId: String(vehiclePayload.ownerId ?? '').trim(),
      customsStatus: String(vehiclePayload.customsStatus ?? '').toUpperCase(),
      importDuty: Number(vehiclePayload.importDuty ?? 0),
      customsNotes: vehiclePayload.customsNotes !== undefined ? String(vehiclePayload.customsNotes) : undefined,
    };

    const validatedData = createVehicleSchema.parse(normalizedVehicleData);

    const vehicleUpdateData = {
      vin: validatedData.vin,
      make: validatedData.make,
      model: validatedData.model,
      year: validatedData.year,
      color: validatedData.color,
      trim: validatedData.trim,
      engineType: validatedData.engineType,
      fuelType: validatedData.fuelType,
      weightKg: validatedData.weightKg,
      lengthMm: validatedData.lengthMm,
      widthMm: validatedData.widthMm,
      heightMm: validatedData.heightMm,
      orderDate: new Date(validatedData.orderDate),
      estimatedDelivery: new Date(validatedData.estimatedDelivery),
      status: validatedData.status,
      customsStatus: validatedData.customsStatus,
      importDuty: validatedData.importDuty,
      customsNotes: validatedData.customsNotes,
      currentLocation: {
        connect: { id: validatedData.currentLocationId },
      },
      owner: {
        connect: { id: validatedData.ownerId },
      },
    };

    await VehicleService.updateVehicle(id, vehicleUpdateData);

    if (Array.isArray(images)) {
      const preparedImages = images
        .filter((image: any) => image && typeof image.data === 'string' && image.data.length > 0)
        .map((image: any, index: number) => ({
          data: image.data,
          alt: image.alt,
          caption: image.caption,
          isPrimary: image.isPrimary ?? index === 0,
          url: image.url,
        }));

      await VehicleService.replaceVehicleImages(id, preparedImages);
    }

    const updatedVehicle = await VehicleService.getVehicleById(id);

    return NextResponse.json(updatedVehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update vehicle' },
      { status: 400 }
    );
  }
}

// DELETE /api/vehicles/[id] - Delete vehicle
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // TODO: Get user role from authentication/session
    const userRole = Role.ADMIN; // This should come from your auth system
    
    await VehicleService.deleteVehicle(id);
    
    return NextResponse.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete vehicle' },
      { status: 400 }
    );
  }
}
