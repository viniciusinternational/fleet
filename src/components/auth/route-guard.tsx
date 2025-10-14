'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Role } from '@/types';
import { Loader2, ShieldX } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ROUTE_CONFIGS, 
  getRedirectPathForRole, 
  isAuthRequiredForPath, 
  checkRoleAccess 
} from '@/lib/routes';

interface RouteGuardProps {
  children: React.ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const handleAuthCheck = async () => {
      try {
        setIsChecking(true);
        await checkAuth();
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsChecking(false);
      }
    };

    handleAuthCheck();
  }, [checkAuth]);

  useEffect(() => {
    if (isChecking) return;

    // Check if current path requires authentication
    const isAuthRequired = isAuthRequiredForPath(pathname);
    
    // If auth is required but user is not authenticated
    // if (isAuthRequired && !isAuthenticated) {
    //   router.push('/auth/login');
    //   return;
    // }

    // If user is authenticated, check role-based access
    if (isAuthenticated && user) {
      const hasAccess = checkRoleAccess(pathname, user.role);
      setIsAuthorized(hasAccess);
      
      if (!hasAccess) {
        // Redirect to appropriate dashboard based on user role
        const redirectPath = getRedirectPathForRole(user.role);
        router.push(redirectPath);
        return;
      }
    } else if (!isAuthRequired) {
      // Public routes don't need authorization
      setIsAuthorized(true);
    }
  }, [isChecking, isAuthenticated, user, pathname, router]);

  // Show loading spinner while checking authentication or before mount
  if (!isMounted || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <CardTitle>Checking Access</CardTitle>
            <CardDescription>
              Verifying your permissions...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Show unauthorized access message
  if (isAuthenticated && user && !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <ShieldX className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => router.push(getRedirectPathForRole(user.role))}
              className="w-full"
              size="lg"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render children if authorized or if it's a public route
  return <>{children}</>;
}
