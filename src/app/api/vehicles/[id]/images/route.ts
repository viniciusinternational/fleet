import { NextResponse } from 'next/server';
import { VehicleService } from '@/lib/services/vehicle';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const images = await VehicleService.getVehicleImages(id, { includeData: true });

    return NextResponse.json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error('Error fetching vehicle images:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch vehicle images',
      },
      { status: 500 }
    );
  }
}

