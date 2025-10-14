'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DeleteLocationDialogProps {
  locationId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteLocationDialog({ locationId, isOpen, onClose }: DeleteLocationDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteLocation = async () => {
    if (!locationId) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/locations/${locationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete location');
      }
      
      onClose();
      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error('Failed to delete location:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Location</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to delete this location? This action cannot be undone.</p>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDeleteLocation}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

