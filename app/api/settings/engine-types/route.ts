import { NextRequest, NextResponse } from 'next/server';
import { SettingsService } from '@/lib/services/settings';
import { hasPermission } from '@/lib/permissions';

// Helper to get user from request (placeholder - should be replaced with actual auth)
async function getCurrentUser(request: NextRequest) {
  // TODO: Implement actual authentication
  return null;
}

// GET /api/settings/engine-types - Get all engine types
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    // Check permission
    // if (!hasPermission(user, 'view_settings')) {
    //   return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    // }

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const engineTypes = await SettingsService.getEngineTypes(includeInactive);

    return NextResponse.json({
      success: true,
      data: engineTypes,
    });
  } catch (error) {
    console.error('Error fetching engine types:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch engine types',
      },
      { status: 500 }
    );
  }
}

// POST /api/settings/engine-types - Create new engine type
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

    const engineType = await SettingsService.createEngineType({
      name: name.trim(),
      isActive: isActive ?? true,
    });

    return NextResponse.json({
      success: true,
      data: engineType,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating engine type:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'An engine type with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create engine type',
      },
      { status: 500 }
    );
  }
}
