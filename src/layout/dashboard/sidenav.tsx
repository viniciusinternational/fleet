'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard,
  Users,
  Building2,
  FolderOpen,
  UserCheck,
  Settings,
  BarChart3,
  CreditCard,
  FileText,
  CheckCircle,
  DollarSign,
  Calendar,
  FolderCheck,
  ShoppingCart,
  CheckSquare,
  Star,
  UserPlus,
  User,
  Clock,
  ChevronDown,
  ChevronRight,
  Dot,
  Car,
  Map,
  MapPin,
  Target,
  TrendingUp,
  Globe,
  Activity,
  Award,
  Crown,
  Lightbulb,
  Zap,
  PieChart,
  LineChart,
  AreaChart
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getNavigationForRole } from '@/lib/navigation';
import type { NavigationItem, Role, User as UserType } from '@/types';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';

// Icon mapping for dynamic icon rendering
const iconMap = {
  LayoutDashboard,
  Users,
  Building2,
  FolderOpen,
  UserCheck,
  Settings,
  BarChart3,
  CreditCard,
  FileText,
  CheckCircle,
  DollarSign,
  Calendar,
  FolderCheck,
  ShoppingCart,
  CheckSquare,
  Star,
  UserPlus,
  User,
  Clock,
  Car,
  Map,
  MapPin,
  Target,
  TrendingUp,
  Globe,
  Activity,
  Award,
  Crown,
  Lightbulb,
  Zap,
  PieChart,
  LineChart,
  AreaChart
};

