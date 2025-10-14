'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

const AddVehicle: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/normal/vehicles')}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Add Vehicle</h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Request a new vehicle to be added to the system
              </p>
            </div>
          </div>
        </div>

        {/* Access Restricted Message */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Access Restricted
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Vehicle addition is restricted to administrators only. Please contact your system administrator to add new vehicles to the system.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <h3 className="font-semibold">What you can do:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>View and track existing vehicles</li>
                <li>Add tracking events to vehicles</li>
                <li>View vehicle details and documents</li>
                <li>Monitor vehicle status and location</li>
              </ul>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={() => router.push('/normal/vehicles')}
                className="flex-1"
              >
                Back to Vehicles
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/normal/dashboard')}
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddVehicle;
