'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus,
  Edit,
  Upload,
  Paperclip,
  XCircle,
  X
} from 'lucide-react';
import { VehicleStatus } from '@/types';
import type { TrackingEvent } from '@/types';
import { mockLocations } from '../../../mockdata';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: Omit<TrackingEvent, 'id' | 'timestamp'>) => void;
  editingEvent?: TrackingEvent | null;
  title?: string;
}

const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingEvent = null,
  title
}) => {
  const [formData, setFormData] = useState({
    location: editingEvent?.location || '',
    status: editingEvent?.status || '' as VehicleStatus,
    notes: editingEvent?.notes || '',
    documents: [] as Array<{ id: string; name: string; url: string }>
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or editing event changes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        location: editingEvent?.location || '',
        status: editingEvent?.status || '' as VehicleStatus,
        notes: editingEvent?.notes || '',
        documents: []
      });
    }
  }, [isOpen, editingEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.location || !formData.status) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        location: formData.location,
        status: formData.status,
        notes: formData.notes || undefined
      });
      
      // Reset form
      setFormData({
        location: '',
        status: '' as VehicleStatus,
        notes: '',
        documents: []
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to submit event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newDocuments = Array.from(files).map((file, index) => ({
        id: `doc-${Date.now()}-${index}`,
        name: file.name,
        url: URL.createObjectURL(file)
      }));
      
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...newDocuments]
      }));
    }
  };

  const removeDocument = (docId: string) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== docId)
    }));
  };

  const modalTitle = title || (editingEvent ? 'Edit Tracking Event' : 'Add New Tracking Event');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editingEvent ? (
              <Edit className="h-5 w-5" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
            {modalTitle}
          </DialogTitle>
          <DialogDescription>
            {editingEvent 
              ? 'Update the tracking event details below.'
              : 'Add a new tracking event to record the vehicle\'s journey progress.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event-location">Location *</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {mockLocations.map((location) => (
                    <SelectItem key={location.id} value={location.name}>
                      {location.name} - {location.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="event-status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: VehicleStatus) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ordered">Ordered</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Clearing Customs">Clearing Customs</SelectItem>
                  <SelectItem value="At Port">At Port</SelectItem>
                  <SelectItem value="In Local Delivery">In Local Delivery</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-notes">Notes (Optional)</Label>
            <Textarea
              id="event-notes"
              placeholder="Add any additional notes about this event..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>
          
          {/* Document Upload Section */}
          <div className="space-y-3">
            <Label>Documents (Optional)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 cursor-pointer bg-muted/50 hover:bg-muted/75 rounded-lg transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PDF, DOC, or image files</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleDocumentUpload}
                  />
                </label>
              </div>
            </div>

            {/* Display uploaded documents */}
            {formData.documents.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Documents:</Label>
                <div className="space-y-2">
                  {formData.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{doc.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(doc.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!formData.location || !formData.status || isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {editingEvent ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  {editingEvent ? (
                    <>
                      <Edit className="h-4 w-4" />
                      Update Event
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add Event
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEventModal;
