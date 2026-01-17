import { NextRequest, NextResponse } from 'next/server';
import { SettingsService } from '@/lib/services/settings';
import { hasPermission } from '@/lib/permissions';

// Helper to get user from request (placeholder - should be replaced with actual auth)
async function getCurrentUser(request: NextRequest) {
  // TODO: Implement actual authentication
  return null;
}

// PUT /api/settings/colors/[id] - Update color
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    // Check permission
    // if (!hasPermission(user, 'edit_settings')) {
    //   return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    // }

    const { id } = await params;
    const body = await request.json();
    const { name, hexCode, isActive } = body;

    const updateData: any = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Name must be a non-empty string' },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }
    if (hexCode !== undefined) {
      updateData.hexCode = hexCode || null;
    }
    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    const color = await SettingsService.updateColor(id, updateData);

    return NextResponse.json({
      success: true,
      data: color,
    });
  } catch (error: any) {
    console.error('Error updating color:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Color not found' },
        { status: 404 }
      );
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'A color with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update color',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/settings/colors/[id] - Delete color
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    // Check permission
    // if (!hasPermission(user, 'delete_settings')) {
    //   return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    // }

    const { id } = await params;
    await SettingsService.deleteColor(id);

    return NextResponse.json({
      success: true,
      message: 'Color deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting color:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Color not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete color',
      },
      { status: 500 }
    );
  }
}

