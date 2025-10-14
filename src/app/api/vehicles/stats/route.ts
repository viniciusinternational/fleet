import { NextRequest, NextResponse } from 'next/server';
import { VehicleService } from '@/lib/services/vehicle';
import { Role } from '@/types';

// GET /api/vehicles/stats - Get vehicle statistics
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user role from authentication/session
    const userRole = Role.ADMIN; // This should come from your auth system
    
    const stats = await VehicleService.getVehicleStats(userRole);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching vehicle stats:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch vehicle statistics' },
      { status: 500 }
    );
  }
}
