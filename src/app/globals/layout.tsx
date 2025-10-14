'use client';

import { DashboardLayout } from '@/layout/dashboard';

export default function GlobalsLayout({
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