'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  FileText,
  Car,
  Edit,
  Trash2
} from 'lucide-react';
import type { Owner } from '@/types';
import { DeleteOwnerDialog } from '@/components/owners/delete-owner-dialog';

interface OwnerDetailsPageProps {
  params: {
    id: string;
  };
}

const OwnerDetailsPage: React.FC<OwnerDetailsPageProps> = ({ params }) => {
  const router = useRouter();
  const [owner, setOwner] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const response = await fetch(`/api/owners/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch owner');
        }
        const result = await response.json();
        if (result.success) {
          setOwner(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch owner');
        }
      } catch (error) {
        console.error('Error fetching owner:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOwner();
  }, [params.id]);

  const handleDelete = async (ownerId: string) => {
    try {
      const response = await fetch(`/api/owners/${ownerId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete owner');
      }
      
      const result = await response.json();
      if (result.success) {
        router.push('/admin/owners');
      } else {
        throw new Error(result.error || 'Failed to delete owner');
      }
    } catch (error) {
      console.error('Error deleting owner:', error);
    }
  };

  const handleEdit = () => {
    router.push(`/admin/owners/edit/${params.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-lg text-muted-foreground">Loading owner details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <Card>
            <CardHeader>
              <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold text-destructive">Owner Not Found</h1>
                <p className="text-muted-foreground">This owner does not exist or has been deleted.</p>
                <Button onClick={() => router.push('/admin/owners')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Owners
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/owners')}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">{owner.name}</h1>
              <p className="text-muted-foreground mt-2 text-lg">Owner Details & Information</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">
                    {owner.email}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {owner.phone}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline" className="text-xs">
                    {owner.nationality}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleEdit} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Owner
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setDeleteDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Owner Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Owner Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-sm">{owner.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID Number</label>
                  <p className="text-sm">{owner.idNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{owner.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="text-sm">{owner.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                  <Badge variant="outline" className="text-xs">
                    {owner.nationality}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Address</label>
                <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm">{owner.address}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Associated Vehicles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Associated Vehicles
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(owner as any).vehicles && (owner as any).vehicles.length > 0 ? (
                <div className="space-y-3">
                  {(owner as any).vehicles.map((vehicle: any) => (
                    <div key={vehicle.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Car className="h-5 w-5 text-blue-600 dark:text-blue-300" />
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
                  <p>No vehicles associated with this owner.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DeleteOwnerDialog
          owner={owner}
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDelete}
        />
      </div>
    </div>
  );
};

export default OwnerDetailsPage;
