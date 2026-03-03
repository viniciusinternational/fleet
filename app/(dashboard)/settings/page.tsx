'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Car, Palette, Cog } from 'lucide-react';
import { MakesTable } from '@/components/settings/makes-table';
import { ModelsTable } from '@/components/settings/models-table';
import { ColorsTable } from '@/components/settings/colors-table';
import { TransmissionsTable } from '@/components/settings/transmissions-table';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('makes');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground mt-1">
                Manage vehicle makes, models, colors, and transmission types
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="makes" className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Makes
                </TabsTrigger>
                <TabsTrigger value="models" className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Models
                </TabsTrigger>
                <TabsTrigger value="colors" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Colors
                </TabsTrigger>
                <TabsTrigger value="transmissions" className="flex items-center gap-2">
                  <Cog className="h-4 w-4" />
                  Transmissions
                </TabsTrigger>
              </TabsList>

              {/* Makes Tab */}
              <TabsContent value="makes" className="space-y-4">
                <MakesTable />
              </TabsContent>

              {/* Models Tab */}
              <TabsContent value="models" className="space-y-4">
                <ModelsTable />
              </TabsContent>

              {/* Colors Tab */}
              <TabsContent value="colors" className="space-y-4">
                <ColorsTable />
              </TabsContent>

              {/* Transmissions Tab */}
              <TabsContent value="transmissions" className="space-y-4">
                <TransmissionsTable />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

