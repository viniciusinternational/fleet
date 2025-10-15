import { NextRequest, NextResponse } from 'next/server';
import { VehicleService } from '@/lib/services/vehicle';
import { Role } from '@/types';

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
    
    // Check if request is FormData (for image uploads) or JSON
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData (with images)
      const formData = await request.formData();
      
      // Extract vehicle data
      const vehicleData = {
        vin: formData.get('vin') as string,
        make: formData.get('make') as string,
        model: formData.get('model') as string,
        year: parseInt(formData.get('year') as string),
        color: formData.get('color') as string,
        trim: formData.get('trim') as string,
        engineType: formData.get('engineType') as string,
        fuelType: formData.get('fuelType') as string,
        weightKg: parseFloat(formData.get('weightKg') as string),
        lengthMm: parseInt(formData.get('lengthMm') as string),
        widthMm: parseInt(formData.get('widthMm') as string),
        heightMm: parseInt(formData.get('heightMm') as string),
        orderDate: formData.get('orderDate') as string,
        estimatedDelivery: formData.get('estimatedDelivery') as string,
        status: formData.get('status') as string,
        currentLocation: {
          connect: { id: formData.get('currentLocationId') as string }
        },
        owner: {
          connect: { id: formData.get('ownerId') as string }
        },
      };
      
      // Handle image uploads
      const imageFiles = formData.getAll('images') as File[];
      const imageUrls: string[] = [];
      
      if (imageFiles.length > 0) {
        // Save uploaded images
        for (const file of imageFiles) {
          if (file.size > 0) {
            const timestamp = Date.now();
            const fileName = `${timestamp}-${file.name}`;
            const filePath = `public/uploads/vehicles/${fileName}`;
            
            // Save file to filesystem
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            
            // Create directory if it doesn't exist
            const fs = require('fs');
            const path = require('path');
            const uploadDir = path.dirname(filePath);
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }
            
            fs.writeFileSync(filePath, buffer);
            imageUrls.push(`/uploads/vehicles/${fileName}`);
          }
        }
      }
      
      // Update vehicle with basic data first
      const vehicle = await VehicleService.updateVehicle(
        id,
        vehicleData
      );
      
      // Create new vehicle images if any were uploaded
      if (imageUrls.length > 0) {
        await VehicleService.createVehicleImages(id, imageUrls);
      }
      
      return NextResponse.json(vehicle);
    } else {
      // Handle JSON (without images)
      const body = await request.json();
      
      // Transform the data to use relations instead of foreign keys
      const vehicleData = {
        ...body,
        currentLocation: body.currentLocationId ? {
          connect: { id: body.currentLocationId }
        } : undefined,
        owner: body.ownerId ? {
          connect: { id: body.ownerId }
        } : undefined,
      };
      
      // Remove the foreign key fields since we're using relations
      delete vehicleData.currentLocationId;
      delete vehicleData.ownerId;
      
      const vehicle = await VehicleService.updateVehicle(
        id,
        vehicleData
      );
      
      return NextResponse.json(vehicle);
    }
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
