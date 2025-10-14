'use client';

import VehiclesPage from '@/components/globals/vehicles/vehicles-page';

const NormalVehicles: React.FC = () => {
  return <VehiclesPage userRole="Normal" basePath="/normal" />;
};

export default NormalVehicles;
