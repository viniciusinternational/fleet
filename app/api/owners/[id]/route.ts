import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { OwnerService } from '@/lib/services/owner';

// Validation schema for updating an owner
const updateOwnerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().min(1, 'Phone is required').max(20, 'Phone too long').optional(),
  address: z.string().min(1, 'Address is required').max(500, 'Address too long').optional(),
  country: z.string().min(1, 'Country is required').max(50, 'Country too long').optional(),
});

// GET /api/owners/[id] - Get owner by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const owner = await OwnerService.getOwnerById(id);
    
    if (!owner) {
      return NextResponse.json(
        { error: 'Owner not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(owner);
  } catch (error) {
    console.error('Error fetching owner:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch owner' },
      { status: 500 }
    );
  }
}

// PUT /api/owners/[id] - Update owner by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate input
    const validatedData = updateOwnerSchema.parse(body);
    
    // Check if owner exists
    const existingOwner = await OwnerService.getOwnerById(id);
    
    if (!existingOwner) {
      return NextResponse.json(
        { error: 'Owner not found' },
        { status: 404 }
      );
    }
    
    // Check for duplicate email (excluding current owner)
    if (validatedData.email && validatedData.email !== existingOwner.email) {
      const duplicateOwner = await OwnerService.getOwnerByEmail(validatedData.email);
      
      if (duplicateOwner) {
        return NextResponse.json(
          { error: 'Owner with this email already exists' },
          { status: 400 }
        );
      }
    }
    
    // Update owner using the service
    const updatedOwner = await OwnerService.updateOwner(id, validatedData);
    
    if (!updatedOwner) {
      return NextResponse.json(
        { error: 'Failed to update owner' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(updatedOwner);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.issues 
        },
        { status: 400 }
      );
    }
    
    console.error('Error updating owner:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update owner' },
      { status: 500 }
    );
  }
}

// DELETE /api/owners/[id] - Delete owner by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if owner exists and has vehicles
    const existingOwner = await OwnerService.getOwnerById(id);
    
    if (!existingOwner) {
      return NextResponse.json(
        { error: 'Owner not found' },
        { status: 404 }
      );
    }
    
    // Check if owner has vehicles
    if ((existingOwner as any).vehicles && Array.isArray((existingOwner as any).vehicles) && (existingOwner as any).vehicles.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete owner with associated vehicles. Please reassign or delete vehicles first.' },
        { status: 400 }
      );
    }
    
    // Delete owner using the service
    const success = await OwnerService.deleteOwner(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete owner' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ message: 'Owner deleted successfully' });
  } catch (error) {
    console.error('Error deleting owner:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete owner' },
      { status: 500 }
    );
  }
}


