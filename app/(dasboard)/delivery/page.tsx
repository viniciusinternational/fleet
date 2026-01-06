'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Plus, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRouter } from 'next/navigation';

interface DeliveryNote {
  id: string;
  ownerId: string;
  deliveryDate: string;
  notes?: string;
  vehicleIds: string[];
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    nationality: string;
    idNumber: string;
  };
}

export default function DeliveryNotesListPage() {
  const router = useRouter();
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch delivery notes
  useEffect(() => {
    async function fetchDeliveryNotes() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/delivery-notes');
        const result = await response.json();

        if (result.success) {
          setDeliveryNotes(result.data);
        } else {
          setError(result.error || 'Failed to fetch delivery notes');
        }
      } catch (error) {
        console.error('Error fetching delivery notes:', error);
        setError('Failed to fetch delivery notes');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDeliveryNotes();
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading delivery notes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            Delivery Notes
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage all delivery notes
          </p>
        </div>
        <Button onClick={() => router.push('/delivery/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Delivery Note
        </Button>
      </div>

      <Separator />

      {/* Delivery Notes List */}
      {deliveryNotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No delivery notes found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by creating your first delivery note.
            </p>
            <Button onClick={() => router.push('/delivery/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Delivery Note
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Delivery Notes</CardTitle>
            <CardDescription>
              {deliveryNotes.length} delivery note{deliveryNotes.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Owner</TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead>Vehicles</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveryNotes.map((note) => (
                    <TableRow 
                      key={note.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/delivery/${note.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{note.owner.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {note.owner.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(note.deliveryDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {note.vehicleIds.length} vehicle{note.vehicleIds.length !== 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(note.createdAt)}
                      </TableCell>
                      <TableCell>
                        {note.notes ? (
                          <div className="max-w-[200px] truncate text-sm">
                            {note.notes}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No notes</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}