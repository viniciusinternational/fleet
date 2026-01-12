import { NextRequest, NextResponse } from 'next/server';
import { AuditService, type EntityType } from '@/lib/services/audit';
import { hasPermission } from '@/lib/permissions';

// GET /api/audit-logs/entity/[entityType]/[entityId] - Get audit logs for specific entity
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entityType: string; entityId: string }> }
) {
  try {
    // TODO: Get user from authentication/session
    // For now, we'll allow access - in production, check for view_audit_logs permission
    // const user = await getCurrentUser(request);
    // if (!hasPermission(user, 'view_audit_logs')) {
    //   return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    // }

    const { entityType, entityId } = await params;
    const { searchParams } = new URL(request.url);

    const paginationOptions = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
    };

    const result = await AuditService.getAuditLogsByEntity(
      entityType as EntityType,
      entityId,
      paginationOptions
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching entity audit logs:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch entity audit logs',
      },
      { status: 500 }
    );
  }
}
