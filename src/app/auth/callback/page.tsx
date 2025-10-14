'use client';
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import type { User } from "@/types";
import { Role } from "@/types";

function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const { setToken, setAuthenticated, setUser } = useAuthStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setIsLoading(true);
        
        // Get parameters from URL
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refresh_token');
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Handle error from auth provider
        if (errorParam) {
          setError(errorDescription || errorParam);
          setIsLoading(false);
          return;
        }

        // Check if token exists
        if (!token) {
          setError('No authentication token received');
          setIsLoading(false);
          return;
        }

        // decode token and get user object
        const decodedUser: any = jwtDecode(token);

        console.log({decodedUser});
        // Fetch user from API using email
        const response = await fetch(`/api/users/by-email?email=${encodeURIComponent(decodedUser.email)}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('User not found. Please contact your administrator to set up your account.');
            setIsLoading(false);
            return;
          }
          throw new Error('Failed to fetch user data');
        }
        
        const user: User = await response.json();

        console.log({user});
        // Set tokens in store
        setToken(token, refreshToken || '');
        setAuthenticated(true);
        setUser(user);
        setSuccess(true);
        
        // Redirect based on user role after a short delay
        setTimeout(() => {
          switch (user.role) {
            case Role.ADMIN:
            case Role.CEO:
              router.push('/admin/dashboard');
              break;
            case Role.NORMAL:
              router.push('/normal/dashboard');
              break;
            default:
              // Unknown role, redirect to home page (which will handle auth check)
            //   router.push('/');
              break;
          }
        }, 1500);

      } catch (err) {
        console.error('Auth callback error:', err);
        setError('An unexpected error occurred during authentication');
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [searchParams, setToken, setAuthenticated, router, setUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <CardTitle>Authenticating...</CardTitle>
            <CardDescription>
              Please wait while we complete your authentication
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    const isUserNotFound = error.includes('User not found');
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive">
              {isUserNotFound ? 'Account Not Found' : 'Authentication Failed'}
            </CardTitle>
            <CardDescription className="text-destructive/80">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            {isUserNotFound && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Your email address is not registered in our system.
                </p>
                <p className="text-sm text-muted-foreground">
                  Please contact your system administrator to:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Create your account</li>
                  <li>• Verify your email address</li>
                  <li>• Set up your user permissions</li>
                </ul>
              </div>
            )}
            <div className="flex flex-col space-y-2">
              <Button 
                onClick={() => router.push('/auth/login')}
                className="w-full"
                size="lg"
                variant={isUserNotFound ? "outline" : "default"}
              >
                {isUserNotFound ? 'Back to Login' : 'Try Again'}
              </Button>
              {isUserNotFound && (
                <Button 
                  onClick={() => window.location.href = 'mailto:admin@vinifleet.com?subject=Account Access Request'}
                  className="w-full"
                  size="lg"
                  variant="secondary"
                >
                  Contact Administrator
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Authentication Successful</CardTitle>
            <CardDescription>
              Redirecting you to your dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return null;
}

export default AuthCallbackPage;