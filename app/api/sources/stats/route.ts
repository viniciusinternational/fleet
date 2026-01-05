import { NextRequest, NextResponse } from 'next/server';
import { SourceService } from '@/lib/services/source';

// GET /api/sources/stats - Get source statistics
export async function GET(request: NextRequest) {
  try {
    const stats = await SourceService.getSourceStats();
    
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching source stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch source statistics' },
      { status: 500 }
    );
  }
}

