'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { DataTable, TableColumn, TableAction } from '@/components/ui/data-table';
import { Edit, Trash2, Eye } from 'lucide-react';

// Example data type
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

// Example data
const sampleProducts: Product[] = [
  { id: '1', name: 'Laptop', price: 999, category: 'Electronics', inStock: true },
  { id: '2', name: 'Phone', price: 699, category: 'Electronics', inStock: false },
  { id: '3', name: 'Book', price: 19, category: 'Education', inStock: true },
];

export function SimpleDataTableExample() {
  const [products, setProducts] = useState(sampleProducts);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleDelete = (product: Product) => {
    setProducts(products.filter(p => p.id !== product.id));
  };

  const handleEdit = (product: Product) => {
    console.log('Edit product:', product);
  };

  const handleView = (product: Product) => {
    console.log('View product:', product);
  };

  // Define table columns
  const columns: TableColumn<Product>[] = [
    {
      key: 'name',
      label: 'Product Name',
      sortable: true,
      render: (product) => (
        <div className="font-medium">{product.name}</div>
      )
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (product) => (
        <div className="font-mono">${product.price}</div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (product) => (
        <Badge variant="outline">{product.category}</Badge>
      )
    },
    {
      key: 'inStock',
      label: 'Status',
      render: (product) => (
        <Badge variant={product.inStock ? 'default' : 'secondary'}>
          {product.inStock ? 'In Stock' : 'Out of Stock'}
        </Badge>
      )
    }
  ];

  // Define table actions
  const actions: TableAction<Product>[] = [
    {
      key: 'view',
      label: 'View Product',
      icon: <Eye className="h-4 w-4" />,
      onClick: handleView
    },
    {
      key: 'edit',
      label: 'Edit Product',
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEdit
    },
    {
      key: 'delete',
      label: 'Delete Product',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'ghost',
      className: 'text-destructive hover:text-destructive',
      onClick: handleDelete
    }
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Simple Data Table Example</h2>
      <p className="text-muted-foreground mb-6">
        This example shows how to use the generic DataTable component with any data type.
      </p>
      
      <DataTable
        data={products}
        columns={columns}
        actions={actions}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onRowClick={(product) => console.log('Row clicked:', product)}
        emptyMessage="No products found"
      />
    </div>
  );
}
