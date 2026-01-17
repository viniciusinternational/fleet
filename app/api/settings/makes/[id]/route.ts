import { NextRequest, NextResponse } from 'next/server';
import { SettingsService } from '@/lib/services/settings';
import { hasPermission } from '@/lib/permissions';

// Helper to get user from request (placeholder - should be replaced with actual auth)
async function getCurrentUser(request: NextRequest) {
  // TODO: Implement actual authentication
  return null;
}

// PUT /api/settings/makes/[id] - Update make
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
    const { name, isActive } = body;

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
    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    const make = await SettingsService.updateMake(id, updateData);

    return NextResponse.json({
      success: true,
      data: make,
    });
  } catch (error: any) {
    console.error('Error updating make:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Make not found' },
        { status: 404 }
      );
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'A make with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update make',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/settings/makes/[id] - Delete make
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
    await SettingsService.deleteMake(id);

    return NextResponse.json({
      success: true,
      message: 'Make deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting make:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Make not found' },
        { status: 404 }
      );
    }

    // Handle foreign key constraint (if make has models)
    if (error.code === 'P2003') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete make that has associated models. Please delete or reassign models first.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete make',
      },
      { status: 500 }
    );
  }
}

