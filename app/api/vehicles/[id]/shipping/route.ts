import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { uploadShippingDocument } from '@/lib/s3';
import { z } from 'zod';

// Validation schema for shipping details
const shippingDetailsSchema = z.object({
  originPort: z.string().optional(),
  destinationPort: z.string().optional(),
  shippingCompany: z.string().optional(),
  vesselName: z.string().optional(),
  containerNumber: z.string().optional(),
  bookingNumber: z.string().optional(),
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
    
    // Handle shipping documents - upload to S3
    const shippingDocuments: { id: string; name: string; url: string }[] = [];
    const documentFiles = formData.getAll('documents') as File[];
    const uploadedDocumentKeys: string[] = [];
    
    console.log(`Processing ${documentFiles.length} document files`);
    
    if (documentFiles.length > 0) {
      for (let i = 0; i < documentFiles.length; i++) {
        const file = documentFiles[i];
        console.log(`Processing file ${i + 1}: ${file.name}, size: ${file.size} bytes`);
        
        if (file.size > 0) {
          try {
            // Convert file to buffer
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Determine content type
            const contentType = file.type || 'application/octet-stream';

            // Upload to S3
            const uploadResult = await uploadShippingDocument(
              vehicleId,
              buffer,
              file.name,
              contentType
            );

            uploadedDocumentKeys.push(uploadResult.path);

            // Add to documents array
            const timestamp = Date.now();
            shippingDocuments.push({
              id: `doc-${timestamp}-${i}`,
              name: file.name,
              url: uploadResult.url
            });
            console.log(`Document uploaded to S3: ${file.name} -> ${uploadResult.url}`);
          } catch (error) {
            // Rollback: Delete uploaded documents from S3
            const { deleteFromS3 } = await import('@/lib/s3');
            for (const key of uploadedDocumentKeys) {
              try {
                await deleteFromS3(key);
              } catch (deleteError) {
                console.error(`Failed to delete document ${key} from S3:`, deleteError);
              }
            }
            console.error(`Error uploading file ${file.name} to S3:`, error);
            throw new Error(`Failed to upload shipping document to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    const vehicle = await db.vehicle.findUnique({
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
    const existingShippingDetails = await db.shippingDetails.findFirst({
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
    // Use empty strings for required fields if undefined (Prisma schema requires non-null)
    const shippingDetails = await db.shippingDetails.create({
      data: {
        vehicleId: vehicleId,
        vehicle: { connect: { id: vehicleId } },
        originPort: validatedData.originPort || '',
        destinationPort: validatedData.destinationPort || '',
        shippingCompany: validatedData.shippingCompany || '',
        vesselName: validatedData.vesselName || null,
        containerNumber: validatedData.containerNumber || null,
        bookingNumber: validatedData.bookingNumber || '',
        departureDate: validatedData.departureDate ? new Date(validatedData.departureDate + 'T00:00:00.000Z') : null,
        expectedArrivalDate: validatedData.expectedArrivalDate ? new Date(validatedData.expectedArrivalDate + 'T00:00:00.000Z') : null,
        documents: validatedData.documents || [],
      },
    });

    // Update vehicle to link shipping details
    await db.vehicle.update({
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
    // Convert empty strings to undefined for optional fields
    const getValueOrUndefined = (value: FormDataEntryValue | null): string | undefined => {
      const str = value as string;
      return str && str.trim() ? str : undefined;
    };

    const shippingData = {
      originPort: getValueOrUndefined(formData.get('originPort')),
      destinationPort: getValueOrUndefined(formData.get('destinationPort')),
      shippingCompany: getValueOrUndefined(formData.get('shippingCompany')),
      vesselName: getValueOrUndefined(formData.get('vesselName')),
      containerNumber: getValueOrUndefined(formData.get('containerNumber')),
      bookingNumber: getValueOrUndefined(formData.get('bookingNumber')),
      departureDate: getValueOrUndefined(formData.get('departureDate')),
      expectedArrivalDate: getValueOrUndefined(formData.get('expectedArrivalDate')),
    };
    
    // Handle shipping documents - upload to S3
    const shippingDocuments: { id: string; name: string; url: string }[] = [];
    const documentFiles = formData.getAll('documents') as File[];
    const uploadedDocumentKeys: string[] = [];
    
    console.log(`Processing ${documentFiles.length} document files`);
    
    // Upload documents to S3
    for (const file of documentFiles) {
      if (file.size > 0) {
        try {
          // Convert file to buffer
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          // Determine content type
          const contentType = file.type || 'application/octet-stream';

          // Upload to S3
          const uploadResult = await uploadShippingDocument(
            vehicleId,
            buffer,
            file.name,
            contentType
          );

          uploadedDocumentKeys.push(uploadResult.path);

          // Add to documents array
          const timestamp = Date.now();
          shippingDocuments.push({
            id: `doc-${timestamp}-${shippingDocuments.length}`,
            name: file.name,
            url: uploadResult.url
          });
          
          console.log(`Document uploaded to S3: ${file.name} -> ${uploadResult.url}`);
        } catch (error) {
          // Rollback: Delete uploaded documents from S3
          const { deleteFromS3 } = await import('@/lib/s3');
          for (const key of uploadedDocumentKeys) {
            try {
              await deleteFromS3(key);
            } catch (deleteError) {
              console.error(`Failed to delete document ${key} from S3:`, deleteError);
            }
          }
          console.error(`Error uploading file ${file.name} to S3:`, error);
          throw new Error(`Failed to upload shipping document to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }
    
    console.log(`Total documents processed: ${shippingDocuments.length}`);
    
    // Validate the shipping data
    const validatedData = shippingDetailsSchema.parse({
      ...shippingData,
      documents: shippingDocuments.length > 0 ? shippingDocuments : undefined
    });
    
    // Check if vehicle exists
    const vehicle = await db.vehicle.findUnique({
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
    // Use empty strings for required fields if undefined (Prisma schema requires non-null)
    const updatedShippingDetails = await db.shippingDetails.update({
      where: { vehicleId },
      data: {
        originPort: validatedData.originPort || '',
        destinationPort: validatedData.destinationPort || '',
        shippingCompany: validatedData.shippingCompany || '',
        vesselName: validatedData.vesselName || null,
        containerNumber: validatedData.containerNumber || null,
        bookingNumber: validatedData.bookingNumber || '',
        departureDate: validatedData.departureDate ? new Date(validatedData.departureDate + 'T00:00:00.000Z') : null,
        expectedArrivalDate: validatedData.expectedArrivalDate ? new Date(validatedData.expectedArrivalDate + 'T00:00:00.000Z') : null,
        documents: validatedData.documents || [],
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
