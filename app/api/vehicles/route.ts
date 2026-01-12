import { NextRequest, NextResponse } from 'next/server';
import { VehicleService } from '@/lib/services/vehicle';
import { uploadVehicleImage } from '@/lib/s3';
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
  sourceId: z.string().optional(),
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
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch vehicles';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Handle FormData
    const formData = await request.formData();

    // Extract vehicle data from FormData
    const normalizedVehicleData = {
      vin: String(formData.get('vin') ?? '').trim(),
      make: String(formData.get('make') ?? '').trim(),
      model: String(formData.get('model') ?? '').trim(),
      year: Number(formData.get('year')),
      color: String(formData.get('color') ?? '').trim(),
      trim: String(formData.get('trim') ?? '').trim(),
      engineType: String(formData.get('engineType') ?? '').trim(),
      fuelType: String(formData.get('fuelType') ?? '').toUpperCase(),
      weightKg: Number(formData.get('weightKg') ?? 0),
      lengthMm: formData.get('lengthMm') ? Number(formData.get('lengthMm')) : undefined,
      widthMm: formData.get('widthMm') ? Number(formData.get('widthMm')) : undefined,
      heightMm: formData.get('heightMm') ? Number(formData.get('heightMm')) : undefined,
      orderDate: String(formData.get('orderDate') ?? ''),
      estimatedDelivery: String(formData.get('estimatedDelivery') ?? ''),
      status: String(formData.get('status') ?? '').toUpperCase(),
      currentLocationId: String(formData.get('currentLocationId') ?? '').trim(),
      ownerId: String(formData.get('ownerId') ?? '').trim(),
      sourceId: formData.get('sourceId') ? String(formData.get('sourceId')).trim() : undefined,
      customsStatus: String(formData.get('customsStatus') ?? '').toUpperCase(),
      importDuty: Number(formData.get('importDuty') ?? 0),
      customsNotes: formData.get('customsNotes') ? String(formData.get('customsNotes')) : undefined,
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
    const { currentLocationId, ownerId, sourceId, ...restValidatedData } = validatedData;
    const vehicleCreateData: any = {
      ...restValidatedData,
      orderDate: new Date(validatedData.orderDate),
      estimatedDelivery: new Date(validatedData.estimatedDelivery),
      currentLocation: {
        connect: { id: currentLocationId },
      },
      owner: {
        connect: { id: ownerId },
      },
    };
    
    // Only add source connection if sourceId is provided
    if (sourceId) {
      vehicleCreateData.source = {
        connect: { id: sourceId },
      };
    }
    
    const newVehicle = await VehicleService.createVehicle(vehicleCreateData);

    // Process and upload vehicle images to S3
    const imageFiles = formData.getAll('images') as File[];
    const uploadedImageKeys: string[] = [];

    if (imageFiles.length > 0) {
      try {
        const preparedImages = [];

        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          
          if (file.size > 0) {
            // Convert file to buffer
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Upload to S3
            const uploadResult = await uploadVehicleImage(
              newVehicle.id,
              buffer,
              file.name,
              file.type || 'image/jpeg'
            );

            uploadedImageKeys.push(uploadResult.path);

            // Prepare image data for database
            preparedImages.push({
              url: uploadResult.url,
              alt: `${validatedData.make} ${validatedData.model}`.trim() || `Vehicle image ${i + 1}`,
              caption: file.name,
              isPrimary: i === 0,
              data: '', // No base64 storage, only S3 URL
            });
          }
        }

        if (preparedImages.length > 0) {
          await VehicleService.createVehicleImages(newVehicle.id, preparedImages);
        }
      } catch (imageError) {
        // Rollback: Delete uploaded images from S3
        const { deleteFromS3 } = await import('@/lib/s3');
        for (const key of uploadedImageKeys) {
          try {
            await deleteFromS3(key);
          } catch (deleteError) {
            console.error(`Failed to delete image ${key} from S3:`, deleteError);
          }
        }

        // Rollback: Delete the vehicle
        try {
          await VehicleService.deleteVehicle(newVehicle.id);
        } catch (deleteError) {
          console.error('Failed to delete vehicle after image upload failure:', deleteError);
        }

        console.error('Failed to upload vehicle images to S3:', imageError);
        throw new Error('Failed to upload vehicle images to S3. Vehicle creation rolled back.');
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
        error: error instanceof Error ? error.message : 'Failed to create vehicle',
      },
      { status: 500 }
    );
  }
}