interface DashboardSidebarProps {
  userRole: Role;
  user: UserType | null;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ userRole, user }) => {
  const pathname = usePathname();
  const router = useRouter();
  
  // Determine the effective role based on the current route
  const getEffectiveRole = (): Role => {
    const path = pathname;
    if (path.startsWith('/admin/')) return 'Admin';
    if (path.startsWith('/ceo/')) return 'CEO';
    if (path.startsWith('/normal/')) return 'Normal';
    return userRole; // fallback to user's role
  };
  
  const effectiveRole = getEffectiveRole();
  
  // Get navigation items for current user role
  const navigationItems = getNavigationForRole(effectiveRole);
  
  // Track which menu items are open
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  
  // Check if current path matches navigation item
  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };
  
  // Check if any child is active
  const hasActiveChild = (children?: NavigationItem[]) => {
    if (!children) return false;
    return children.some(child => isActive(child.href));
  };
  
  // Toggle submenu open/closed
  const toggleItem = (itemId: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(itemId)) {
      newOpenItems.delete(itemId);
    } else {
      newOpenItems.add(itemId);
    }
    setOpenItems(newOpenItems);
  };
  
  // Render navigation icon
  const renderIcon = (iconName: string, className = "h-5 w-5") => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent ? <IconComponent className={className} /> : null;
  };

  // Get user initials
  const getUserInitials = (name: string | undefined | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Group CEO navigation items by category
  const groupCEONavigation = (items: NavigationItem[]) => {
    if (effectiveRole !== 'CEO') return items;

    // Simple grouping for basic analytics
    const groups = {
      overview: items.filter(item => ['ceo-dashboard'].includes(item.id)),
      operations: items.filter(item => ['ceo-vehicles', 'ceo-locations'].includes(item.id)),
      financial: items.filter(item => ['ceo-financial'].includes(item.id))
    };

    return groups;
  };
  
  // Render navigation item
  const renderNavigationItem = (item: NavigationItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isItemActive = isActive(item.href);
    const hasActiveChildItem = hasActiveChild(item.children);
    const isOpen = openItems.has(item.id) || hasActiveChildItem;
    
    if (hasChildren) {
      return (
        <SidebarMenuItem key={item.id}>
          <SidebarMenuButton
            onClick={() => toggleItem(item.id)}
            isActive={hasActiveChildItem}
            tooltip={item.label}
          >
            {renderIcon(item.icon, "h-4 w-4")}
            <span>{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto h-5 px-2 text-xs">
                {item.badge}
              </Badge>
            )}
            {isOpen ? (
              <ChevronDown className="h-4 w-4 ml-auto" />
            ) : (
              <ChevronRight className="h-4 w-4 ml-auto" />
            )}
          </SidebarMenuButton>
          
          {isOpen && (
            <SidebarMenuSub>
              {item.children?.map((child) => (
                <SidebarMenuSubItem key={child.id}>
                  <SidebarMenuSubButton
                    onClick={() => child.href && router.push(child.href)}
                    isActive={isActive(child.href)}
                  >
                    <Dot className="h-4 w-4" />
                    {renderIcon(child.icon, "h-4 w-4")}
                    <span>{child.label}</span>
                    {child.badge && (
                      <Badge variant="secondary" className="ml-auto h-5 px-2 text-xs">
                        {child.badge}
                      </Badge>
                    )}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      );
    }
    
    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton
          onClick={() => item.href && router.push(item.href)}
          isActive={isItemActive}
          tooltip={item.label}
        >
          {renderIcon(item.icon, "h-4 w-4")}
          <span>{item.label}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-auto h-5 px-2 text-xs">
              {item.badge}
            </Badge>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  // Render CEO grouped navigation
  const renderCEONavigation = () => {
    const groupedItems = groupCEONavigation(navigationItems) as {
      overview: NavigationItem[];
      operations: NavigationItem[];
      financial: NavigationItem[];
    };
    
    return (
      <>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Overview
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {groupedItems.overview.map(renderNavigationItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Operations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {groupedItems.operations.map(renderNavigationItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Financial
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {groupedItems.financial.map(renderNavigationItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Basic Stats for CEO */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Quick Stats
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total Vehicles</span>
                <span className="text-sm font-medium">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total Import Duty</span>
                <span className="text-sm font-medium text-green-600">₦125,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Active Locations</span>
                <span className="text-sm font-medium text-blue-600">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Avg Delivery</span>
                <span className="text-sm font-medium text-orange-600">45 days</span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </>
    );
  };

  // Render standard navigation for other roles
  const renderStandardNavigation = () => {
    if (effectiveRole === 'Normal') {
      return (
        <>
          <SidebarGroup>
        
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                VEHICLE OPERATIONS
                </SidebarGroupLabel>
                {navigationItems.map(renderNavigationItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          
          {/* Quick Stats for Normal Users */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Quick Stats
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total Vehicles</span>
                  <span className="text-sm font-medium">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">In Transit</span>
                  <span className="text-sm font-medium text-orange-600">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Delivered Today</span>
                  <span className="text-sm font-medium text-green-600">3</span>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </>
      );
    }

    return (
      <SidebarGroup>
        <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Navigation
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {navigationItems.map(renderNavigationItem)}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };
  
  return (
    <Sidebar className="border-r bg-background">
      <SidebarHeader className="border-b bg-card">
        <div className="flex items-center space-x-3 p-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
            {effectiveRole === 'CEO' ? (
              <Crown className="h-5 w-5 text-primary-foreground" />
            ) : effectiveRole === 'Normal' ? (
              <Car className="h-5 w-5 text-primary-foreground" />
            ) : (
              <Building2 className="h-5 w-5 text-primary-foreground" />
            )}
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {effectiveRole === 'CEO' ? 'Executive' : effectiveRole === 'Normal' ? 'Vehicle Tracker' : 'Admin Panel'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {effectiveRole === 'CEO' ? 'Strategic Platform' : effectiveRole === 'Normal' ? 'Operational Tracking' : 'System Management'}
            </p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        {/* Role Badge */}
        <div className="mb-6">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
            {effectiveRole === 'Normal' ? 'Operational Staff' : `${effectiveRole} Role`}
          </div>
          {effectiveRole === 'Normal' && (
            <p className="text-xs text-muted-foreground mt-2">
              Location-based access • Read-only permissions
            </p>
          )}
        </div>
        
        {/* Navigation */}
        {effectiveRole === 'CEO' ? renderCEONavigation() : renderStandardNavigation()}
      </SidebarContent>
      
      <SidebarFooter className="border-t bg-card p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
              {user ? getUserInitials(user.fullname) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.fullname || 'Current User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || 'user@vinisuite.com'}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
