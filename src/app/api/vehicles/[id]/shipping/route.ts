import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for shipping details
const shippingDetailsSchema = z.object({
  originPort: z.string().min(1, 'Origin port is required'),
  destinationPort: z.string().min(1, 'Destination port is required'),
  shippingCompany: z.string().min(1, 'Shipping company is required'),
  vesselName: z.string().optional(),
  containerNumber: z.string().optional(),
  bookingNumber: z.string().min(1, 'Booking number is required'),
  departureDate: z.string().optional(),
  expectedArrivalDate: z.string().optional(),
  documents: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string()
  })).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vehicleId } = await params;
    
    // Handle FormData
    const formData = await request.formData();
    
    // Extract shipping details from FormData
    const shippingData = {
      originPort: formData.get('originPort') as string,
      destinationPort: formData.get('destinationPort') as string,
      shippingCompany: formData.get('shippingCompany') as string,
      vesselName: formData.get('vesselName') as string || undefined,
      containerNumber: formData.get('containerNumber') as string || undefined,
      bookingNumber: formData.get('bookingNumber') as string,
      departureDate: formData.get('departureDate') as string || undefined,
      expectedArrivalDate: formData.get('expectedArrivalDate') as string || undefined,
    };
    
    // Handle shipping documents
    const shippingDocuments: { id: string; name: string; url: string }[] = [];
    const documentFiles = formData.getAll('documents') as File[];
    
    console.log(`Processing ${documentFiles.length} document files`);
    
    if (documentFiles.length > 0) {
      // Save documents to public/uploads/shipping/
      for (let i = 0; i < documentFiles.length; i++) {
        const file = documentFiles[i];
        console.log(`Processing file ${i + 1}: ${file.name}, size: ${file.size} bytes`);
        
        if (file.size > 0) {
          try {
            const timestamp = Date.now();
            const fileName = `${timestamp}-${file.name}`;
            const filePath = `public/uploads/shipping/${fileName}`;
            
            // Save file to filesystem
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            
            // Create directory if it doesn't exist
            const fs = require('fs');
            const path = require('path');
            const uploadDir = path.join(process.cwd(), 'public/uploads/shipping');
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }
            
            fs.writeFileSync(path.join(process.cwd(), filePath), buffer);
            console.log(`File saved successfully: ${filePath}`);
            
            // Add to documents array
            shippingDocuments.push({
              id: `doc-${timestamp}-${i}`,
              name: file.name,
              url: `/uploads/shipping/${fileName}`
            });
            console.log(`Document added to array: ${file.name}`);
          } catch (error) {
            console.error(`Error saving file ${file.name}:`, error);
            throw error;
          }
        } else {
          console.log(`Skipping empty file: ${file.name}`);
        }
      }
    }
    
    console.log(`Total documents processed: ${shippingDocuments.length}`);
    
    // Add documents to shipping data
    const fullShippingData = {
      ...shippingData,
      documents: shippingDocuments.length > 0 ? shippingDocuments : undefined
    };
    
    // Validate the request body
    const validatedData = shippingDetailsSchema.parse(fullShippingData);
    
    // Check if vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });
    
    if (!vehicle) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vehicle not found',
        },
        { status: 404 }
      );
    }

    // Check if shipping details already exist for this vehicle
    const existingShippingDetails = await prisma.shippingDetails.findFirst({
      where: { vehicle: { id: vehicleId } },
    });
    
    if (existingShippingDetails) {
      return NextResponse.json(
        {
          success: false,
          error: 'Shipping details already exist for this vehicle',
        },
        { status: 400 }
      );
    }

    // Create shipping details
    const shippingDetails = await prisma.shippingDetails.create({
      data: {
        vehicleId: vehicleId,
        vehicle: { connect: { id: vehicleId } },
        originPort: validatedData.originPort,
        destinationPort: validatedData.destinationPort,
        shippingCompany: validatedData.shippingCompany,
        vesselName: validatedData.vesselName,
        containerNumber: validatedData.containerNumber,
        bookingNumber: validatedData.bookingNumber,
        departureDate: validatedData.departureDate ? new Date(validatedData.departureDate + 'T00:00:00.000Z') : null,
        expectedArrivalDate: validatedData.expectedArrivalDate ? new Date(validatedData.expectedArrivalDate + 'T00:00:00.000Z') : null,
        documents: validatedData.documents || null,
      },
    });

    // Update vehicle to link shipping details
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { shippingDetailsId: shippingDetails.id },
    });

    return NextResponse.json({
      success: true,
      data: shippingDetails,
      message: 'Shipping details created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating shipping details:', error);
    
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
        error: 'Failed to create shipping details',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vehicleId } = await params;
    
    // Handle FormData
    const formData = await request.formData();
    
    // Extract shipping details from FormData
    const shippingData = {
      originPort: formData.get('originPort') as string,
      destinationPort: formData.get('destinationPort') as string,
      shippingCompany: formData.get('shippingCompany') as string,
      vesselName: formData.get('vesselName') as string || undefined,
      containerNumber: formData.get('containerNumber') as string || undefined,
      bookingNumber: formData.get('bookingNumber') as string,
      departureDate: formData.get('departureDate') as string || undefined,
      expectedArrivalDate: formData.get('expectedArrivalDate') as string || undefined,
    };
    
    // Handle shipping documents
    const shippingDocuments: { id: string; name: string; url: string }[] = [];
    const documentFiles = formData.getAll('documents') as File[];
    
    console.log(`Processing ${documentFiles.length} document files`);
    
    // Save uploaded documents
    for (const file of documentFiles) {
      if (file.size > 0) {
        const timestamp = Date.now();
        const fileName = `${timestamp}-${file.name}`;
        const filePath = `public/uploads/shipping/${fileName}`;
        
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
        
        // Add to documents array
        shippingDocuments.push({
          id: `doc-${timestamp}-${shippingDocuments.length}`,
          name: file.name,
          url: `/uploads/shipping/${fileName}`
        });
        
        console.log(`Saved document: ${fileName}`);
      }
    }
    
    console.log(`Total documents to save: ${shippingDocuments.length}`);
    
    // Validate the shipping data
    const validatedData = shippingDetailsSchema.parse({
      ...shippingData,
      documents: shippingDocuments.length > 0 ? shippingDocuments : undefined
    });
    
    // Check if vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });
    
    if (!vehicle) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vehicle not found',
        },
        { status: 404 }
      );
    }

    // Update shipping details
    const updatedShippingDetails = await prisma.shippingDetails.update({
      where: { vehicleId },
      data: {
        originPort: validatedData.originPort,
        destinationPort: validatedData.destinationPort,
        shippingCompany: validatedData.shippingCompany,
        vesselName: validatedData.vesselName,
        containerNumber: validatedData.containerNumber,
        bookingNumber: validatedData.bookingNumber,
        departureDate: validatedData.departureDate ? new Date(validatedData.departureDate + 'T00:00:00.000Z') : null,
        expectedArrivalDate: validatedData.expectedArrivalDate ? new Date(validatedData.expectedArrivalDate + 'T00:00:00.000Z') : null,
        documents: validatedData.documents || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedShippingDetails,
      message: 'Shipping details updated successfully',
    });

  } catch (error) {
    console.error('Error updating shipping details:', error);
    
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
        error: 'Failed to update shipping details',
      },
      { status: 500 }
    );
  }
}
