'use client';

import React, { useState, useEffect } from 'react';
import { AuditLogItem } from './audit-log-item';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EntityAuditLogsProps {
  entityType: string;
  entityId: string;
  limit?: number;
}

export function EntityAuditLogs({ entityType, entityId, limit = 10 }: EntityAuditLogsProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/audit-logs/entity/${entityType}/${entityId}?limit=${limit}`
      );
      const result = await response.json();

      if (result.success) {
        setLogs(result.data.logs);
      } else {
        setError(result.error || 'Failed to fetch audit logs');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (entityType && entityId) {
      fetchLogs();
    }
  }, [entityType, entityId, limit]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Audit History</CardTitle>
          <Button variant="outline" size="sm" onClick={fetchLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-4 text-destructive text-sm">{error}</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No audit history available
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <AuditLogItem key={log.id} log={log} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
