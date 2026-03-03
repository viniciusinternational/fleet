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

// GET /api/settings/transmissions - Get all transmission types
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    // Check permission
    // if (!hasPermission(user, 'view_settings')) {
    //   return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    // }

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const transmissions = await SettingsService.getTransmissionTypes(includeInactive);

    return NextResponse.json({
      success: true,
      data: transmissions,
    });
  } catch (error) {
    console.error('Error fetching transmission types:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch transmission types',
      },
      { status: 500 }
    );
  }
}

// POST /api/settings/transmissions - Create new transmission type
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    // Check permission
    // if (!hasPermission(user, 'add_settings')) {
    //   return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    // }

    // Extract actorId for audit logging
    const actorId = await getActorId(request) || undefined;

    const body = await request.json();
    const { name, enumValue, isActive } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!enumValue || typeof enumValue !== 'string' || enumValue.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Enum value is required' },
        { status: 400 }
      );
    }

    const transmission = await SettingsService.createTransmissionType({
      name: name.trim(),
      enumValue: enumValue.trim().toUpperCase(),
      isActive: isActive ?? true,
    });

    // Log audit event
    if (actorId) {
      await AuditService.logEvent({
        action: 'CREATE',
        actorId,
        entityType: 'TransmissionType',
        entityId: transmission.id,
        after: JSON.parse(JSON.stringify(transmission)),
      });
    }

    return NextResponse.json({
      success: true,
      data: transmission,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating transmission type:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'A transmission type with this name or enum value already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create transmission type',
      },
      { status: 500 }
    );
  }
}

