'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Palette } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { DataTable, TableColumn, TableAction } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { useAuthStore } from '@/store/auth';
import { hasPermission } from '@/lib/permissions';

interface VehicleColor {
  id: string;
  name: string;
  hexCode: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ITEMS_PER_PAGE = 10;

export function ColorsTable() {
  const { user } = useAuthStore();
  const [colors, setColors] = useState<VehicleColor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<VehicleColor | null>(null);
  const [formData, setFormData] = useState({ name: '', hexCode: '', isActive: true });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchColors();
  }, []);

  const fetchColors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/settings/colors?includeInactive=true');
      const result = await response.json();
      
      if (result.success) {
        setColors(result.data);
        setCurrentPage(1); // Reset to first page when data changes
      } else {
        setError(result.error || 'Failed to fetch colors');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch colors');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingColor(null);
    setFormData({ name: '', hexCode: '', isActive: true });
    setIsDialogOpen(true);
  };

  const handleEdit = (color: VehicleColor) => {
    setEditingColor(color);
    setFormData({ name: color.name, hexCode: color.hexCode || '', isActive: color.isActive });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this color? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/settings/colors/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        await fetchColors();
      } else {
        alert(result.error || 'Failed to delete color');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete color');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingColor 
        ? `/api/settings/colors/${editingColor.id}`
        : '/api/settings/colors';
      const method = editingColor ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          hexCode: formData.hexCode || undefined,
          isActive: formData.isActive,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsDialogOpen(false);
        await fetchColors();
        setFormData({ name: '', hexCode: '', isActive: true });
        setEditingColor(null);
      } else {
        alert(result.error || 'Failed to save color');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save color');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(colors.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedColors = colors.slice(startIndex, endIndex);

  // Table columns
  const columns: TableColumn<VehicleColor>[] = [
    {
      key: 'name',
      label: 'Color',
      sortable: true,
      icon: <Palette className="h-4 w-4" />,
      render: (color) => (
        <div className="flex items-center gap-2">
          {color.hexCode && (
            <div
              className="w-5 h-5 rounded border"
              style={{ backgroundColor: color.hexCode }}
            />
          )}
          <Palette className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{color.name}</span>
        </div>
      )
    },
    {
      key: 'hexCode',
      label: 'Hex Code',
      render: (color) => (
        <span className="font-mono text-sm">
          {color.hexCode || 'N/A'}
        </span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (color) => (
        <Badge variant={color.isActive ? 'default' : 'secondary'}>
          {color.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (color) => (
        <span className="text-sm text-muted-foreground">
          {new Date(color.createdAt).toLocaleDateString()}
        </span>
      )
    }
  ];

  // Table actions - Permission based
  const actions: TableAction<VehicleColor>[] = [
    ...(user && hasPermission(user, 'edit_settings') ? [{
      key: 'edit',
      label: 'Edit Color',
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEdit
    }] : []),
    ...(user && hasPermission(user, 'delete_settings') ? [{
      key: 'delete',
      label: 'Delete Color',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'ghost' as const,
      className: 'text-destructive hover:text-destructive',
      onClick: (color: VehicleColor) => handleDelete(color.id)
    }] : [])
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vehicle Colors</h2>
          <p className="text-muted-foreground text-sm">Manage vehicle colors</p>
        </div>
        {user && hasPermission(user, 'add_settings') && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add Color
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingColor ? 'Edit Color' : 'Add New Color'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., White"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hexCode">Hex Code (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="hexCode"
                      value={formData.hexCode}
                      onChange={(e) => setFormData({ ...formData, hexCode: e.target.value })}
                      placeholder="#FFFFFF"
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                    {formData.hexCode && formData.hexCode.match(/^#[0-9A-Fa-f]{6}$/) && (
                      <div
                        className="w-10 h-10 rounded border"
                        style={{ backgroundColor: formData.hexCode }}
                      />
                    )}
                  </div>
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
                  {isSubmitting ? 'Saving...' : editingColor ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <DataTable
        data={paginatedColors}
        columns={columns}
        actions={actions}
        loading={loading}
        emptyMessage="No colors found. Add your first color to get started."
      />

      {!loading && colors.length > 0 && totalPages > 1 && (
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
