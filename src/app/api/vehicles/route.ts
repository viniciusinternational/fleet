import { NextRequest, NextResponse } from 'next/server';
import { VehicleService } from '@/lib/services/vehicle';
import { z } from 'zod';

// Validation schema for vehicle creation
export const createVehicleSchema = z.object({
  vin: z.string().min(1, 'VIN is required'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().min(1, 'Color is required'),
  trim: z.string().min(1, 'Trim is required'),
  engineType: z.string().min(1, 'Engine type is required'),
  fuelType: z.enum(['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID']),
  weightKg: z.number().min(0),
  lengthMm: z.number().min(0).optional(),
  widthMm: z.number().min(0).optional(),
  heightMm: z.number().min(0).optional(),
  orderDate: z.string().min(1, 'Order date is required'),
  estimatedDelivery: z.string().min(1, 'Estimated delivery is required'),
  status: z.enum(['ORDERED', 'IN_TRANSIT', 'CLEARING_CUSTOMS', 'AT_PORT', 'IN_LOCAL_DELIVERY', 'DELIVERED']),
  currentLocationId: z.string().min(1, 'Current location is required'),
  ownerId: z.string().min(1, 'Owner is required'),
  customsStatus: z.enum(['PENDING', 'IN_PROGRESS', 'CLEARED', 'HELD']),
  importDuty: z.number().min(0),
  customsNotes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params = {
      search: searchParams.get('search') || '',
      status: searchParams.get('status') || 'all',
      sortBy: searchParams.get('sortBy') || 'orderDate',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    };

    const result = await VehicleService.getVehicles(params);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch vehicles',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      images = [],
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

    // Check if VIN already exists
    const existingVehicle = await VehicleService.getVehicleByVin(validatedData.vin);
    if (existingVehicle) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vehicle with this VIN already exists',
        },
        { status: 400 }
      );
    }

    // Create the vehicle first (without images)
    const newVehicle = await VehicleService.createVehicle({
      ...validatedData,
      orderDate: new Date(validatedData.orderDate),
      estimatedDelivery: new Date(validatedData.estimatedDelivery),
    });

    // Create vehicle images if any
    if (Array.isArray(images) && images.length > 0) {
      try {
        const preparedImages = images
          .filter((image: any) => image && typeof image.data === 'string' && image.data.length > 0)
          .map((image: any, index: number) => ({
            data: image.data,
            alt: image.alt,
            caption: image.caption,
            isPrimary: image.isPrimary ?? index === 0,
            url: image.url,
          }));

        if (preparedImages.length > 0) {
          await VehicleService.createVehicleImages(newVehicle.id, preparedImages);
        }
      } catch (imageError) {
        console.warn('Failed to create vehicle images:', imageError);
        // Don't fail the entire request if images fail
      }
    }

    // Note: Shipping details are now handled separately via /api/vehicles/[id]/shipping endpoint

    return NextResponse.json({
      success: true,
      data: newVehicle,
      message: 'Vehicle created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating vehicle:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create vehicle',
      },
      { status: 500 }
    );
  }
}