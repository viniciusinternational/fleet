import { NextRequest, NextResponse } from 'next/server';
import { VehicleService } from '@/lib/services/vehicle';
import { LocationService } from '@/lib/services/location';
import { OwnerService } from '@/lib/services/owner';
import { UserService } from '@/lib/services/user';

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    // Fetch all stats in parallel for better performance
    const [
      vehicleStats,
      locationStats,
      ownerStats,
      userStats,
      recentVehicles,
    ] = await Promise.all([
      VehicleService.getVehicleStats(),
      LocationService.getLocationStats(),
      OwnerService.getOwnerStats(),
      UserService.getUserStats('Admin'), // Admin role for access
      VehicleService.getRecentVehicles(5),
    ]);

    // Aggregate the dashboard stats
    const dashboardStats = {
      overview: {
        totalVehicles: vehicleStats.overview.totalVehicles,
        totalUsers: userStats.total,
        totalLocations: locationStats.overview.totalLocations,
        totalOwners: ownerStats.overview.totalOwners,
      },
      recent: {
        recentVehicles: recentVehicles,
        recentVehiclesCount: recentVehicles.length,
      },
      breakdown: {
        vehicles: vehicleStats,
        locations: locationStats,
        owners: ownerStats,
        users: userStats,
      },
    };

    return NextResponse.json({
      success: true,
      data: dashboardStats,
    });
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
