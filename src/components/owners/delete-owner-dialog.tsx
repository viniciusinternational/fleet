'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';
import type { Owner } from '@/types';

interface DeleteOwnerDialogProps {
  owner: Owner | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (ownerId: string) => void;
}

export function DeleteOwnerDialog({ owner, isOpen, onClose, onConfirm }: DeleteOwnerDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!owner) return;
    
    setIsDeleting(true);
    try {
      await onConfirm(owner.id);
      onClose();
    } catch (error) {
      console.error('Error deleting owner:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!owner) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Owner
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{owner.name}</strong>? This action cannot be undone.
            {owner.vehicles && owner.vehicles.length > 0 && (
              <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-700 rounded text-yellow-800 dark:text-yellow-200">
                <strong>Warning:</strong> This owner has {owner.vehicles.length} associated vehicle(s). 
                Deleting this owner may affect vehicle records.
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Owner
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
