'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Car } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { DataTable, TableColumn, TableAction } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { useAuthStore } from '@/store/auth';
import { hasPermission } from '@/lib/permissions';

interface VehicleModel {
  id: string;
  name: string;
  makeId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  make: {
    id: string;
    name: string;
  };
}

interface VehicleMake {
  id: string;
  name: string;
}

const ITEMS_PER_PAGE = 10;

export function ModelsTable() {
  const { user } = useAuthStore();
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [makes, setMakes] = useState<VehicleMake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<VehicleModel | null>(null);
  const [formData, setFormData] = useState({ name: '', makeId: '', isActive: true });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMakeFilter, setSelectedMakeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchMakes();
    fetchModels();
  }, []);

  const fetchMakes = async () => {
    try {
      const response = await fetch('/api/settings/makes?includeInactive=false');
      const result = await response.json();
      if (result.success) {
        setMakes(result.data);
      }
    } catch (err) {
      console.error('Error fetching makes:', err);
    }
  };

  const fetchModels = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = selectedMakeFilter !== 'all' 
        ? `/api/settings/models?makeId=${selectedMakeFilter}&includeInactive=true`
        : '/api/settings/models?includeInactive=true';
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setModels(result.data);
        setCurrentPage(1); // Reset to first page when data changes
      } else {
        setError(result.error || 'Failed to fetch models');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch models');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, [selectedMakeFilter]);

  const handleAdd = () => {
    setEditingModel(null);
    setFormData({ name: '', makeId: makes[0]?.id || '', isActive: true });
    setIsDialogOpen(true);
  };

  const handleEdit = (model: VehicleModel) => {
    setEditingModel(model);
    setFormData({ name: model.name, makeId: model.makeId, isActive: model.isActive });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this model? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/settings/models/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        await fetchModels();
      } else {
        alert(result.error || 'Failed to delete model');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete model');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingModel 
        ? `/api/settings/models/${editingModel.id}`
        : '/api/settings/models';
      const method = editingModel ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setIsDialogOpen(false);
        await fetchModels();
        setFormData({ name: '', makeId: makes[0]?.id || '', isActive: true });
        setEditingModel(null);
      } else {
        alert(result.error || 'Failed to save model');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save model');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredModels = selectedMakeFilter === 'all' 
    ? models 
    : models.filter(m => m.makeId === selectedMakeFilter);

  // Pagination calculations
  const totalPages = Math.ceil(filteredModels.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedModels = filteredModels.slice(startIndex, endIndex);

  // Table columns
  const columns: TableColumn<VehicleModel>[] = [
    {
      key: 'make',
      label: 'Make',
      sortable: true,
      icon: <Car className="h-4 w-4" />,
      render: (model) => (
        <div className="flex items-center gap-2">
          <Car className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{model.make.name}</span>
        </div>
      )
    },
    {
      key: 'name',
      label: 'Model Name',
      sortable: true,
      render: (model) => (
        <span className="font-medium">{model.name}</span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (model) => (
        <Badge variant={model.isActive ? 'default' : 'secondary'}>
          {model.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (model) => (
        <span className="text-sm text-muted-foreground">
          {new Date(model.createdAt).toLocaleDateString()}
        </span>
      )
    }
  ];

  // Table actions - Permission based
  const actions: TableAction<VehicleModel>[] = [
    ...(user && hasPermission(user, 'edit_settings') ? [{
      key: 'edit',
      label: 'Edit Model',
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEdit
    }] : []),
    ...(user && hasPermission(user, 'delete_settings') ? [{
      key: 'delete',
      label: 'Delete Model',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'ghost' as const,
      className: 'text-destructive hover:text-destructive',
      onClick: (model: VehicleModel) => handleDelete(model.id)
    }] : [])
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vehicle Models</h2>
          <p className="text-muted-foreground text-sm">Manage vehicle models by make</p>
        </div>
        {user && hasPermission(user, 'add_settings') && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAdd} disabled={makes.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Add Model
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingModel ? 'Edit Model' : 'Add New Model'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="makeId">Make *</Label>
                  <Select
                    value={formData.makeId}
                    onValueChange={(value) => setFormData({ ...formData, makeId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a make" />
                    </SelectTrigger>
                    <SelectContent>
                      {makes.map((make) => (
                        <SelectItem key={make.id} value={make.id}>
                          {make.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Model Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Camry"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingModel ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="makeFilter">Filter by Make:</Label>
          <Select value={selectedMakeFilter} onValueChange={setSelectedMakeFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Makes</SelectItem>
              {makes.map((make) => (
                <SelectItem key={make.id} value={make.id}>
                  {make.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <DataTable
        data={paginatedModels}
        columns={columns}
        actions={actions}
        loading={loading}
        emptyMessage="No models found. Add your first model to get started."
      />

      {!loading && filteredModels.length > 0 && totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
