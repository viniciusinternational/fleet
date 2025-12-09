import { NextRequest, NextResponse } from 'next/server';
import { VehicleService } from '@/lib/services/vehicle';
import { uploadVehicleImage } from '@/lib/s3';
import { Role } from '@/types';
import { createVehicleSchema } from '../route';
import { z } from 'zod';

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
    
    // Fetch existing vehicle to preserve fields not included in the form
    const existingVehicle = await VehicleService.getVehicleById(id);
    if (!existingVehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }
    
    // Handle FormData
    const formData = await request.formData();

    // Extract vehicle data from FormData, using existing values as fallback
    const normalizedVehicleData = {
      vin: String(formData.get('vin') ?? existingVehicle.vin ?? '').trim(),
      make: String(formData.get('make') ?? existingVehicle.make ?? '').trim(),
      model: String(formData.get('model') ?? existingVehicle.model ?? '').trim(),
      year: formData.get('year') ? Number(formData.get('year')) : existingVehicle.year,
      color: String(formData.get('color') ?? existingVehicle.color ?? '').trim(),
      trim: String(formData.get('trim') ?? existingVehicle.trim ?? '').trim(),
      engineType: String(formData.get('engineType') ?? existingVehicle.engineType ?? '').trim(),
      fuelType: formData.get('fuelType') 
        ? String(formData.get('fuelType')).toUpperCase() 
        : String(existingVehicle.fuelType ?? '').toUpperCase(),
      weightKg: formData.get('weightKg') ? Number(formData.get('weightKg')) : existingVehicle.weightKg ?? 0,
      lengthMm: formData.get('lengthMm') 
        ? Number(formData.get('lengthMm')) 
        : existingVehicle.lengthMm ?? undefined,
      widthMm: formData.get('widthMm') 
        ? Number(formData.get('widthMm')) 
        : existingVehicle.widthMm ?? undefined,
      heightMm: formData.get('heightMm') 
        ? Number(formData.get('heightMm')) 
        : existingVehicle.heightMm ?? undefined,
      orderDate: formData.get('orderDate') 
        ? String(formData.get('orderDate')) 
        : existingVehicle.orderDate ? new Date(existingVehicle.orderDate).toISOString() : '',
      estimatedDelivery: formData.get('estimatedDelivery') 
        ? String(formData.get('estimatedDelivery')) 
        : existingVehicle.estimatedDelivery ? new Date(existingVehicle.estimatedDelivery).toISOString() : '',
      status: formData.get('status') 
        ? String(formData.get('status')).toUpperCase() 
        : String(existingVehicle.status ?? '').toUpperCase(),
      currentLocationId: String(formData.get('currentLocationId') ?? existingVehicle.currentLocationId ?? '').trim(),
      ownerId: String(formData.get('ownerId') ?? existingVehicle.ownerId ?? '').trim(),
      customsStatus: (() => {
        const formValue = formData.get('customsStatus');
        if (formValue) {
          const value = String(formValue).trim();
          // Map common variations to enum values
          const customsStatusMap: Record<string, string> = {
            'pending': 'PENDING',
            'in progress': 'IN_PROGRESS',
            'in_progress': 'IN_PROGRESS',
            'cleared': 'CLEARED',
            'held': 'HELD',
          };
          return customsStatusMap[value.toLowerCase()] || value.toUpperCase();
        }
        return String(existingVehicle.customsStatus ?? 'PENDING').toUpperCase();
      })(),
      importDuty: formData.get('importDuty') 
        ? Number(formData.get('importDuty')) 
        : existingVehicle.importDuty ?? 0,
      customsNotes: formData.get('customsNotes') 
        ? String(formData.get('customsNotes')) 
        : existingVehicle.customsNotes ?? undefined,
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
          await VehicleService.replaceVehicleImages(id, preparedImages);
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

        console.error('Failed to upload vehicle images to S3:', imageError);
        throw new Error('Failed to upload vehicle images to S3');
      }
    }

    const updatedVehicle = await VehicleService.getVehicleById(id);

    return NextResponse.json(updatedVehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      );
    }

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
