'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Ship, 
  ArrowLeft,
  Save,
  Loader2,
  Upload,
  CheckCircle2
} from 'lucide-react';
import type { Vehicle, shippingDetails } from '@/types';

const EditShipping: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [shippingDetails, setShippingDetails] = useState<shippingDetails | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);

  // Form data state
  const [formData, setFormData] = useState({
    originPort: '',
    destinationPort: '',
    shippingCompany: '',
    vesselName: '',
    containerNumber: '',
    bookingNumber: '',
    departureDate: '',
    expectedArrivalDate: '',
    customsStatus: 'Pending' as 'Pending' | 'In Progress' | 'Cleared' | 'Held',
    importDuty: '' as number | string,
    customsNotes: '',
    notes: ''
  });

  // Document state
  const [shippingDocuments, setShippingDocuments] = useState<File[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<any[]>([]);

  // Fetch vehicle and shipping data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/vehicles/${vehicleId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch vehicle data');
        }
        
        const vehicleData = await response.json();
        
        if (vehicleData) {
          setVehicle(vehicleData);
          
          // Set shipping details if they exist
          if (vehicleData.shippingDetails) {
            setShippingDetails(vehicleData.shippingDetails);
            setFormData({
              originPort: vehicleData.shippingDetails.originPort || '',
              destinationPort: vehicleData.shippingDetails.destinationPort || '',
              shippingCompany: vehicleData.shippingDetails.shippingCompany || '',
              vesselName: vehicleData.shippingDetails.vesselName || '',
              containerNumber: vehicleData.shippingDetails.containerNumber || '',
              bookingNumber: vehicleData.shippingDetails.bookingNumber || '',
              departureDate: vehicleData.shippingDetails.departureDate ? 
                new Date(vehicleData.shippingDetails.departureDate).toISOString().split('T')[0] : '',
              expectedArrivalDate: vehicleData.shippingDetails.expectedArrivalDate ? 
                new Date(vehicleData.shippingDetails.expectedArrivalDate).toISOString().split('T')[0] : '',
              customsStatus: vehicleData.customsStatus || 'Pending',
              importDuty: vehicleData.importDuty && vehicleData.importDuty !== 0 ? vehicleData.importDuty : '',
              customsNotes: vehicleData.customsNotes || '',
              notes: vehicleData.notes || ''
            });
            
            // Set existing documents
            if (vehicleData.shippingDetails.documents) {
              setExistingDocuments(vehicleData.shippingDetails.documents);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrors({ fetch: 'Failed to load vehicle data' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vehicleId]);

  // Helper function to format number input values for display
  const formatNumberValue = (value: number | string): string => {
    if (value === '' || value === 0 || value === null || value === undefined) {
      return '';
    }
    return String(value);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleShippingDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setShippingDocuments(prev => [...prev, ...files]);
  };

  const removeShippingDocument = (index: number) => {
    setShippingDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingDocument = (index: number) => {
    setExistingDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setSuccess(null);

    try {
      // Create FormData for shipping details and documents
      const shippingFormData = new FormData();
      
      // Add shipping details
      shippingFormData.append('originPort', formData.originPort);
      shippingFormData.append('destinationPort', formData.destinationPort);
      shippingFormData.append('shippingCompany', formData.shippingCompany);
      shippingFormData.append('vesselName', formData.vesselName);
      shippingFormData.append('containerNumber', formData.containerNumber);
      shippingFormData.append('bookingNumber', formData.bookingNumber);
      shippingFormData.append('departureDate', formData.departureDate);
      shippingFormData.append('expectedArrivalDate', formData.expectedArrivalDate);
      shippingFormData.append('customsStatus', formData.customsStatus);
      shippingFormData.append('importDuty', (typeof formData.importDuty === 'string' && formData.importDuty === '' ? 0 : (typeof formData.importDuty === 'number' ? formData.importDuty : parseFloat(formData.importDuty) || 0)).toString());
      shippingFormData.append('customsNotes', formData.customsNotes);
      shippingFormData.append('notes', formData.notes);
      
      // Add new shipping documents
      shippingDocuments.forEach(file => {
        shippingFormData.append('documents', file);
      });

      // Determine if we're creating or updating shipping details
      const isUpdate = shippingDetails !== null;
      const url = isUpdate 
        ? `/api/vehicles/${vehicleId}/shipping` 
        : `/api/vehicles/${vehicleId}/shipping`;
      const method = isUpdate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: shippingFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isUpdate ? 'update' : 'create'} shipping details`);
      }

      setSuccess(`Shipping details ${isUpdate ? 'updated' : 'created'} successfully!`);
      
      // Redirect back to vehicle view after a short delay
      setTimeout(() => {
        router.push(`/vehicles/${vehicleId}`);
      }, 1500);

    } catch (error) {
      console.error('Error saving shipping details:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to save shipping details' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading vehicle data...</span>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Alert>
          <AlertDescription>
            Vehicle not found. Please check the URL and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/vehicles/${vehicleId}`)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Vehicle</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Shipping Details</h1>
            <p className="text-muted-foreground">
              Update shipping information for {vehicle.make} {vehicle.model} ({vehicle.vin})
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="mb-6">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Error Messages */}
      {errors.fetch && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{errors.fetch}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Shipping Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Ship className="h-5 w-5" />
              <span>Shipping Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Origin Port */}
              <div className="space-y-2">
                <Label htmlFor="originPort">Origin Port</Label>
                <Input
                  id="originPort"
                  value={formData.originPort}
                  onChange={(e) => handleInputChange('originPort', e.target.value)}
                  placeholder="Origin port"
                />
              </div>

              {/* Destination Port */}
              <div className="space-y-2">
                <Label htmlFor="destinationPort">Destination Port</Label>
                <Input
                  id="destinationPort"
                  value={formData.destinationPort}
                  onChange={(e) => handleInputChange('destinationPort', e.target.value)}
                  placeholder="Destination port"
                />
              </div>

              {/* Shipping Company */}
              <div className="space-y-2">
                <Label htmlFor="shippingCompany">Shipping Company</Label>
                <Input
                  id="shippingCompany"
                  value={formData.shippingCompany}
                  onChange={(e) => handleInputChange('shippingCompany', e.target.value)}
                  placeholder="Shipping company name"
                />
              </div>

              {/* Vessel Name */}
              <div className="space-y-2">
                <Label htmlFor="vesselName">Vessel Name</Label>
                <Input
                  id="vesselName"
                  value={formData.vesselName}
                  onChange={(e) => handleInputChange('vesselName', e.target.value)}
                  placeholder="Vessel name"
                />
              </div>

              {/* Container Number */}
              <div className="space-y-2">
                <Label htmlFor="containerNumber">Container Number</Label>
                <Input
                  id="containerNumber"
                  value={formData.containerNumber}
                  onChange={(e) => handleInputChange('containerNumber', e.target.value)}
                  placeholder="Container number"
                />
              </div>

              {/* Booking Number */}
              <div className="space-y-2">
                <Label htmlFor="bookingNumber">Booking Number</Label>
                <Input
                  id="bookingNumber"
                  value={formData.bookingNumber}
                  onChange={(e) => handleInputChange('bookingNumber', e.target.value)}
                  placeholder="Booking number"
                />
              </div>

              {/* Departure Date */}
              <div className="space-y-2">
                <Label htmlFor="departureDate">Departure Date</Label>
                <Input
                  id="departureDate"
                  type="date"
                  value={formData.departureDate}
                  onChange={(e) => handleInputChange('departureDate', e.target.value)}
                />
              </div>

              {/* Expected Arrival Date */}
              <div className="space-y-2">
                <Label htmlFor="expectedArrivalDate">Expected Arrival Date</Label>
                <Input
                  id="expectedArrivalDate"
                  type="date"
                  value={formData.expectedArrivalDate}
                  onChange={(e) => handleInputChange('expectedArrivalDate', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customs Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Customs Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customs Status */}
              <div className="space-y-2">
                <Label htmlFor="customsStatus">Customs Status</Label>
                <Select value={formData.customsStatus} onValueChange={(value) => handleInputChange('customsStatus', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Cleared">Cleared</SelectItem>
                    <SelectItem value="Held">Held</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Import Duty */}
              <div className="space-y-2">
                <Label htmlFor="importDuty">Import Duty</Label>
                <Input
                  id="importDuty"
                  type="number"
                  value={formatNumberValue(formData.importDuty)}
                  onChange={(e) => handleInputChange('importDuty', e.target.value)}
                  placeholder="Import duty amount"
                  min="0"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <Label htmlFor="customsNotes">Customs Notes</Label>
              <Textarea
                id="customsNotes"
                value={formData.customsNotes}
                onChange={(e) => handleInputChange('customsNotes', e.target.value)}
                placeholder="Customs notes and comments"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Shipping Documents Card */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Document Upload */}
            <div className="flex items-center gap-4">
              <label htmlFor="shipping-docs-upload" className="cursor-pointer">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <input
                  id="shipping-docs-upload"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleShippingDocumentUpload}
                  className="hidden"
                />
              </label>
              <div className="flex-1">
                <p className="text-sm font-medium">Upload Shipping Documents</p>
                <p className="text-xs text-muted-foreground">
                  Click the icon to select documents • PDF, DOC, DOCX, JPG, PNG • Max 10MB each
                </p>
              </div>
            </div>
            
            {/* Existing Documents */}
            {existingDocuments.length > 0 && (
              <div className="space-y-2">
                <Label>Existing Documents</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {existingDocuments.map((document, index) => (
                      <div key={index} className="relative group">
                        <div className="bg-muted rounded-lg p-4 border">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {document.name.split('.').pop()?.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{document.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Existing document
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeExistingDocument(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* New Documents Preview */}
            {shippingDocuments.length > 0 && (
              <div className="space-y-2">
                <Label>New Documents to Upload</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shippingDocuments.map((document, index) => (
                      <div key={index} className="relative group">
                        <div className="bg-muted rounded-lg p-4 border">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {document.name.split('.').pop()?.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{document.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(document.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeShippingDocument(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Notes Card */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any additional notes or comments..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Error */}
        {errors.submit && (
          <Alert variant="destructive">
            <AlertDescription>{errors.submit}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/vehicles/${vehicleId}`)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Save Shipping Details</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditShipping;
