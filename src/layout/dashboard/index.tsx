'use client';

import React from 'react';
import { DashboardHeader } from './header';
import { DashboardSidebar } from './sidenav';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuthStore } from '@/store/auth';
import type { User, Role } from '@/types';

interface DashboardLayoutProps {
  user?: User | null;
  userRole?: Role;
  onLogout?: () => void;
  children?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  user: propUser, 
  userRole: propUserRole, 
  onLogout: propOnLogout,
  children
}) => {
  const { user: authUser, logout } = useAuthStore();
  const user = propUser || authUser;
  const userRole = propUserRole || user?.role;
  const onLogout = propOnLogout || logout;
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background w-full">
        {/* Sidebar */}
        <DashboardSidebar userRole={userRole || 'Normal'} user={user} />
        
        {/* Main Content Area */}
        <SidebarInset className="w-full overflow-x-hidden">
          <div className="flex flex-col h-full w-full">
            {/* Header */}
            <DashboardHeader user={user} onLogout={onLogout} />
            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-muted/30 w-full">
              <div className="w-full max-w-full overflow-x-hidden">
                {children}
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
