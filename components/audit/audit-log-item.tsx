'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, User, Calendar, FileText, Eye, LogIn, UserPlus, Shield, TrendingUp } from 'lucide-react';

interface AuditLogItemProps {
  log: {
    id: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'USER_CREATED' | 'PERMISSION_CHANGE' | 'STATUS_CHANGE';
    entityType: string;
    entityId: string;
    before: any;
    after: any;
    timestamp: Date | string;
    metadata?: any;
    actor: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export function AuditLogItem({ log }: AuditLogItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-700';
      case 'UPDATE':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'DELETE':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-700';
      case 'LOGIN':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700';
      case 'USER_CREATED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700';
      case 'PERMISSION_CHANGE':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-700';
      case 'STATUS_CHANGE':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return <LogIn className="h-3 w-3" />;
      case 'USER_CREATED':
        return <UserPlus className="h-3 w-3" />;
      case 'PERMISSION_CHANGE':
        return <Shield className="h-3 w-3" />;
      case 'STATUS_CHANGE':
        return <TrendingUp className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return 'User Login';
      case 'USER_CREATED':
        return 'User Created';
      case 'PERMISSION_CHANGE':
        return 'Permission Change';
      case 'STATUS_CHANGE':
        return 'Status Change';
      default:
        return action;
    }
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return formatFullDate(date);
  };

  const formatFullDate = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const getEntityLink = (entityType: string, entityId: string) => {
    const basePath = '/dashboard';
    switch (entityType) {
      case 'User':
        return `${basePath}/users/${entityId}`;
      case 'Vehicle':
        return `${basePath}/vehicles/${entityId}`;
      case 'Owner':
        return `${basePath}/owners/${entityId}`;
      case 'Location':
        return `${basePath}/locations/${entityId}`;
      case 'Source':
        return `${basePath}/sources/${entityId}`;
      case 'DeliveryNote':
        return `${basePath}/delivery/${entityId}`;
      default:
        return null;
    }
  };

  const entityLink = getEntityLink(log.entityType, log.entityId);

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getActionColor(log.action)}>
                <div className="flex items-center gap-1">
                  {getActionIcon(log.action)}
                  <span>{getActionLabel(log.action)}</span>
                </div>
              </Badge>
              <span className="text-sm font-medium text-muted-foreground">
                {log.entityType}
              </span>
              {entityLink && (
                <a
                  href={entityLink}
                  className="text-sm text-primary hover:underline"
                >
                  {log.entityId.slice(-8)}
                </a>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>
                  {log.actor.firstName} {log.actor.lastName}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatTimestamp(log.timestamp)}</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium mb-2">Timestamp</div>
              <div className="text-sm text-muted-foreground">
                {formatFullDate(log.timestamp)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Actor</div>
              <div className="text-sm text-muted-foreground">
                {log.actor.firstName} {log.actor.lastName} ({log.actor.email})
              </div>
            </div>
          </div>

          {(log.before || log.after) && (
            <div className="space-y-2">
              <div className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Changes
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {log.before && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Before
                    </div>
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-48">
                      {JSON.stringify(log.before, null, 2)}
                    </pre>
                  </div>
                )}
                {log.after && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      After
                    </div>
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-48">
                      {JSON.stringify(log.after, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {log.metadata && (
            <div>
              <div className="text-sm font-medium mb-2">Metadata</div>
              {log.action === 'LOGIN' && log.metadata.ipAddress && (
                <div className="mb-2 text-sm">
                  <span className="font-medium">IP Address: </span>
                  <span className="text-muted-foreground">{log.metadata.ipAddress}</span>
                </div>
              )}
              {log.action === 'STATUS_CHANGE' && log.metadata.statusChange && (
                <div className="mb-2 text-sm">
                  <span className="font-medium">Status: </span>
                  <span className="text-muted-foreground">
                    {log.metadata.statusChange.from} → {log.metadata.statusChange.to}
                  </span>
                </div>
              )}
              <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
