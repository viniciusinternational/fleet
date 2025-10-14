import { NextRequest, NextResponse } from 'next/server';
import { LocationService } from '@/lib/services/location';
import { Role } from '@/types';

// GET /api/locations/stats - Get location statistics
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user role from authentication/session
    const userRole = Role.ADMIN; // This should come from your auth system
    
    const stats = await LocationService.getLocationStats(userRole);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching location stats:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch location statistics' },
      { status: 500 }
    );
  }
}