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

// PUT /api/settings/models/[id] - Update model
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
    const beforeState = actorId ? await AuditService.getBeforeState('VehicleModel', id) : null;
    
    const body = await request.json();
    const { name, makeId, isActive } = body;

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
    if (makeId !== undefined) {
      updateData.makeId = makeId;
    }
    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    const model = await SettingsService.updateModel(id, updateData);

    // Log audit event
    if (actorId) {
      await AuditService.logEvent({
        action: 'UPDATE',
        actorId,
        entityType: 'VehicleModel',
        entityId: model.id,
        before: beforeState,
        after: JSON.parse(JSON.stringify(model)),
      });
    }

    return NextResponse.json({
      success: true,
      data: model,
    });
  } catch (error: any) {
    console.error('Error updating model:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Model not found' },
        { status: 404 }
      );
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'A model with this name already exists for this make' },
        { status: 409 }
      );
    }

    if (error.code === 'P2003') {
      return NextResponse.json(
        { success: false, error: 'Invalid make ID' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update model',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/settings/models/[id] - Delete model
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
    const beforeState = actorId ? await AuditService.getBeforeState('VehicleModel', id) : null;
    
    await SettingsService.deleteModel(id);

    // Log audit event
    if (actorId) {
      await AuditService.logEvent({
        action: 'DELETE',
        actorId,
        entityType: 'VehicleModel',
        entityId: id,
        before: beforeState,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Model deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting model:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Model not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete model',
      },
      { status: 500 }
    );
  }
}

