import { NextRequest, NextResponse } from 'next/server';
import { LocationService } from '@/lib/services/location';
import { Role } from '@/types';

// GET /api/locations - Get all locations with filtering, sorting, pagination and filter options
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user role from authentication/session
    const userRole = Role.ADMIN; // This should come from your auth system
    
    const { searchParams } = new URL(request.url);
    
    const filters = {
      search: searchParams.get('search') || undefined,
      type: searchParams.get('type') as any || undefined,
      status: searchParams.get('status') as any || undefined,
      city: searchParams.get('city') || undefined,
      country: searchParams.get('country') || undefined,
    };

    const sortOptions = {
      sortBy: searchParams.get('sortBy') as any || 'name',
      sortOrder: searchParams.get('sortOrder') as 'asc' | 'desc' || 'asc',
    };

    const paginationOptions = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    };

    const result = await LocationService.getLocations(
      filters,
      sortOptions,
      paginationOptions,
      userRole
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

// POST /api/locations - Create new location
export async function POST(request: NextRequest) {
  try {
    // TODO: Get user role from authentication/session
    const userRole = Role.ADMIN; // This should come from your auth system
    
    const body = await request.json();
    
    const location = await LocationService.createLocation(body, userRole);
    
    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create location' },
      { status: 400 }
    );
  }
}