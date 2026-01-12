import { NextRequest, NextResponse } from 'next/server';
import { AuditService, type AuditAction, type EntityType } from '@/lib/services/audit';
import { hasPermission } from '@/lib/permissions';

// GET /api/audit-logs - Get all audit logs with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user from authentication/session
    // For now, we'll allow access - in production, check for view_audit_logs permission
    // const user = await getCurrentUser(request);
    // if (!hasPermission(user, 'view_audit_logs')) {
    //   return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    // }

    const { searchParams } = new URL(request.url);

    const filters = {
      entityType: searchParams.get('entityType') as EntityType | undefined,
      entityId: searchParams.get('entityId') || undefined,
      actorId: searchParams.get('actorId') || undefined,
      action: searchParams.get('action') as AuditAction | undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      search: searchParams.get('search') || undefined,
    };

    const sortOptions = {
      sortBy: (searchParams.get('sortBy') as 'timestamp' | 'entityType' | 'action' | 'actorId') || 'timestamp',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    const paginationOptions = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
    };

    const result = await AuditService.getAuditLogs(filters, sortOptions, paginationOptions);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch audit logs',
      },
      { status: 500 }
    );
  }
}
