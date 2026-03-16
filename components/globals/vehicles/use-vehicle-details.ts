'use client';

import { useEffect, useState } from 'react';
import type { Vehicle, VehicleImage } from '@/types';

interface VehicleWithImages extends Vehicle {
  images: VehicleImage[];
}

interface UseVehicleDetailsResult {
  vehicle: VehicleWithImages | null;
  loading: boolean;
  error: string | null;
}

export function useVehicleDetails(vehicleId: string | undefined): UseVehicleDetailsResult {
  const [vehicle, setVehicle] = useState<VehicleWithImages | null>(null);
  const [loading, setLoading] = useState<boolean>(!!vehicleId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vehicleId) {
      setVehicle(null);
      setLoading(false);
      setError('Missing vehicle id');
      return;
    }

    let isCancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch core vehicle data
        const vehicleRes = await fetch(`/api/vehicles/${vehicleId}`);
        if (!vehicleRes.ok) {
          if (vehicleRes.status === 404) {
            throw new Error('Vehicle not found');
          }
          throw new Error('Failed to load vehicle details');
        }
        const vehicleData: Vehicle = await vehicleRes.json();

        // Fetch images (best-effort)
        let images: VehicleImage[] = [];
        try {
          const imagesRes = await fetch(`/api/vehicles/${vehicleId}/images`);
          if (imagesRes.ok) {
            const payload = await imagesRes.json();
            const rawImages = Array.isArray(payload?.data) ? payload.data : [];
            images = rawImages.map((img: any) => ({
              id: img.id,
              url: img.url ?? img.data ?? '',
              thumbnailUrl: img.thumbnailUrl ?? img.url ?? img.data ?? '',
              alt: img.alt ?? `${vehicleData.make} ${vehicleData.model}`,
              caption: img.caption,
              isPrimary: img.isPrimary,
              data: img.data,
            }));
          }
        } catch (imageError) {
          console.error('Failed to load vehicle images', imageError);
        }

        if (isCancelled) return;

        setVehicle({
          ...vehicleData,
          images,
        });
      } catch (err) {
        if (isCancelled) return;
        console.error('Error loading vehicle details', err);
        setVehicle(null);
        setError(err instanceof Error ? err.message : 'Failed to load vehicle details');
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isCancelled = true;
    };
  }, [vehicleId]);

  return { vehicle, loading, error };
}

