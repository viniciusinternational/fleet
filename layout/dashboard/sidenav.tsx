'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
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
  AreaChart,
  Bot,
  Package
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getNavigationForUser } from '@/lib/navigation';
import type { NavigationItem, User as UserType } from '@/types';
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
  AreaChart,
  Bot,
  Package
};

interface DashboardSidebarProps {
  user: UserType | null;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ user }) => {
  const pathname = usePathname();
  const router = useRouter();
  
  // Get navigation items based on user permissions
  const navigationItems = getNavigationForUser(user);
  
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
    return IconComponent ? <IconComponent className={className} aria-hidden="true" /> : null;
  };

  // Get user initials
  const getUserInitials = (firstName: string | undefined | null, lastName: string | undefined | null) => {
    if (!firstName && !lastName) return 'U';
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase().slice(0, 2) || 'U';
  };

  // Group navigation items by category
  const groupNavigationByCategory = (items: NavigationItem[]) => {
    const groups = {
      overview: items.filter(item => ['dashboard'].includes(item.id)),
      analytics: items.filter(item => ['analytics', 'reports'].includes(item.id)),
      operations: items.filter(item => ['vehicles', 'locations', 'owners', 'sources', 'delivery', 'tracking'].includes(item.id)),
      management: items.filter(item => ['users', 'audit-logs', 'settings'].includes(item.id)),
      tools: items.filter(item => ['chatbot'].includes(item.id))
    };

    return groups;
  };
  
  // Handle keyboard navigation for menu items
  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
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
            onKeyDown={(e) => handleKeyDown(e, () => toggleItem(item.id))}
            isActive={hasActiveChildItem}
            tooltip={item.label}
            role="button"
            aria-expanded={isOpen}
            aria-label={item.label}
            tabIndex={0}
          >
            {renderIcon(item.icon, "h-4 w-4")}
            <span className="font-medium text-sm">{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto h-5 px-2 text-xs">
                {item.badge}
              </Badge>
            )}
            {isOpen ? (
              <ChevronDown className="h-4 w-4 ml-auto" aria-hidden="true" />
            ) : (
              <ChevronRight className="h-4 w-4 ml-auto" aria-hidden="true" />
            )}
          </SidebarMenuButton>
          
          {isOpen && (
            <SidebarMenuSub>
              {item.children?.map((child) => {
                const isChildActive = isActive(child.href);
                return (
                  <SidebarMenuSubItem key={child.id}>
                    <SidebarMenuSubButton
                      onClick={() => child.href && router.push(child.href)}
                      onKeyDown={(e) => handleKeyDown(e, () => child.href && router.push(child.href))}
                      isActive={isChildActive}
                      role="link"
                      aria-current={isChildActive ? "page" : undefined}
                      aria-label={child.label}
                      tabIndex={0}
                    >
                      <Dot className="h-3.5 w-3.5" aria-hidden="true" />
                      {renderIcon(child.icon, "h-3.5 w-3.5")}
                      <span className="font-normal text-sm">{child.label}</span>
                      {child.badge && (
                        <Badge variant="secondary" className="ml-auto h-5 px-2 text-xs">
                          {child.badge}
                        </Badge>
                      )}
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                );
              })}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      );
    }
    
    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton
          onClick={() => item.href && router.push(item.href)}
          onKeyDown={(e) => handleKeyDown(e, () => item.href && router.push(item.href))}
          isActive={isItemActive}
          tooltip={item.label}
          role="link"
          aria-current={isItemActive ? "page" : undefined}
          aria-label={item.label}
          tabIndex={0}
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

  // Render grouped navigation
  const renderGroupedNavigation = () => {
    const groupedItems = groupNavigationByCategory(navigationItems);
    
    return (
      <>
        {groupedItems.overview.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-[0.08em] mb-3 px-2">
              Overview
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {groupedItems.overview.map(renderNavigationItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {groupedItems.operations.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-[0.08em] mb-3 px-2">
              Operations
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {groupedItems.operations.map(renderNavigationItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {groupedItems.management.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-[0.08em] mb-3 px-2">
              Management
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {groupedItems.management.map(renderNavigationItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {groupedItems.analytics.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-[0.08em] mb-3 px-2">
              Analytics & Reports
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {groupedItems.analytics.map(renderNavigationItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {groupedItems.tools.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-[0.08em] mb-3 px-2">
              Tools
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {groupedItems.tools.map(renderNavigationItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* If no grouped items, show flat navigation */}
        {navigationItems.length > 0 && 
         groupedItems.overview.length === 0 && 
         groupedItems.operations.length === 0 && 
         groupedItems.management.length === 0 && 
         groupedItems.analytics.length === 0 && 
         groupedItems.tools.length === 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-[0.08em] mb-3 px-2">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map(renderNavigationItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </>
    );
  };
  
  return (
    <Sidebar className="border-r border-sidebar-border/50 bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border/50 bg-sidebar px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-11 h-11 rounded-lg overflow-hidden">
            <Image
              src="/logo.png"
              alt="Logo"
              width={44}
              height={44}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-base font-semibold text-sidebar-foreground tracking-tight leading-tight">
              Fleet Management
            </h1>
            <p className="text-[11px] text-sidebar-foreground/60 font-medium tracking-wide mt-0.5">
              Vehicle Tracking System
            </p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-6 py-5">
        {/* User Info Badge */}
        {user && (
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium bg-sidebar-accent/50 text-sidebar-foreground/70 border border-sidebar-border/30">
              <span className="w-1.5 h-1.5 rounded-full bg-sidebar-primary"></span>
              {user.role} User
            </div>
            {navigationItems.length === 0 && (
              <p className="text-xs text-sidebar-foreground/50 mt-3 leading-relaxed">
                No navigation items available. Contact administrator for permissions.
              </p>
            )}
          </div>
        )}
        
        {/* Navigation */}
        {navigationItems.length > 0 ? renderGroupedNavigation() : (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="px-4 py-6 text-center text-sm text-sidebar-foreground/50">
                No accessible pages
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border/50 bg-sidebar px-6 py-5">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 ring-2 ring-sidebar-border/30">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
              {user ? getUserInitials(user.firstName, user.lastName) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate leading-tight">
              {user ? `${user.firstName} ${user.lastName}` : 'Current User'}
            </p>
            <p className="text-[11px] text-sidebar-foreground/60 truncate mt-0.5 leading-tight">
              {user?.email || 'user@vinisuite.com'}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
