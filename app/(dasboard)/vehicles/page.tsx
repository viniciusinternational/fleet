'use client';

import VehiclesPage from '@/components/globals/vehicles/vehicles-page';

const AdminVehicles: React.FC = () => {
  return <VehiclesPage userRole="Admin" basePath="/admin" />;
};

export default AdminVehicles;
