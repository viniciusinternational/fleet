import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-10 w-10" />
            <div className="flex-1">
              <Skeleton className="h-9 w-48 mb-2" />
              <Skeleton className="h-5 w-64" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-28" />
            </div>
          </div>
        </div>

        {/* User Profile Header Skeleton */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Skeleton className="w-24 h-24 rounded-full" />
              
              <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div>
                    <Skeleton className="h-9 w-64 mb-2" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg w-full">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 flex-1" />
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="p-4">
                      <div className="text-center space-y-2">
                        <Skeleton className="h-8 w-16 mx-auto" />
                        <Skeleton className="h-4 w-24 mx-auto" />
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Card Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Skeleton className="h-12 w-12 mx-auto mb-4" />
                <Skeleton className="h-4 w-64 mx-auto mb-2" />
                <Skeleton className="h-4 w-48 mx-auto" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
