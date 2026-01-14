'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Cog } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { DataTable, TableColumn, TableAction } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';

interface TransmissionType {
  id: string;
  name: string;
  enumValue: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ITEMS_PER_PAGE = 10;

export function TransmissionsTable() {
  const [transmissions, setTransmissions] = useState<TransmissionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransmission, setEditingTransmission] = useState<TransmissionType | null>(null);
  const [formData, setFormData] = useState({ name: '', enumValue: '', isActive: true });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchTransmissions();
  }, []);

  const fetchTransmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/settings/transmissions?includeInactive=true');
      const result = await response.json();
      
      if (result.success) {
        setTransmissions(result.data);
        setCurrentPage(1); // Reset to first page when data changes
      } else {
        setError(result.error || 'Failed to fetch transmission types');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transmission types');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTransmission(null);
    setFormData({ name: '', enumValue: '', isActive: true });
    setIsDialogOpen(true);
  };

  const handleEdit = (transmission: TransmissionType) => {
    setEditingTransmission(transmission);
    setFormData({ name: transmission.name, enumValue: transmission.enumValue, isActive: transmission.isActive });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transmission type? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/settings/transmissions/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        await fetchTransmissions();
      } else {
        alert(result.error || 'Failed to delete transmission type');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete transmission type');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingTransmission 
        ? `/api/settings/transmissions/${editingTransmission.id}`
        : '/api/settings/transmissions';
      const method = editingTransmission ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          enumValue: formData.enumValue.toUpperCase(),
          isActive: formData.isActive,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsDialogOpen(false);
        await fetchTransmissions();
        setFormData({ name: '', enumValue: '', isActive: true });
        setEditingTransmission(null);
      } else {
        alert(result.error || 'Failed to save transmission type');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save transmission type');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(transmissions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTransmissions = transmissions.slice(startIndex, endIndex);

  // Table columns
  const columns: TableColumn<TransmissionType>[] = [
    {
      key: 'name',
      label: 'Display Name',
      sortable: true,
      icon: <Cog className="h-4 w-4" />,
      render: (transmission) => (
        <div className="flex items-center gap-2">
          <Cog className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{transmission.name}</span>
        </div>
      )
    },
    {
      key: 'enumValue',
      label: 'Enum Value',
      render: (transmission) => (
        <span className="font-mono text-sm">
          {transmission.enumValue}
        </span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (transmission) => (
        <Badge variant={transmission.isActive ? 'default' : 'secondary'}>
          {transmission.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (transmission) => (
        <span className="text-sm text-muted-foreground">
          {new Date(transmission.createdAt).toLocaleDateString()}
        </span>
      )
    }
  ];

  // Table actions
  const actions: TableAction<TransmissionType>[] = [
    {
      key: 'edit',
      label: 'Edit Transmission Type',
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEdit
    },
    {
      key: 'delete',
      label: 'Delete Transmission Type',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'ghost',
      className: 'text-destructive hover:text-destructive',
      onClick: (transmission) => handleDelete(transmission.id)
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transmission Types</h2>
          <p className="text-muted-foreground text-sm">Manage vehicle transmission types</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Transmission Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTransmission ? 'Edit Transmission Type' : 'Add New Transmission Type'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Automatic"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enumValue">Enum Value *</Label>
                  <Input
                    id="enumValue"
                    value={formData.enumValue}
                    onChange={(e) => setFormData({ ...formData, enumValue: e.target.value.toUpperCase() })}
                    placeholder="e.g., AUTOMATIC"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This value is used in the database. Use uppercase letters and underscores (e.g., AUTOMATIC, MANUAL, DUAL_CLUTCH)
                  </p>
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
                  {isSubmitting ? 'Saving...' : editingTransmission ? 'Update' : 'Create'}
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
        data={paginatedTransmissions}
        columns={columns}
        actions={actions}
        loading={loading}
        emptyMessage="No transmission types found. Add your first transmission type to get started."
      />

      {!loading && transmissions.length > 0 && totalPages > 1 && (
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
