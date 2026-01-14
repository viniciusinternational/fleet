'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Car } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { DataTable, TableColumn, TableAction } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';

interface VehicleMake {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    models: number;
  };
}

const ITEMS_PER_PAGE = 10;

export function MakesTable() {
  const [makes, setMakes] = useState<VehicleMake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMake, setEditingMake] = useState<VehicleMake | null>(null);
  const [formData, setFormData] = useState({ name: '', isActive: true });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchMakes();
  }, []);

  const fetchMakes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/settings/makes?includeInactive=true');
      const result = await response.json();
      
      if (result.success) {
        setMakes(result.data);
        setCurrentPage(1); // Reset to first page when data changes
      } else {
        setError(result.error || 'Failed to fetch makes');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch makes');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingMake(null);
    setFormData({ name: '', isActive: true });
    setIsDialogOpen(true);
  };

  const handleEdit = (make: VehicleMake) => {
    setEditingMake(make);
    setFormData({ name: make.name, isActive: make.isActive });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this make? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/settings/makes/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        await fetchMakes();
      } else {
        alert(result.error || 'Failed to delete make');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete make');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingMake 
        ? `/api/settings/makes/${editingMake.id}`
        : '/api/settings/makes';
      const method = editingMake ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setIsDialogOpen(false);
        await fetchMakes();
        setFormData({ name: '', isActive: true });
        setEditingMake(null);
      } else {
        alert(result.error || 'Failed to save make');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save make');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(makes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedMakes = makes.slice(startIndex, endIndex);

  // Table columns
  const columns: TableColumn<VehicleMake>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      icon: <Car className="h-4 w-4" />,
      render: (make) => (
        <div className="flex items-center gap-2">
          <Car className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{make.name}</span>
        </div>
      )
    },
    {
      key: 'modelsCount',
      label: 'Models Count',
      render: (make) => (
        <Badge variant="outline">{make._count?.models || 0} models</Badge>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (make) => (
        <Badge variant={make.isActive ? 'default' : 'secondary'}>
          {make.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (make) => (
        <span className="text-sm text-muted-foreground">
          {new Date(make.createdAt).toLocaleDateString()}
        </span>
      )
    }
  ];

  // Table actions
  const actions: TableAction<VehicleMake>[] = [
    {
      key: 'edit',
      label: 'Edit Make',
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEdit
    },
    {
      key: 'delete',
      label: 'Delete Make',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'ghost',
      className: 'text-destructive hover:text-destructive',
      onClick: (make) => {
        if (make._count && make._count.models > 0) {
          alert('Cannot delete make that has associated models. Please delete or reassign models first.');
          return;
        }
        handleDelete(make.id);
      }
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vehicle Makes</h2>
          <p className="text-muted-foreground text-sm">Manage vehicle makes/brands</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Make
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMake ? 'Edit Make' : 'Add New Make'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Toyota"
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
                  {isSubmitting ? 'Saving...' : editingMake ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <DataTable
        data={paginatedMakes}
        columns={columns}
        actions={actions}
        loading={loading}
        emptyMessage="No makes found. Add your first make to get started."
      />

      {!loading && makes.length > 0 && totalPages > 1 && (
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
