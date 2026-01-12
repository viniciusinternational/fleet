import { NextRequest, NextResponse } from 'next/server';
import { VehicleService } from '@/lib/services/vehicle';
import { uploadVehicleImage } from '@/lib/s3';
import { Role } from '@/types';
import { createVehicleSchema } from '../route';
import { TRANSMISSION_ENUM_MAP } from '@/lib/constants/vehicle';

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
    
    // Handle FormData (since images are included)
    const formData = await request.formData();

    // Get existing vehicle to preserve customs data if not provided
    const existingVehicle = await VehicleService.getVehicleById(id);
    if (!existingVehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Extract vehicle data from FormData
    const customsStatusValue = formData.get('customsStatus');
    const importDutyValue = formData.get('importDuty');
    
    const normalizedVehicleData: any = {
      vin: String(formData.get('vin') ?? '').trim(),
      make: String(formData.get('make') ?? '').trim(),
      model: String(formData.get('model') ?? '').trim(),
      year: Number(formData.get('year')),
      color: String(formData.get('color') ?? '').trim(),
      trim: String(formData.get('trim') ?? '').trim(),
      engineType: String(formData.get('engineType') ?? '').trim(),
      fuelType: String(formData.get('fuelType') ?? '').toUpperCase(),
      transmission: formData.get('transmission') 
        ? TRANSMISSION_ENUM_MAP[formData.get('transmission') as keyof typeof TRANSMISSION_ENUM_MAP] || String(formData.get('transmission')).replace(/-/g, '_').toUpperCase()
        : undefined,
      weightKg: Number(formData.get('weightKg') ?? 0),
      lengthMm: formData.get('lengthMm') ? Number(formData.get('lengthMm')) : undefined,
      widthMm: formData.get('widthMm') ? Number(formData.get('widthMm')) : undefined,
      heightMm: formData.get('heightMm') ? Number(formData.get('heightMm')) : undefined,
      orderDate: String(formData.get('orderDate') ?? ''),
      estimatedDelivery: String(formData.get('estimatedDelivery') ?? ''),
      status: String(formData.get('status') ?? '').toUpperCase(),
      currentLocationId: String(formData.get('currentLocationId') ?? '').trim(),
      ownerId: formData.get('ownerId') ? String(formData.get('ownerId')).trim() : undefined,
      sourceId: String(formData.get('sourceId') ?? '').trim(),
      // Use provided customs data or fallback to existing vehicle data
      customsStatus: customsStatusValue && String(customsStatusValue).trim() 
        ? String(customsStatusValue).toUpperCase() 
        : (existingVehicle as any).customsStatus || 'PENDING',
      importDuty: importDutyValue !== null && importDutyValue !== undefined && String(importDutyValue).trim()
        ? Number(importDutyValue)
        : (existingVehicle as any).importDuty || 0,
      customsNotes: formData.get('customsNotes') ? String(formData.get('customsNotes')) : (existingVehicle as any).customsNotes || undefined,
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
      source: {
        connect: { id: validatedData.sourceId },
      },
      ...(validatedData.ownerId ? {
        owner: {
          connect: { id: validatedData.ownerId },
        },
      } : {
        owner: {
          disconnect: true
        }
      }),
    };

    await VehicleService.updateVehicle(id, vehicleUpdateData);

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
              id,
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
          await VehicleService.createVehicleImages(id, preparedImages);
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
        console.error('Error uploading vehicle images:', imageError);
        // Don't throw - allow vehicle update to succeed even if image upload fails
      }
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
