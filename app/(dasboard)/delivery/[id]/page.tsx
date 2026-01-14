'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, User, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { generateDeliveryNotePDF } from '@/lib/services/pdf-generator';
import { useRouter } from 'next/navigation';
import type { DeliveryNote } from '@/types';

interface DeliveryNoteViewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function DeliveryNoteViewPage({ params }: DeliveryNoteViewPageProps) {
  const router = useRouter();
  const [deliveryNote, setDeliveryNote] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDeliveryNote() {
      try {
        setIsLoading(true);
        const { id } = await params;
        const response = await fetch(`/api/delivery-notes/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch delivery note');
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch delivery note');
        }
        
        setDeliveryNote(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch delivery note');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDeliveryNote();
  }, [params]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading delivery note...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !deliveryNote) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-destructive">{error || 'Delivery note not found'}</p>
        </div>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Generate PDF handler
  const handleGeneratePDF = () => {
    const pdfData: DeliveryNote = {
      id: deliveryNote.id,
      vehicles: deliveryNote.vehicles,
      owner: deliveryNote.owner,
      deliveryDate: new Date(deliveryNote.deliveryDate),
      generatedAt: new Date(),
      notes: deliveryNote.notes || undefined,
    };

    generateDeliveryNotePDF(pdfData);
  };

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push(`/admin/delivery/${deliveryNote.id}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this delivery note? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/delivery-notes/${deliveryNote.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // Navigate back to list page
        router.push('/admin/delivery');
      } else {
        alert(`Failed to delete delivery note: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting delivery note:', error);
      alert('Failed to delete delivery note. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              Delivery Note #{deliveryNote.id.slice(-8)}
            </h1>
            <p className="text-muted-foreground mt-2">
              Created on {formatDate(deliveryNote.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button onClick={handleGeneratePDF}>
            <Download className="h-4 w-4 mr-2" />
            Generate PDF
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Separator />

      {/* Main Content */}
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
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-sm">{deliveryNote.owner.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm">{deliveryNote.owner.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="text-sm">{deliveryNote.owner.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Country</label>
                <p className="text-sm">{deliveryNote.owner.country}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Address</label>
              <p className="text-sm">{deliveryNote.owner.address}</p>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Delivery Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Delivery Date</label>
              <p className="text-sm">{formatDate(deliveryNote.deliveryDate)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <p className="text-sm">{formatDate(deliveryNote.createdAt)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
              <p className="text-sm">{formatDate(deliveryNote.updatedAt)}</p>
            </div>
            {deliveryNote.notes && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Notes</label>
                <p className="text-sm whitespace-pre-wrap">{deliveryNote.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vehicles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Details</CardTitle>
          <CardDescription>
            {deliveryNote.vehicles.length} vehicle{deliveryNote.vehicles.length !== 1 ? 's' : ''} included in this delivery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>VIN</TableHead>
                  <TableHead>Make</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveryNote.vehicles.map((vehicle, index) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-mono text-xs">{vehicle.vin}</TableCell>
                    <TableCell>{vehicle.make}</TableCell>
                    <TableCell>{vehicle.model}</TableCell>
                    <TableCell>{vehicle.year}</TableCell>
                    <TableCell>{vehicle.color}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          vehicle.status === 'Delivered'
                            ? 'default'
                            : vehicle.status === 'In Transit'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {vehicle.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
