'use client';

import React from 'react';
import { AuditLogTable } from '@/components/audit/audit-log-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { hasPermission } from '@/lib/permissions';
import { useAuthStore } from '@/store/auth';

export default function AuditLogsPage() {
  const { user } = useAuthStore();

  // Check permission
  if (user && !hasPermission(user, 'view_audit_logs')) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
              <p className="text-muted-foreground">
                You don't have permission to view audit logs.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Audit Logs</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              View and track all changes made to entities in the system
            </p>
          </div>
        </div>

        <AuditLogTable showFilters={true} />
      </div>
    </div>
  );
}
