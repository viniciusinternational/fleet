'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ExecutiveFilterCard } from '@/components/executive/executive-filter-card';
import { FilterPresets } from '@/components/executive/filter-presets';
import { StatusDistributionChart } from '@/components/dashboard/charts/status-distribution-chart';
import { 
  Car, 
  MapPin,
  Package,
  Users,
  X,
  Save,
  Download,
  BarChart3,
  HelpCircle,
  MoreVertical,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import type { Vehicle, VehicleStatus } from '@/types';

interface FilterState {
  locations: Set<string>;
  sources: Set<string>;
  owners: Set<string>;
  makes: Set<string>;
}

interface FilterItem {
  id: string;
  label: string;
  count: number;
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

const PRESET_STORAGE_KEY = 'executive-dashboard-presets';

const ExecutiveDashboard: React.FC = () => {
  const router = useRouter();
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    locations: new Set(),
    sources: new Set(),
    owners: new Set(),
    makes: new Set(),
  });

  // All vehicles (for calculating counts)
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);

  // Filter options
  const [filterOptions, setFilterOptions] = useState<{
    locations: FilterItem[];
    sources: FilterItem[];
    owners: FilterItem[];
    makes: FilterItem[];
  }>({
    locations: [],
    sources: [],
    owners: [],
    makes: [],
  });

  // Vehicles state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Presets state
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [presetModalOpen, setPresetModalOpen] = useState(false);

  // Charts state
  const [showCharts, setShowCharts] = useState(true);

  // Collapsed categories state
  const [collapsedCategories, setCollapsedCategories] = useState<{
    locations: boolean;
    sources: boolean;
    owners: boolean;
    makes: boolean;
  }>({
    locations: false,
    sources: false,
    owners: false,
    makes: false,
  });

  // Toggle category collapse
  const toggleCategoryCollapse = (category: keyof typeof collapsedCategories) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Keyboard shortcuts help
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // Ref for preventing keyboard shortcuts when typing
  const typingRef = useRef(false);

  // Load presets from localStorage
  const loadPresets = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(PRESET_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPresets(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('Error loading presets:', error);
    }
  }, []);

  // Save preset to localStorage
  const savePreset = useCallback((name: string, currentFilters: FilterState) => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(PRESET_STORAGE_KEY);
      const existingPresets: FilterPreset[] = stored ? JSON.parse(stored) : [];
      
      const newPreset: FilterPreset = {
        id: crypto.randomUUID(),
        name,
        filters: {
          locations: Array.from(currentFilters.locations),
          sources: Array.from(currentFilters.sources),
          owners: Array.from(currentFilters.owners),
          makes: Array.from(currentFilters.makes),
        },
        createdAt: new Date().toISOString(),
      };

      const updatedPresets = [...existingPresets, newPreset];
      localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(updatedPresets));
      setPresets(updatedPresets);
      setPresetModalOpen(false);
    } catch (error) {
      console.error('Error saving preset:', error);
    }
  }, []);

  // Load preset
  const loadPreset = useCallback((preset: FilterPreset) => {
    setFilters({
      locations: new Set(preset.filters.locations),
      sources: new Set(preset.filters.sources),
      owners: new Set(preset.filters.owners),
      makes: new Set(preset.filters.makes),
    });
    setPresetModalOpen(false);
  }, []);

  // Delete preset
  const deletePreset = useCallback((id: string) => {
    if (typeof window === 'undefined') return;
    try {
      const updatedPresets = presets.filter(p => p.id !== id);
      localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(updatedPresets));
      setPresets(updatedPresets);
    } catch (error) {
      console.error('Error deleting preset:', error);
    }
  }, [presets]);

  // Load presets on mount
  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  // Fetch all filter options and vehicles for counts
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        setFilterOptionsLoading(true);
        const [locationsRes, sourcesRes, ownersRes, makesRes, vehiclesRes] = await Promise.all([
          fetch('/api/locations?limit=1000'),
          fetch('/api/sources?limit=1000'),
          fetch('/api/owners?limit=1000'),
          fetch('/api/settings/makes'),
          fetch('/api/vehicles?limit=10000'),
        ]);

        const [locationsData, sourcesData, ownersData, makesData, vehiclesData] = await Promise.all([
          locationsRes.json(),
          sourcesRes.json(),
          ownersRes.json(),
          makesRes.json(),
          vehiclesRes.json(),
        ]);

        const fetchedVehicles: Vehicle[] = vehiclesData.success ? vehiclesData.data.vehicles : [];
        setAllVehicles(fetchedVehicles);

        // Calculate initial counts for each filter option from all vehicles
        const locations: FilterItem[] = (locationsData.locations || []).map((loc: any) => ({
          id: loc.id,
          label: loc.name,
          count: fetchedVehicles.filter(v => v.currentLocation?.id === loc.id).length,
        }));

        const sources: FilterItem[] = (sourcesData.success ? sourcesData.data.sources : []).map((src: any) => ({
          id: src.id,
          label: src.name,
          count: fetchedVehicles.filter(v => v.source?.id === src.id).length,
        }));

        const owners: FilterItem[] = (ownersData.success ? ownersData.data.owners : []).map((owner: any) => ({
          id: owner.id,
          label: owner.name,
          count: fetchedVehicles.filter(v => v.owner?.id === owner.id).length,
        }));

        const makes: FilterItem[] = (makesData.success ? makesData.data : []).map((make: any) => ({
          id: make.name,
          label: make.name,
          count: fetchedVehicles.filter(v => v.make === make.name).length,
        }));

        setFilterOptions({
          locations,
          sources,
          owners,
          makes,
        });
      } catch (error) {
        console.error('Error fetching filter data:', error);
        setError('Failed to load filter options');
      } finally {
        setFilterOptionsLoading(false);
      }
    };

    fetchFilterData();
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return filters.locations.size > 0 || 
           filters.sources.size > 0 || 
           filters.owners.size > 0 || 
           filters.makes.size > 0;
  }, [filters]);

  // Real-time count updates - recalculate counts based on current filtered vehicles
  const updatedFilterOptions = useMemo(() => {
    // If no filters are active, use all vehicles for counts
    const sourceVehicles = hasActiveFilters ? vehicles : allVehicles;
    
    return {
      locations: filterOptions.locations.map(loc => ({
        ...loc,
        count: sourceVehicles.filter(v => v.currentLocation?.id === loc.id).length,
      })),
      sources: filterOptions.sources.map(src => ({
        ...src,
        count: sourceVehicles.filter(v => v.source?.id === src.id).length,
      })),
      owners: filterOptions.owners.map(owner => ({
        ...owner,
        count: sourceVehicles.filter(v => v.owner?.id === owner.id).length,
      })),
      makes: filterOptions.makes.map(make => ({
        ...make,
        count: sourceVehicles.filter(v => v.make === make.id).length,
      })),
    };
  }, [vehicles, allVehicles, filterOptions, hasActiveFilters]);

  // Fetch filtered vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          limit: '100',
        });

        // Multiple selections per category - append all selected items
        if (filters.locations.size > 0) {
          Array.from(filters.locations).forEach(locationId => {
            params.append('locationId', locationId);
          });
        }
        if (filters.sources.size > 0) {
          Array.from(filters.sources).forEach(sourceId => {
            params.append('sourceId', sourceId);
          });
        }
        if (filters.owners.size > 0) {
          Array.from(filters.owners).forEach(ownerId => {
            params.append('ownerId', ownerId);
          });
        }
        if (filters.makes.size > 0) {
          Array.from(filters.makes).forEach(make => {
            params.append('make', make);
          });
        }

        const response = await fetch(`/api/vehicles?${params}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to fetch vehicles');
        }

        setVehicles(result.data.vehicles || []);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        setError(error instanceof Error ? error.message : 'Failed to load vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [filters]);

  // Toggle filter card
  const handleCardToggle = useCallback((category: keyof FilterState, id: string) => {
    setFilters(prev => {
      const newSet = new Set(prev[category]);
      if (newSet.has(id)) {
        newSet.delete(id); // Deselect
      } else {
        // Multiple selection per category
        newSet.add(id);
      }
      return { ...prev, [category]: newSet };
    });
  }, []);

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      locations: new Set(),
      sources: new Set(),
      owners: new Set(),
      makes: new Set(),
    });
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  // Export to CSV
  const exportToCSV = () => {
    if (vehicles.length === 0) return;

    const headers = ['VIN', 'Make', 'Model', 'Year', 'Color', 'Status', 'Location', 'Owner', 'Source', 'Order Date', 'Estimated Delivery'];
    const rows = vehicles.map(v => [
      v.vin || '',
      v.make || '',
      v.model || '',
      v.year?.toString() || '',
      v.color || '',
      v.status || '',
      v.currentLocation?.name || '',
      v.owner?.name || '',
      v.source?.name || '',
      formatDate(v.orderDate),
      v.estimatedDelivery ? formatDate(v.estimatedDelivery) : '',
    ]);

    // Escape special characters in CSV
    const escapeCSV = (value: any) => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const csv = [headers.map(escapeCSV), ...rows.map(row => row.map(escapeCSV))].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vehicles_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculate chart data
  const statusDistributionData = useMemo(() => {
    if (vehicles.length === 0) return [];
    
    const statusCounts = vehicles.reduce((acc, v) => {
      acc[v.status] = (acc[v.status] || 0) + 1;
      return acc;
    }, {} as Record<VehicleStatus, number>);

    const total = vehicles.length;
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / total) * 100),
    }));
  }, [vehicles]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (typingRef.current || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Help shortcut
      if (e.key === '?' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setShowShortcutsHelp(true);
        e.preventDefault();
        return;
      }

      // Escape - Clear filters
      if (e.key === 'Escape') {
        if (presetModalOpen) {
          setPresetModalOpen(false);
        } else if (showShortcutsHelp) {
          setShowShortcutsHelp(false);
        } else if (hasActiveFilters) {
          clearAllFilters();
        }
        e.preventDefault();
        return;
      }

      // Only process number shortcuts when not in modal
      if (presetModalOpen || showShortcutsHelp) return;

      // Number shortcuts for toggling first few items
      const numKey = parseInt(e.key);
      if (numKey >= 1 && numKey <= 9) {
        e.preventDefault();
        
        if (e.shiftKey) {
          // Shift + number = Sources
          const index = numKey - 1;
          if (index < updatedFilterOptions.sources.length) {
            const item = updatedFilterOptions.sources[index];
            handleCardToggle('sources', item.id);
          }
        } else if (e.ctrlKey || e.metaKey) {
          // Ctrl/Cmd + number = Owners
          const index = numKey - 1;
          if (index < updatedFilterOptions.owners.length) {
            const item = updatedFilterOptions.owners[index];
            handleCardToggle('owners', item.id);
          }
        } else if (e.altKey) {
          // Alt + number = Makes
          const index = numKey - 1;
          if (index < updatedFilterOptions.makes.length) {
            const item = updatedFilterOptions.makes[index];
            handleCardToggle('makes', item.id);
          }
        } else {
          // Number alone = Locations
          const index = numKey - 1;
          if (index < updatedFilterOptions.locations.length) {
            const item = updatedFilterOptions.locations[index];
            handleCardToggle('locations', item.id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [presetModalOpen, showShortcutsHelp, hasActiveFilters, updatedFilterOptions, handleCardToggle]);

  // Get active filter labels for display with category and color info
  interface ActiveFilter {
    id: string;
    label: string;
    category: 'locations' | 'sources' | 'owners' | 'makes';
    variant: 'purple' | 'teal' | 'yellow' | 'blue';
  }

  const activeFiltersList = useMemo(() => {
    const list: ActiveFilter[] = [];
    filters.locations.forEach(id => {
      const item = filterOptions.locations.find(l => l.id === id);
      if (item) list.push({ id, label: item.label, category: 'locations', variant: 'purple' });
    });
    filters.sources.forEach(id => {
      const item = filterOptions.sources.find(s => s.id === id);
      if (item) list.push({ id, label: item.label, category: 'sources', variant: 'teal' });
    });
    filters.owners.forEach(id => {
      const item = filterOptions.owners.find(o => o.id === id);
      if (item) list.push({ id, label: item.label, category: 'owners', variant: 'yellow' });
    });
    filters.makes.forEach(id => {
      const item = filterOptions.makes.find(m => m.id === id);
      if (item) list.push({ id, label: item.label, category: 'makes', variant: 'blue' });
    });
    return list;
  }, [filters, filterOptions]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Executive Dashboard</h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Filter and explore vehicles by location, source, owner, and make
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4 mr-2" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setPresetModalOpen(true)}>
                    <Save className="h-4 w-4 mr-2" />
                    Manage Presets
                  </DropdownMenuItem>
                  {vehicles.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={exportToCSV}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowShortcutsHelp(true)}>
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Keyboard Shortcuts
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Active Filters Summary - Sticky */}
        {hasActiveFilters && (
          <div className="sticky top-0 z-[100] mb-8 -mx-6 px-6 py-4 bg-background/95 backdrop-blur-sm border-b shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <span className="text-sm font-medium text-muted-foreground">Active Filters:</span>
                {activeFiltersList.map((filter) => {
                  const variantStyles = {
                    purple: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700',
                    teal: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/50 dark:text-teal-300 dark:border-teal-700',
                    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700',
                    blue: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700',
                  };
                  return (
                    <Badge
                      key={filter.id}
                      variant="outline"
                      className={`text-xs border ${variantStyles[filter.variant]}`}
                    >
                      {filter.label}
                    </Badge>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        )}

        {/* Locations Section */}
        <div className="mb-8">
          <button 
            onClick={() => toggleCategoryCollapse('locations')}
            className="flex items-center gap-3 mb-4 w-full text-left hover:opacity-80 transition-opacity"
          >
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              {collapsedCategories.locations ? (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold">Locations</h2>
            {filters.locations.size > 0 && (
              <Badge variant="default" className="text-xs">
                {filters.locations.size} selected
              </Badge>
            )}
          </button>
          {!collapsedCategories.locations && (
            filterOptionsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {updatedFilterOptions.locations.map((item) => (
                  <ExecutiveFilterCard
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    count={item.count}
                    isActive={filters.locations.has(item.id)}
                    onToggle={(id) => handleCardToggle('locations', id)}
                    variant="purple"
                  />
                ))}
              </div>
            )
          )}
        </div>

        {/* Sources Section */}
        <div className="mb-8">
          <button 
            onClick={() => toggleCategoryCollapse('sources')}
            className="flex items-center gap-3 mb-4 w-full text-left hover:opacity-80 transition-opacity"
          >
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              {collapsedCategories.sources ? (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
              <Package className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <h2 className="text-xl font-semibold">Sources</h2>
            {filters.sources.size > 0 && (
              <Badge variant="default" className="text-xs">
                {filters.sources.size} selected
              </Badge>
            )}
          </button>
          {!collapsedCategories.sources && (
            filterOptionsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {updatedFilterOptions.sources.map((item) => (
                  <ExecutiveFilterCard
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    count={item.count}
                    isActive={filters.sources.has(item.id)}
                    onToggle={(id) => handleCardToggle('sources', id)}
                    variant="teal"
                  />
                ))}
              </div>
            )
          )}
        </div>

        {/* Owners Section */}
        <div className="mb-8">
          <button 
            onClick={() => toggleCategoryCollapse('owners')}
            className="flex items-center gap-3 mb-4 w-full text-left hover:opacity-80 transition-opacity"
          >
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              {collapsedCategories.owners ? (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center">
              <Users className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-xl font-semibold">Owners</h2>
            {filters.owners.size > 0 && (
              <Badge variant="default" className="text-xs">
                {filters.owners.size} selected
              </Badge>
            )}
          </button>
          {!collapsedCategories.owners && (
            filterOptionsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {updatedFilterOptions.owners.map((item) => (
                  <ExecutiveFilterCard
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    count={item.count}
                    isActive={filters.owners.has(item.id)}
                    onToggle={(id) => handleCardToggle('owners', id)}
                    variant="yellow"
                  />
                ))}
              </div>
            )
          )}
        </div>

        {/* Makes Section */}
        <div className="mb-8">
          <button 
            onClick={() => toggleCategoryCollapse('makes')}
            className="flex items-center gap-3 mb-4 w-full text-left hover:opacity-80 transition-opacity"
          >
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              {collapsedCategories.makes ? (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <Car className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold">Makes</h2>
            {filters.makes.size > 0 && (
              <Badge variant="default" className="text-xs">
                {filters.makes.size} selected
              </Badge>
            )}
          </button>
          {!collapsedCategories.makes && (
            filterOptionsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {updatedFilterOptions.makes.map((item) => (
                  <ExecutiveFilterCard
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    count={item.count}
                    isActive={filters.makes.has(item.id)}
                    onToggle={(id) => handleCardToggle('makes', id)}
                    variant="blue"
                  />
                ))}
              </div>
            )
          )}
        </div>

        {/* Charts/Analytics Section */}
        {hasActiveFilters && showCharts && vehicles.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-xl font-semibold">Analytics</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCharts(!showCharts)}
              >
                {showCharts ? 'Hide' : 'Show'} Analytics
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {statusDistributionData.length > 0 && (
                <StatusDistributionChart
                  data={statusDistributionData}
                  title="Status Distribution"
                />
              )}
            </div>
          </div>
        )}

        {/* Vehicles Grid */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <Car className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold">
                Vehicles
                {vehicles.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {vehicles.length}
                  </Badge>
                )}
              </h2>
            </div>
            {vehicles.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="text-red-500 mb-2">Error loading vehicles</div>
                <p className="text-sm text-muted-foreground">{error}</p>
              </CardContent>
            </Card>
          ) : vehicles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {hasActiveFilters 
                    ? 'No vehicles match your current filters. Try adjusting your selections.'
                    : 'Select filters above to view vehicles.'}
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearAllFilters}>
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => {
                const primaryImage = vehicle.images?.find(img => img.isPrimary) || vehicle.images?.[0];
                const imageUrl = primaryImage?.thumbnailUrl || primaryImage?.url;
                
                return (
                  <Card
                    key={vehicle.id}
                    className="relative overflow-hidden cursor-pointer group border-0 shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] aspect-[4/3]"
                    onClick={() => router.push(`/vehicles/${vehicle.id}`)}
                  >
                    {imageUrl ? (
                      <div className="absolute inset-0">
                        <img
                          src={imageUrl}
                          alt={primaryImage?.alt || `${vehicle.make} ${vehicle.model}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 group-hover:brightness-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Car className="h-16 w-16 text-primary/30" />
                      </div>
                    )}
                    
                    <div className="relative h-full flex flex-col justify-between p-4 sm:p-6 text-white">
                      <div className="flex justify-end">
                        <Badge 
                          variant="outline" 
                          className="text-xs border-white/20 bg-white/10 backdrop-blur-sm text-white"
                        >
                          {vehicle.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 sm:space-y-3">
                        <div>
                          <h3 className="font-bold text-lg sm:text-xl leading-tight drop-shadow-lg">
                            {vehicle.make} {vehicle.model}
                          </h3>
                          <p className="text-sm text-white/90 drop-shadow-md mt-1">
                            {vehicle.year} • {vehicle.color}
                          </p>
                          <p className="text-xs text-white/70 font-mono drop-shadow mt-1">
                            {vehicle.vin}
                          </p>
                        </div>
                        
                        <div className="space-y-1.5 pt-2 border-t border-white/20">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3.5 w-3.5 text-white/80 flex-shrink-0" />
                            <span className="text-white/80 truncate">
                              {vehicle.currentLocation?.name || 'Unknown Location'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Car className="h-3.5 w-3.5 text-white/80 flex-shrink-0" />
                            <span className="text-white/80">
                              {formatDate(vehicle.orderDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Filter Presets Modal */}
      <FilterPresets
        presets={presets}
        currentFilters={filters}
        onSavePreset={savePreset}
        onLoadPreset={loadPreset}
        onDeletePreset={deletePreset}
        open={presetModalOpen}
        onOpenChange={setPresetModalOpen}
      />

      {/* Keyboard Shortcuts Help Modal */}
      {showShortcutsHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowShortcutsHelp(false)}>
          <Card className="max-w-2xl w-full m-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Keyboard Shortcuts</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowShortcutsHelp(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Filter Toggles</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li><kbd className="px-2 py-1 bg-muted rounded text-xs">1-9</kbd> - Toggle location cards</li>
                    <li><kbd className="px-2 py-1 bg-muted rounded text-xs">Shift</kbd> + <kbd className="px-2 py-1 bg-muted rounded text-xs">1-9</kbd> - Toggle source cards</li>
                    <li><kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl/Cmd</kbd> + <kbd className="px-2 py-1 bg-muted rounded text-xs">1-9</kbd> - Toggle owner cards</li>
                    <li><kbd className="px-2 py-1 bg-muted rounded text-xs">Alt</kbd> + <kbd className="px-2 py-1 bg-muted rounded text-xs">1-9</kbd> - Toggle make cards</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Actions</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li><kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd> - Clear all filters or close modals</li>
                    <li><kbd className="px-2 py-1 bg-muted rounded text-xs">?</kbd> - Show this help</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ExecutiveDashboard;
