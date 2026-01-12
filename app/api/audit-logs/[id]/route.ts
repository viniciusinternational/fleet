import { NextRequest, NextResponse } from 'next/server';
import { AuditService } from '@/lib/services/audit';
import { hasPermission } from '@/lib/permissions';

// GET /api/audit-logs/[id] - Get single audit log entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Get user from authentication/session
    // For now, we'll allow access - in production, check for view_audit_logs permission
    // const user = await getCurrentUser(request);
    // if (!hasPermission(user, 'view_audit_logs')) {
    //   return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    // }

    const { id } = await params;
    const log = await AuditService.getAuditLogById(id);

    if (!log) {
      return NextResponse.json(
        {
          success: false,
          error: 'Audit log not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: log,
    });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch audit log',
      },
      { status: 500 }
    );
  }
}
