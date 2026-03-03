import { NextRequest, NextResponse } from 'next/server';
import { SettingsService } from '@/lib/services/settings';
import { AuditService } from '@/lib/services/audit';
import { getActorId } from '@/lib/utils/get-actor-id';
import { hasPermission } from '@/lib/permissions';

// Helper to get user from request (placeholder - should be replaced with actual auth)
async function getCurrentUser(request: NextRequest) {
  // TODO: Implement actual authentication
  return null;
}

// PUT /api/settings/engine-types/[id] - Update engine type
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
    
    // Extract actorId for audit logging
    const actorId = await getActorId(request) || undefined;
    
    // Get before state for audit log
    const beforeState = actorId ? await AuditService.getBeforeState('EngineType', id) : null;
    
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

    const engineType = await SettingsService.updateEngineType(id, updateData);

    // Log audit event
    if (actorId) {
      await AuditService.logEvent({
        action: 'UPDATE',
        actorId,
        entityType: 'EngineType',
        entityId: engineType.id,
        before: beforeState,
        after: JSON.parse(JSON.stringify(engineType)),
      });
    }

    return NextResponse.json({
      success: true,
      data: engineType,
    });
  } catch (error: any) {
    console.error('Error updating engine type:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Engine type not found' },
        { status: 404 }
      );
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'An engine type with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update engine type',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/settings/engine-types/[id] - Delete engine type
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
    
    // Extract actorId for audit logging
    const actorId = await getActorId(request) || undefined;
    
    // Get before state for audit log
    const beforeState = actorId ? await AuditService.getBeforeState('EngineType', id) : null;
    
    await SettingsService.deleteEngineType(id);

    // Log audit event
    if (actorId) {
      await AuditService.logEvent({
        action: 'DELETE',
        actorId,
        entityType: 'EngineType',
        entityId: id,
        before: beforeState,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Engine type deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting engine type:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Engine type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete engine type',
      },
      { status: 500 }
    );
  }
}
