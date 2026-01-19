'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FileText, Calendar, User, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DeliveryNoteViewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PublicDeliveryNoteViewPage({ params }: DeliveryNoteViewPageProps) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading delivery note...</p>
        </div>
      </div>
    );
  }

  if (error || !deliveryNote) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-lg">{error || 'Delivery note not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block print:mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-32 h-12 relative">
              <Image
                src="/logo/vinicius-logo.png"
                alt="Vinicius International"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Vinicius International</h1>
              <p className="text-sm text-gray-600">13B Shettima Mongonu Crescent, Utako, Abuja, Nigeria</p>
              <p className="text-sm text-gray-600">info@viniciusint.com</p>
            </div>
          </div>
        </div>
        <div className="border-b-2 border-red-600 mb-6"></div>
      </div>

      <div className="container mx-auto p-6 max-w-6xl">
        {/* Action Bar - Hidden when printing */}
        <div className="mb-6 flex items-center justify-between print:hidden">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            Delivery Note #{deliveryNote.id.slice(-8)}
          </h1>
          <Button onClick={handlePrint} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Print / Save PDF
          </Button>
        </div>

        {/* Document Title */}
        <div className="text-center mb-8 print:mb-6">
          <h2 className="text-3xl font-bold text-red-600 mb-2 print:text-2xl">
            VEHICLE DELIVERY NOTE
          </h2>
          <div className="w-32 h-0.5 bg-red-600 mx-auto"></div>
        </div>

        {/* Delivery Information */}
        <div className="mb-6 print:mb-4">
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="font-semibold text-gray-900">Delivery Date: </span>
              <span className="text-gray-700">{formatDate(deliveryNote.deliveryDate)}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">Generated: </span>
              <span className="text-gray-700">{formatDate(deliveryNote.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Owner Information */}
          <Card className="print:border print:shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Owner Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-semibold text-gray-700">Name: </span>
                  <span className="text-sm text-gray-900">{deliveryNote.owner.name}</span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-700">Email: </span>
                  <span className="text-sm text-gray-900">{deliveryNote.owner.email}</span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-700">Phone: </span>
                  <span className="text-sm text-gray-900">{deliveryNote.owner.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-700">Address: </span>
                  <span className="text-sm text-gray-900">{deliveryNote.owner.address || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-700">Country: </span>
                  <span className="text-sm text-gray-900">{deliveryNote.owner.country || 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card className="print:border print:shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-semibold text-gray-700">Delivery Date: </span>
                  <span className="text-sm text-gray-900">{formatDate(deliveryNote.deliveryDate)}</span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-700">Created: </span>
                  <span className="text-sm text-gray-900">{formatDate(deliveryNote.createdAt)}</span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-700">Last Updated: </span>
                  <span className="text-sm text-gray-900">{formatDate(deliveryNote.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vehicles Table */}
        <Card className="mb-6 print:border print:shadow-none">
          <CardHeader>
            <CardTitle>Vehicle Details</CardTitle>
            <CardDescription>
              {deliveryNote.vehicles.length} vehicle{deliveryNote.vehicles.length !== 1 ? 's' : ''} included in this delivery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-600 hover:bg-slate-600">
                    <TableHead className="text-white font-bold text-center w-12">#</TableHead>
                    <TableHead className="text-white font-bold">VIN</TableHead>
                    <TableHead className="text-white font-bold">Make</TableHead>
                    <TableHead className="text-white font-bold">Model</TableHead>
                    <TableHead className="text-white font-bold text-center">Year</TableHead>
                    <TableHead className="text-white font-bold">Color</TableHead>
                    <TableHead className="text-white font-bold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveryNote.vehicles.map((vehicle: any, index: number) => (
                    <TableRow 
                      key={vehicle.id}
                      className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    >
                      <TableCell className="font-medium text-center">{index + 1}</TableCell>
                      <TableCell className="font-mono text-xs">{vehicle.vin}</TableCell>
                      <TableCell>{vehicle.make}</TableCell>
                      <TableCell>{vehicle.model}</TableCell>
                      <TableCell className="text-center">{vehicle.year}</TableCell>
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

        {/* Notes */}
        {deliveryNote.notes && (
          <Card className="mb-6 print:border print:shadow-none">
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap text-gray-700">{deliveryNote.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Signature Section */}
        <div className="mt-12 print:mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="border-b-2 border-gray-400 mb-2 pb-1"></div>
            <p className="text-sm font-semibold text-gray-700">Authorized Signature</p>
            <p className="text-sm text-gray-600 mt-1">Date: ______________</p>
          </div>
          <div>
            <div className="border-b-2 border-gray-400 mb-2 pb-1"></div>
            <p className="text-sm font-semibold text-gray-700">Received By (Owner)</p>
            <p className="text-sm text-gray-600 mt-1">Date: ______________</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:mb-4 {
            margin-bottom: 1rem !important;
          }
          .print\\:mb-6 {
            margin-bottom: 1.5rem !important;
          }
          .print\\:mb-8 {
            margin-bottom: 2rem !important;
          }
          .print\\:mt-8 {
            margin-top: 2rem !important;
          }
          .print\\:border {
            border: 1px solid #e5e7eb !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:text-2xl {
            font-size: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}