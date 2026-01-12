'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Users, 
  User, 
  MapPin, 
  Shield, 
  Building2, 
  FileText, 
  Mail,
  Phone,
  Calendar,
  Globe,
  Lock,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Activity,
  Clock,

  Building,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Globe as GlobeIcon,
  Settings,
  Bell,
  Languages,
  Clock as ClockIcon,
  UserCheck,
  UserX,
  Shield as ShieldIcon,
  Crown,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Role, LocationType } from '@/types';
import type { User as UserType, PermissionKey } from '@/types';
import { useAuthStore } from '@/store/auth';
import { hasPermission } from '@/lib/permissions';
import { getRoleBadgeClass, getStatusBadgeClass } from '@/lib/utils/user-colors';

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data from API
  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/users/${id}`, {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('User not found');
          }
          throw new Error('Failed to fetch user');
        }
        
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch user');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-4">Loading User...</h2>
          <p className="text-muted-foreground">Please wait while we fetch user details.</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">User Not Found</h2>
          <p className="text-muted-foreground mb-6">
            {error || "The user you're looking for doesn't exist."}
          </p>
          <Button onClick={() => router.push('/users')}>
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'Admin':
        return <Shield className="h-4 w-4" />;
      case 'CEO':
        return <Crown className="h-4 w-4" />;
      case 'Normal':
        return <UserCheck className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive 
      ? <CheckCircle className="h-4 w-4" /> 
      : <XCircle className="h-4 w-4" />;
  };

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const openDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      console.log('User deleted:', user.id);
      router.push('/users');
    } catch (error) {
      console.error('Failed to delete user:', error);
      // TODO: Show error toast/notification
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/users')}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
              <p className="text-muted-foreground mt-2">View and manage user information</p>
            </div>
            <div className="flex items-center gap-3">
              {currentUser && hasPermission(currentUser, 'edit_users') && (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/users/${user.id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit User
                </Button>
              )}
              {currentUser && hasPermission(currentUser, 'delete_users') && (
                <Button
                  variant="destructive"
                  onClick={openDeleteDialog}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete User
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* User Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div>
                    <h2 className="text-3xl font-bold">{user.firstName} {user.lastName}</h2>
                    <p className="text-xl text-muted-foreground mt-1">{user.email}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={`${getRoleBadgeClass(user.role)} text-lg px-3 py-2`}>
                      {getRoleIcon(user.role)}
                      <span className="ml-2">{user.role}</span>
                    </Badge>
                    
                    <Badge variant="outline" className={`${getStatusBadgeClass(user.isActive)} text-lg px-3 py-2`}>
                      {getStatusIcon(user.isActive)}
                      <span className="ml-2">{user.isActive ? 'Active' : 'Inactive'}</span>
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{user.location.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Member since {formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">First Name</label>
                      <p className="text-sm">{user.firstName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                      <p className="text-sm">{user.lastName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-sm">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="text-sm">{user.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Role</label>
                      <Badge variant="outline" className={`${getRoleBadgeClass(user.role)} text-xs px-2 py-1`}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1">{user.role}</span>
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <Badge variant="outline" className={`${getStatusBadgeClass(user.isActive)} text-xs px-2 py-1`}>
                        {getStatusIcon(user.isActive)}
                        <span className="ml-1">{user.isActive ? 'Active' : 'Inactive'}</span>
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Created</label>
                      <p className="text-sm">{formatDate(user.createdAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Account Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Card className="border bg-card">
                      <CardContent className="p-6 text-center">
                        <div className="text-2xl font-bold text-foreground mb-2">
                          {user.lastLogin ? 'Yes' : 'No'}
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">Has Logged In</div>
                      </CardContent>
                    </Card>
                    <Card className="border bg-card">
                      <CardContent className="p-6 text-center">
                        <div className="text-2xl font-bold text-primary mb-2">
                          {user.isActive ? 'Active' : 'Inactive'}
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">Account Status</div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {user.lastLogin && (
                    <Card className="border bg-muted/50">
                      <CardContent className="p-6 text-center">
                        <div className="text-sm text-muted-foreground mb-2">Last Login</div>
                        <div className="text-lg font-semibold text-foreground">
                          {formatDateTime(user.lastLogin)}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Additional user information will be displayed here</p>
                  <p className="text-sm">This could include department, position, employee ID, etc.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Assigned Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Location Name</label>
                      <p className="text-lg font-semibold">{user.location.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Location Type</label>
                      <Badge variant="outline" className="text-sm px-2 py-1">
                        <Building className="h-3 w-3 mr-1" />
                        {user.location.type}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <Badge variant="outline" className={`text-sm px-2 py-1 ${user.location.status === 'Operational' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                        {user.location.status === 'Operational' ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        )}
                        {user.location.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Address</label>
                      <p className="text-sm">
                        {user.location.address.street}<br />
                        {user.location.address.city}, {user.location.address.state}<br />
                        {user.location.address.country} {user.location.address.postalCode}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Coordinates</label>
                      <p className="text-sm">
                        {user.location.coordinates.latitude.toFixed(6)}, {user.location.coordinates.longitude.toFixed(6)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                      <p className="text-sm">{formatDate(new Date(user.location.lastUpdated))}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Contact Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.location.contactDetails.contactName && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{user.location.contactDetails.contactName}</span>
                      </div>
                    )}
                    {user.location.contactDetails.phone && (
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{user.location.contactDetails.phone}</span>
                      </div>
                    )}
                    {user.location.contactDetails.email && (
                      <div className="flex items-center gap-2">
                        <MailIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{user.location.contactDetails.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {user.location.notes && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Notes</label>
                      <p className="text-sm mt-2">{user.location.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  User Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>User activity history will be displayed here</p>
                  <p className="text-sm">This could include login history, actions performed, etc.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  User Permissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.permissions ? (() => {
                  // Group permissions by module
                  const grouped: Record<string, Array<{ key: PermissionKey; action: string }>> = {};
                  
                  Object.entries(user.permissions).forEach(([key, value]) => {
                    if (value === true) {
                      const [, module] = key.split('_');
                      const action = key.split('_')[0];
                      
                      if (!grouped[module]) {
                        grouped[module] = [];
                      }
                      grouped[module].push({ key: key as PermissionKey, action });
                    }
                  });

                  const moduleNames = Object.keys(grouped);
                  
                  if (moduleNames.length > 0) {
                    return (
                      <div className="space-y-6">
                        {moduleNames.map((module) => (
                          <div key={module} className="space-y-3">
                            <h4 className="font-semibold text-foreground capitalize">{module}</h4>
                            <div className="flex flex-wrap gap-2">
                              {grouped[module].map(({ key, action }) => (
                                <Badge key={key} variant="outline" className="bg-primary/10 text-primary border-primary/20 capitalize">
                                  {action}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  } else {
                    return (
                      <p className="text-muted-foreground text-center py-8">
                        No permissions assigned to this user.
                      </p>
                    );
                  }
                })() : (
                  <p className="text-muted-foreground text-center py-8">
                    No permissions assigned to this user.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  User Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>User preferences and settings will be displayed here</p>
                  <p className="text-sm">This could include notification preferences, language settings, etc.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-foreground">Are you sure you want to delete this user? This action cannot be undone.</p>
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Warning:</span>
                </div>
                <p className="text-sm text-destructive/90 mt-1">
                  Deleting this user will remove all associated data and access permissions.
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteUser}
              >
                Delete User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UserDetail;
