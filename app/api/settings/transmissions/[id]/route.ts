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

// PUT /api/settings/transmissions/[id] - Update transmission type
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
    const beforeState = actorId ? await AuditService.getBeforeState('TransmissionType', id) : null;
    
    const body = await request.json();
    const { name, enumValue, isActive } = body;

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
    if (enumValue !== undefined) {
      if (typeof enumValue !== 'string' || enumValue.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Enum value must be a non-empty string' },
          { status: 400 }
        );
      }
      updateData.enumValue = enumValue.trim().toUpperCase();
    }
    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    const transmission = await SettingsService.updateTransmissionType(id, updateData);

    // Log audit event
    if (actorId) {
      await AuditService.logEvent({
        action: 'UPDATE',
        actorId,
        entityType: 'TransmissionType',
        entityId: transmission.id,
        before: beforeState,
        after: JSON.parse(JSON.stringify(transmission)),
      });
    }

    return NextResponse.json({
      success: true,
      data: transmission,
    });
  } catch (error: any) {
    console.error('Error updating transmission type:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Transmission type not found' },
        { status: 404 }
      );
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'A transmission type with this name or enum value already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update transmission type',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/settings/transmissions/[id] - Delete transmission type
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
    const beforeState = actorId ? await AuditService.getBeforeState('TransmissionType', id) : null;
    
    await SettingsService.deleteTransmissionType(id);

    // Log audit event
    if (actorId) {
      await AuditService.logEvent({
        action: 'DELETE',
        actorId,
        entityType: 'TransmissionType',
        entityId: id,
        before: beforeState,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Transmission type deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting transmission type:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Transmission type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete transmission type',
      },
      { status: 500 }
    );
  }
}

