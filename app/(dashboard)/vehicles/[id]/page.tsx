'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import SimpleVehicleDetailsPage from '@/components/globals/vehicles/simple-vehicle-details-page';

const AdminVehicleDetails: React.FC = () => {
  const params = useParams();
  const vehicleId = params.id as string;

  return <SimpleVehicleDetailsPage vehicleId={vehicleId} />;
};

export default AdminVehicleDetails;

