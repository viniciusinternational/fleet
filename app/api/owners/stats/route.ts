import { NextRequest, NextResponse } from 'next/server';
import { OwnerService } from '@/lib/services/owner';

// GET /api/owners/stats - Get owner statistics
export async function GET(request: NextRequest) {
  try {
    // Use the consolidated service
    const stats = await OwnerService.getOwnerStats();
    
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching owner statistics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch owner statistics' },
      { status: 500 }
    );
  }
}
