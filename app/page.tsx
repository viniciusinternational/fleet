'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { getRedirectPathForUser } from '@/lib/routes';
import Login from '@/app/auth/login/page';
import { Loader2 } from 'lucide-react';

export default function Page() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth, hasHydrated } = useAuthStore();

  useEffect(() => {
    const handleAuthCheck = async () => {
      await checkAuth();
    };

    handleAuthCheck();
  }, [checkAuth]);

  useEffect(() => {
    // Wait for hydration before redirecting
    if (!hasHydrated) {
      return;
    }

    if (isAuthenticated && user) {
      // Route based on user permissions
      const redirectPath = getRedirectPathForUser(user);
      router.push(redirectPath);
    } else if (isAuthenticated === false) {
      // User is not authenticated, stay on login page
      // The Login component will be rendered below
    }
  }, [hasHydrated, isAuthenticated, user, router]);

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
