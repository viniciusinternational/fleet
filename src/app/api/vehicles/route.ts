import { NextRequest, NextResponse } from 'next/server';
import { VehicleService } from '@/lib/services/vehicle';
import { z } from 'zod';

// Validation schema for vehicle creation
const createVehicleSchema = z.object({
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
  orderDate: z.string().datetime(),
  estimatedDelivery: z.string().datetime(),
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
    // Parse FormData instead of JSON
    const formData = await request.formData();
    
    // Extract all form fields
    const vehicleData = {
      vin: formData.get('vin') as string,
      make: formData.get('make') as string,
      model: formData.get('model') as string,
      year: parseInt(formData.get('year') as string),
      color: formData.get('color') as string,
      trim: formData.get('trim') as string,
      engineType: formData.get('engineType') as string,
      fuelType: formData.get('fuelType') as string,
      weightKg: parseInt(formData.get('weightKg') as string),
      lengthMm: parseInt(formData.get('lengthMm') as string) || undefined,
      widthMm: parseInt(formData.get('widthMm') as string) || undefined,
      heightMm: parseInt(formData.get('heightMm') as string) || undefined,
      orderDate: formData.get('orderDate') as string,
      estimatedDelivery: formData.get('estimatedDelivery') as string,
      status: formData.get('status') as string,
      currentLocationId: formData.get('currentLocationId') as string,
      ownerId: formData.get('ownerId') as string,
      customsStatus: formData.get('customsStatus') as string,
      importDuty: parseInt(formData.get('importDuty') as string),
      customsNotes: formData.get('customsNotes') as string || undefined,
      notes: formData.get('notes') as string || undefined,
    };

    // Note: Shipping details are now handled separately via /api/vehicles/[id]/shipping endpoint

    // Extract images
    const images = formData.getAll('images') as File[];
    
    // Validate the vehicle data
    const validatedData = createVehicleSchema.parse(vehicleData);
    
    // Check if VIN already exists
    const existingVehicle = await VehicleService.getVehicleById(validatedData.vin);
    if (existingVehicle) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vehicle with this VIN already exists',
        },
        { status: 400 }
      );
    }

    // Handle image uploads
    let imageUrls: string[] = [];
    if (images.length > 0) {
      try {
        // Create uploads directory if it doesn't exist
        const fs = require('fs');
        const path = require('path');
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'vehicles');
        
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Save each image
        for (const image of images) {
          const buffer = await image.arrayBuffer();
          const filename = `${Date.now()}-${image.name}`;
          const filepath = path.join(uploadsDir, filename);
          
          fs.writeFileSync(filepath, Buffer.from(buffer));
          imageUrls.push(`/uploads/vehicles/${filename}`);
        }
      } catch (imageError) {
        console.warn('Failed to save images:', imageError);
        // Continue without images rather than failing the entire request
      }
    }

    // Create the vehicle first (without images)
    const newVehicle = await VehicleService.createVehicle({
      ...validatedData,
      orderDate: new Date(validatedData.orderDate),
      estimatedDelivery: new Date(validatedData.estimatedDelivery),
    });

    // Create vehicle images if any
    if (imageUrls.length > 0) {
      try {
        await VehicleService.createVehicleImages(newVehicle.id, imageUrls);
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