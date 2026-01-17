import { NextRequest, NextResponse } from 'next/server';
import { SettingsService } from '@/lib/services/settings';
import { hasPermission } from '@/lib/permissions';

// Helper to get user from request (placeholder - should be replaced with actual auth)
async function getCurrentUser(request: NextRequest) {
  // TODO: Implement actual authentication
  return null;
}

// GET /api/settings/models - Get all models
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    // Check permission
    // if (!hasPermission(user, 'view_settings')) {
    //   return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    // }

    const { searchParams } = new URL(request.url);
    const makeId = searchParams.get('makeId') || undefined;
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const models = await SettingsService.getModels(makeId, includeInactive);

    return NextResponse.json({
      success: true,
      data: models,
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch models',
      },
      { status: 500 }
    );
  }
}

// POST /api/settings/models - Create new model
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    // Check permission
    // if (!hasPermission(user, 'add_settings')) {
    //   return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    // }

    const body = await request.json();
    const { name, makeId, isActive } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!makeId || typeof makeId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Make ID is required' },
        { status: 400 }
      );
    }

    const model = await SettingsService.createModel({
      name: name.trim(),
      makeId,
      isActive: isActive ?? true,
    });

    return NextResponse.json({
      success: true,
      data: model,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating model:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'A model with this name already exists for this make' },
        { status: 409 }
      );
    }

    // Handle foreign key constraint (invalid makeId)
    if (error.code === 'P2003') {
      return NextResponse.json(
        { success: false, error: 'Invalid make ID' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create model',
      },
      { status: 500 }
    );
  }
}

