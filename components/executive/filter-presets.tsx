'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Save, Trash2, Clock } from 'lucide-react';

interface FilterState {
  locations: Set<string>;
  sources: Set<string>;
  owners: Set<string>;
  makes: Set<string>;
}

interface FilterPreset {
  id: string;
  name: string;
  filters: {
    locations: string[];
    sources: string[];
    owners: string[];
    makes: string[];
  };
  createdAt: string;
}

interface FilterPresetsProps {
  presets: FilterPreset[];
  currentFilters: FilterState;
  onSavePreset: (name: string, filters: FilterState) => void;
  onLoadPreset: (preset: FilterPreset) => void;
  onDeletePreset: (id: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FilterPresets: React.FC<FilterPresetsProps> = ({
  presets,
  currentFilters,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
  open,
  onOpenChange,
}) => {
  const [presetName, setPresetName] = useState('');

  const handleSave = () => {
    if (!presetName.trim()) return;
    onSavePreset(presetName.trim(), currentFilters);
    setPresetName('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const countActiveFilters = (preset: FilterPreset) => {
    return (
      preset.filters.locations.length +
      preset.filters.sources.length +
      preset.filters.owners.length +
      preset.filters.makes.length
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter Presets</DialogTitle>
          <DialogDescription>
            Save and load common filter combinations for quick access
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Save New Preset */}
          <div className="space-y-2">
            <Label htmlFor="preset-name">Save Current Filters</Label>
            <div className="flex gap-2">
              <Input
                id="preset-name"
                placeholder="Enter preset name..."
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSave();
                  }
                }}
              />
              <Button onClick={handleSave} disabled={!presetName.trim()}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>

          {/* Saved Presets List */}
          <div className="space-y-2">
            <Label>Saved Presets ({presets.length})</Label>
            {presets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm border rounded-lg">
                No presets saved yet. Save your current filters above.
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{preset.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {countActiveFilters(preset)} filter{countActiveFilters(preset) !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(preset.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onLoadPreset(preset)}
                      >
                        Load
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeletePreset(preset.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
