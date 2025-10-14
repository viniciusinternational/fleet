'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Role } from '@/types';
import Login from '@/app/auth/login/page';
import { Loader2 } from 'lucide-react';

export default function Page() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    const handleAuthCheck = async () => {
      await checkAuth();
    };

    handleAuthCheck();
  }, [checkAuth]);

  useEffect(() => {
    console.log({isAuthenticated, user});
    if (isAuthenticated && user) {
      console.log(user);
      // Route based on user role
      switch (user.role) {
        case Role.ADMIN:
        case Role.CEO:
          router.push('/admin/dashboard');
          break;
        case Role.NORMAL:
          router.push('/normal/dashboard');
          break;
        default:
          // Unknown role, redirect to login
          // router.push('/auth/login');
          break;
      }
    } else if (isAuthenticated === false) {
      // User is not authenticated, stay on login page
      // The Login component will be rendered below
    }
  }, [isAuthenticated, user, router]);

  // Show loading spinner while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login page
  if (isAuthenticated === false) {
    return <Login />;
  }

  // If authenticated but still loading (shouldn't happen), show loading
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
