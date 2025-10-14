'use client';

import { DashboardLayout } from '@/layout/dashboard';

export default function NormalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}
