'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

const OwnerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [owner, setOwner] = useState<Owner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch owner data from API
  useEffect(() => {
    const fetchOwner = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/owners/${id}`, {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Owner not found');
          }
          throw new Error('Failed to fetch owner');
        }
        
        const ownerData = await response.json();
        setOwner(ownerData);
      } catch (error) {
        console.error('Error fetching owner:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch owner');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOwner();
  }, [id]);

  const handleDelete = async (ownerId: string) => {
    if (!owner) return;
    
    try {
      const response = await fetch(`/api/owners/${ownerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete owner');
      }

      console.log('Owner deleted:', ownerId);
      router.push('/admin/owners');
    } catch (error) {
      console.error('Failed to delete owner:', error);
      // TODO: Show error toast/notification
    }
  };

  const handleEdit = () => {
    router.push(`/admin/owners/edit/${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-4">Loading Owner...</h2>
          <p className="text-muted-foreground">Please wait while we fetch owner details.</p>
        </div>
      </div>
    );
  }

  if (error || !owner) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Owner Not Found</h2>
          <p className="text-muted-foreground mb-6">
            {error || "The owner you're looking for doesn't exist."}
          </p>
          <Button onClick={() => router.push('/admin/owners')}>
            Back to Owners
          </Button>
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
                  <Mail className="h-4 w-4 text-primary" />
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
                    {owner.country}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                onClick={handleEdit}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Owner
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setDeleteDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Owner
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
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{owner.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="text-sm">{owner.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Country</label>
                  <Badge variant="outline" className="text-xs">
                    {owner.country}
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
