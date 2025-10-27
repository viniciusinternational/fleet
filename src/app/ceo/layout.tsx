'use client';

import { DashboardLayout } from '@/layout/dashboard';

export default function CEOLayout({
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
