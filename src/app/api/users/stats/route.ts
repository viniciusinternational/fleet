import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/user';
import { Role } from '@/types';

// GET /api/users/stats - Get user statistics
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user role from authentication/session
    const userRole = Role.ADMIN; // This should come from your auth system
    
    const stats = await UserService.getUserStats(userRole);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
}