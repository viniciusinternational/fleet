'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Edit, Trash2, Package, Mail, Phone, MapPin, Globe, AlertCircle, Car, History } from 'lucide-react';
import type { Source } from '@/types';
import { EntityAuditLogs } from '@/components/audit/entity-audit-logs';
import { useAuthStore } from '@/store/auth';
import { hasPermission } from '@/lib/permissions';

const SourceDetailsPage: React.FC = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [source, setSource] = useState<Source | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchSource = async () => {
      try {
        const response = await fetch(`/api/sources/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch source');
        }
        const result = await response.json();
        if (result.success) {
          setSource(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch source');
        }
      } catch (error) {
        console.error('Error fetching source:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSource();
  }, [id]);

  const handleDelete = async (sourceId: string) => {
    try {
      const response = await fetch(`/api/sources/${sourceId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete source');
      }
      
      const result = await response.json();
      if (result.success) {
        router.push('/sources');
      } else {
        throw new Error(result.error || 'Failed to delete source');
      }
    } catch (error) {
      console.error('Error deleting source:', error);
      alert('Failed to delete source. Please try again.');
    }
  };

  const handleEdit = () => {
    if (id) {
      router.push(`/sources/edit/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-lg text-muted-foreground">Loading source details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!source) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                <h2 className="text-2xl font-bold">Source Not Found</h2>
                <p className="text-muted-foreground">This source does not exist or has been deleted.</p>
                <Button onClick={() => router.push('/sources')}>
                  Back to Sources
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/sources')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sources
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{source.name}</h1>
              <p className="text-muted-foreground mt-2">Source Details</p>
            </div>
            <div className="flex gap-2">
              {user && hasPermission(user, 'edit_sources') && (
                <Button variant="outline" onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
              {user && hasPermission(user, 'delete_sources') && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this source?')) {
                      handleDelete(source.id);
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Source Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-lg">{source.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-lg">{source.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="text-lg">{source.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Country</p>
                    <p className="text-lg">{source.country}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 md:col-span-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p className="text-lg">{source.address}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Associated Vehicles
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(source as any).vehicles && (source as any).vehicles.length > 0 ? (
                <div className="space-y-3">
                  {(source as any).vehicles.map((vehicle: any) => (
                    <div key={vehicle.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Car className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{vehicle.make} {vehicle.model}</div>
                        <div className="text-xs text-muted-foreground">VIN: {vehicle.vin}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {vehicle.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No vehicles associated with this source.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Activity History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EntityAuditLogs entityType="Source" entityId={source.id} limit={20} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SourceDetailsPage;

