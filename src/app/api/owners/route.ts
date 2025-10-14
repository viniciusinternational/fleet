import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { OwnerService } from '@/lib/services/owner';

// Validation schema for creating an owner
const createOwnerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(1, 'Phone is required').max(20, 'Phone too long'),
  address: z.string().min(1, 'Address is required').max(500, 'Address too long'),
  nationality: z.string().min(1, 'Nationality is required').max(50, 'Nationality too long'),
  idNumber: z.string().min(1, 'ID Number is required').max(50, 'ID Number too long'),
});

// GET /api/owners - List all owners with pagination, search, and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const nationality = searchParams.get('nationality') || '';
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';
    
    // Use the consolidated service
    const result = await OwnerService.getOwners({
      search,
      nationality,
      sortBy,
      sortOrder,
      page,
      limit,
    });
    
    return NextResponse.json({
      success: true,
      data: {
        owners: result.owners,
        pagination: {
          page: result.currentPage,
          limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.hasNextPage,
          hasPrev: result.hasPreviousPage,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching owners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch owners' },
      { status: 500 }
    );
  }
}

// POST /api/owners - Create a new owner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = createOwnerSchema.parse(body);
    
    // Check if owner with same email or ID number already exists
    const existingOwnerByEmail = await OwnerService.getOwnerByEmail(validatedData.email);
    
    if (existingOwnerByEmail) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Owner with this email already exists'
        },
        { status: 400 }
      );
    }
    
    // Create new owner using the service
    const owner = await OwnerService.createOwner(validatedData);
    
    return NextResponse.json({
      success: true,
      data: owner,
      message: 'Owner created successfully',
    }, { status: 201 });
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
    
    console.error('Error creating owner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create owner' },
      { status: 500 }
    );
  }
}


