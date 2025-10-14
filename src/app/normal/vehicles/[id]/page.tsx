'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import VehicleDetails from '@/components/globals/vehicles/vehicle-details';

const NormalVehicleDetails: React.FC = () => {
  const params = useParams();
  const vehicleId = params.id as string;

  return (
    <VehicleDetails
      vehicleId={vehicleId}
      backUrl="/normal/vehicles"
      showEditButton={true}
    />
  );
};

export default NormalVehicleDetails;