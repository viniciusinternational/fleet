import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SourceService } from '@/lib/services/source';

// Validation schema for creating a source
const createSourceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(1, 'Phone is required').max(20, 'Phone too long'),
  address: z.string().min(1, 'Address is required').max(500, 'Address too long'),
  country: z.string().min(1, 'Country is required').max(50, 'Country too long'),
});

// GET /api/sources - List all sources with pagination, search, and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const country = searchParams.get('country') || '';
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';
    
    // Use the consolidated service
    const result = await SourceService.getSources({
      search,
      country,
      sortBy,
      sortOrder,
      page,
      limit,
    });
    
    return NextResponse.json({
      success: true,
      data: {
        sources: result.sources,
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
    console.error('Error fetching sources:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sources' },
      { status: 500 }
    );
  }
}

// POST /api/sources - Create a new source
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = createSourceSchema.parse(body);
    
    // Check if source with same email or ID number already exists
    const existingSourceByEmail = await SourceService.getSourceByEmail(validatedData.email);
    
    if (existingSourceByEmail) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Source with this email already exists'
        },
        { status: 400 }
      );
    }
    
    // Create new source using the service
    const source = await SourceService.createSource(validatedData);
    
    return NextResponse.json({
      success: true,
      data: source,
      message: 'Source created successfully',
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
    
    console.error('Error creating source:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create source' },
      { status: 500 }
    );
  }
}

