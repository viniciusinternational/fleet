'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Plus,
  HelpCircle
} from 'lucide-react';
// import { MailDrawer } from '@/components/globals/mail-drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { User as UserType } from '@/types';
import { useAuthStore } from '@/store/auth';

interface DashboardHeaderProps {
  user?: UserType | null;
  onLogout?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user: propUser, onLogout: propOnLogout }) => {
  const { user: authUser, logout } = useAuthStore();
  const user = propUser || authUser;
  const onLogout = propOnLogout || logout;
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  // Mock notifications count
  const notificationCount = 3;

  // Get user initials
  const getUserInitials = (firstName: string | undefined | null, lastName: string | undefined | null) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    const initials = (first + last).toUpperCase();
    return initials || 'U';
  };

  // Format user role for display
  const formatRole = (role: string) => {
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      const path = '/' + pathSegments.slice(0, i + 1).join('/');

      // Format segment names
      const name = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      breadcrumbs.push({ name, path });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  };

  // Show header even without user for debugging
  const displayUser = user || { firstName: 'Guest', lastName: 'User', email: 'guest@example.com', role: 'Normal' };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Background */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b" />

      <div className="relative">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Sidebar trigger */}
            <SidebarTrigger />

            {/* Breadcrumbs */}
            <nav className="hidden lg:flex items-center space-x-2 text-sm">
              {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={breadcrumb.path}>
                  {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  <span
                    className={
                      index === breadcrumbs.length - 1
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                    }
                  >
                    {breadcrumb.name}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Center Section - Search */}
          <div className="flex-1 max-w-sm sm:max-w-md mx-2 sm:mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 h-9 sm:h-10 text-sm"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Quick Actions */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 hidden sm:flex"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 hidden md:flex"
            >
              <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-8 w-8 sm:h-9 sm:w-9"
                >
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                  {notificationCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 text-xs border-2 border-background"
                    >
                      {notificationCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="p-4 border-b">
                  <h4 className="font-semibold">Notifications</h4>
                  <p className="text-sm text-muted-foreground">You have {notificationCount} unread messages</p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {/* Notification items with better styling */}
                  <div className="p-4 hover:bg-muted/50 border-b transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div className="space-y-1 min-w-0">
                        <p className="text-sm font-medium">Project Update</p>
                        <p className="text-sm text-muted-foreground">Construction Phase 1 has been completed successfully</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-muted/50 border-b transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className="h-2 w-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                      <div className="space-y-1 min-w-0">
                        <p className="text-sm font-medium">Leave Request</p>
                        <p className="text-sm text-muted-foreground">Sarah Johnson submitted a leave request for review</p>
                        <p className="text-xs text-muted-foreground">4 hours ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className="h-2 w-2 rounded-full bg-destructive mt-2 flex-shrink-0" />
                      <div className="space-y-1 min-w-0">
                        <p className="text-sm font-medium">Budget Alert</p>
                        <p className="text-sm text-muted-foreground">Project Alpha has reached 85% of allocated budget</p>
                        <p className="text-xs text-muted-foreground">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t">
                  <Button variant="ghost" className="w-full text-sm">
                    View all notifications
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-muted">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs sm:text-sm">
                      {getUserInitials(displayUser.firstName, displayUser.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal p-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getUserInitials(displayUser.firstName, displayUser.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold leading-none">{displayUser.firstName} {displayUser.lastName}</p>
                        <p className="text-xs text-muted-foreground">{formatRole(displayUser.role)}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground px-1">{displayUser.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="p-3">
                  <User className="mr-3 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-3">
                  <Settings className="mr-3 h-4 w-4" />
                  <span>Preferences</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="p-3">
                    {theme === 'light' && <Sun className="mr-3 h-4 w-4" />}
                    {theme === 'dark' && <Moon className="mr-3 h-4 w-4" />}
                    {theme === 'system' && <Monitor className="mr-3 h-4 w-4" />}
                    <span>Theme</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => handleThemeChange('light')} className="p-3">
                      <Sun className="mr-3 h-4 w-4" />
                      <span>Light</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleThemeChange('dark')} className="p-3">
                      <Moon className="mr-3 h-4 w-4" />
                      <span>Dark</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleThemeChange('system')} className="p-3">
                      <Monitor className="mr-3 h-4 w-4" />
                      <span>System</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="p-3 text-destructive focus:text-destructive"
                  onClick={onLogout}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
