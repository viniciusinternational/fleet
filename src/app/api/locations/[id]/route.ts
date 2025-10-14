import { NextRequest, NextResponse } from 'next/server';
import { LocationService } from '@/lib/services/location';
import { Role } from '@/types';

// GET /api/locations/[id] - Get location by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before accessing properties
    const { id } = await params;
    
    // TODO: Get user role and location from authentication/session
    const userRole = Role.ADMIN; // This should come from your auth system
    const userLocationId = undefined; // This should come from your auth system
    
    const location = await LocationService.getLocationById(
      id,
      userRole,
      userLocationId
    );

    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch location' },
      { status: 500 }
    );
  }
}

// PUT /api/locations/[id] - Update location
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before accessing properties
    const { id } = await params;
    
    // TODO: Get user role from authentication/session
    const userRole = Role.ADMIN; // This should come from your auth system
    
    const body = await request.json();
    
    const location = await LocationService.updateLocation(
      id,
      body
    );
    
    return NextResponse.json(location);
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update location' },
      { status: 400 }
    );
  }
}

// DELETE /api/locations/[id] - Delete location
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before accessing properties
    const { id } = await params;
    
    // TODO: Get user role from authentication/session
    const userRole = Role.ADMIN; // This should come from your auth system
    
    await LocationService.deleteLocation(id, userRole);
    
    return NextResponse.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete location' },
      { status: 400 }
    );
  }
}