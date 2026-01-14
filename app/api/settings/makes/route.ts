import { NextRequest, NextResponse } from 'next/server';
import { SettingsService } from '@/lib/services/settings';
import { hasPermission } from '@/lib/permissions';

// Helper to get user from request (placeholder - should be replaced with actual auth)
async function getCurrentUser(request: NextRequest) {
  // TODO: Implement actual authentication
  // For now, return null - permissions will be checked in production
  return null;
}

// GET /api/settings/makes - Get all makes
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    // Check permission
    // if (!hasPermission(user, 'view_settings')) {
    //   return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    // }

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const makes = await SettingsService.getMakes(includeInactive);

    return NextResponse.json({
      success: true,
      data: makes,
    });
  } catch (error) {
    console.error('Error fetching makes:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch makes',
      },
      { status: 500 }
    );
  }
}

// POST /api/settings/makes - Create new make
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    // Check permission
    // if (!hasPermission(user, 'add_settings')) {
    //   return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    // }

    const body = await request.json();
    const { name, isActive } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    const make = await SettingsService.createMake({
      name: name.trim(),
      isActive: isActive ?? true,
    });

    return NextResponse.json({
      success: true,
      data: make,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating make:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'A make with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create make',
      },
      { status: 500 }
    );
  }
}

