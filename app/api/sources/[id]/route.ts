import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SourceService } from '@/lib/services/source';

// Validation schema for updating a source
const updateSourceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().min(1, 'Phone is required').max(20, 'Phone too long').optional(),
  address: z.string().min(1, 'Address is required').max(500, 'Address too long').optional(),
  nationality: z.string().min(1, 'Nationality is required').max(50, 'Nationality too long').optional(),
  idNumber: z.string().min(1, 'ID Number is required').max(50, 'ID Number too long').optional(),
});

// GET /api/sources/[id] - Get source by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const source = await SourceService.getSourceById(id);
    
    if (!source) {
      return NextResponse.json(
        { success: false, error: 'Source not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: source,
    });
  } catch (error) {
    console.error('Error fetching source:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch source' },
      { status: 500 }
    );
  }
}

// PUT /api/sources/[id] - Update source by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate input
    const validatedData = updateSourceSchema.parse(body);
    
    // Check if source exists
    const existingSource = await SourceService.getSourceById(id);
    
    if (!existingSource) {
      return NextResponse.json(
        { success: false, error: 'Source not found' },
        { status: 404 }
      );
    }
    
    // Check for duplicate email (excluding current source)
    if (validatedData.email && validatedData.email !== existingSource.email) {
      const duplicateSource = await SourceService.getSourceByEmail(validatedData.email);
      
      if (duplicateSource) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Source with this email already exists'
          },
          { status: 400 }
        );
      }
    }
    
    // Update source using the service
    const updatedSource = await SourceService.updateSource(id, validatedData);
    
    if (!updatedSource) {
      return NextResponse.json(
        { success: false, error: 'Failed to update source' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedSource,
      message: 'Source updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: error.issues 
        },
        { status: 400 }
      );
    }
    
    console.error('Error updating source:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update source' },
      { status: 500 }
    );
  }
}

// DELETE /api/sources/[id] - Delete source by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if source exists
    const existingSource = await SourceService.getSourceById(id);
    
    if (!existingSource) {
      return NextResponse.json(
        { success: false, error: 'Source not found' },
        { status: 404 }
      );
    }
    
    // Delete source using the service
    const deleted = await SourceService.deleteSource(id);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete source' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Source deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting source:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete source' },
      { status: 500 }
    );
  }
}

