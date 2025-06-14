"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldAlert, Crown, Users, Search, UserCheck, UserX } from "lucide-react";
import Link from "next/link";
import { isAdmin } from "@/lib/utils/userUtils";
import { updateUserRole, getUserProfile, searchUser, getAllUsers } from "@/lib/services/userService";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/lib/types";

export default function AdminPage() {
  const { user, loading, refreshUserProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [searchEmail, setSearchEmail] = useState("");
  const [searchedUser, setSearchedUser] = useState<UserProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<'user' | 'moderator' | 'admin'>('user');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [debugUsers, setDebugUsers] = useState<UserProfile[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth?redirect=/admin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="max-w-lg mx-auto mt-10">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldAlert className="mr-2 h-6 w-6 text-destructive"/> 
            Authentication Required
          </CardTitle>
          <CardDescription>You need to be signed in to access this page.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/auth">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin(user)) {
    return (
      <Card className="max-w-2xl mx-auto mt-10">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crown className="mr-2 h-6 w-6 text-red-500"/> 
            Admin Access Required
          </CardTitle>
          <CardDescription>
            This page is restricted to administrators only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Current Access Level:</h3>
            <p className="text-sm text-muted-foreground">
              <strong>Role:</strong> {user.role || 'user'} <br/>
              <strong>Permissions:</strong> {user.permissions?.join(', ') || 'Basic user permissions'}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/events">Browse Events</Link>
            </Button>
            <Button asChild>
              <Link href="/qna">Join Discussions</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSearchUser = async () => {
    if (!searchEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address or user ID to search.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      console.log('Admin search - searching for:', searchEmail.trim());
      const searchResult = await searchUser(searchEmail.trim());
      console.log('Admin search - result:', searchResult);
      
      if (searchResult) {
        setSearchedUser(searchResult);
        setSelectedRole(searchResult.role || 'user');
        toast({
          title: "User Found",
          description: `Found user: ${searchResult.displayName || searchResult.email}`,
        });
      } else {
        setSearchedUser(null);
        toast({
          title: "User Not Found",
          description: `No user found with "${searchEmail.trim()}". Make sure the user has signed up and the email/UID is correct.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error searching user:', error);
      toast({
        title: "Search Error",
        description: `Failed to search for user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      setSearchedUser(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!searchedUser) {
      toast({
        title: "No User Selected",
        description: "Please search for a user first.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      await updateUserRole(searchedUser.uid, selectedRole);
      
      // Refresh the searched user data
      const updatedUser = await getUserProfile(searchedUser.uid);
      setSearchedUser(updatedUser);
      
      // If updating own role, refresh current user
      if (searchedUser.uid === user.uid) {
        await refreshUserProfile();
        toast({
          title: "Your Role Updated",
          description: `Your role has been updated to ${selectedRole}. The changes are now active.`,
        });
      } else {
        toast({
          title: "Role Updated Successfully",
          description: `${searchedUser.displayName || searchedUser.email}'s role has been updated to ${selectedRole}. They will need to refresh their browser or sign out and back in to see the changes.`,
        });
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Update Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderator': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleDebugUsers = async () => {
    try {
      const users = await getAllUsers();
      setDebugUsers(users);
      setShowDebug(true);
      toast({
        title: "Debug Info",
        description: `Found ${users.length} users in database. Check console for details.`,
      });
    } catch (error) {
      console.error('Error getting debug users:', error);
      toast({
        title: "Debug Error",
        description: "Failed to get user list.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="h-6 w-6 text-red-500" />
          <h1 className="text-3xl font-bold font-headline text-foreground">Admin Panel</h1>
        </div>
        <p className="text-muted-foreground">
          Manage user roles and permissions for the VIT community platform.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Current Admin Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Your Admin Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{user.displayName || user.email}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Badge className={getRoleBadgeColor(user.role || 'user')}>
                {user.role || 'user'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* User Role Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Manage User Roles
            </CardTitle>
            <CardDescription>
              Search for users and update their roles and permissions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search Section */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="search-email">User Email or UID</Label>
                  <Input
                    id="search-email"
                    type="text"
                    placeholder="Enter email address or user ID..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSearchUser} disabled={isSearching}>
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    Search
                  </Button>
                </div>
              </div>

              {/* Search Results */}
              {searchedUser && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-medium">{searchedUser.displayName || 'No display name'}</p>
                        <p className="text-sm text-muted-foreground">{searchedUser.email}</p>
                        <p className="text-xs text-muted-foreground">UID: {searchedUser.uid}</p>
                      </div>
                      <Badge className={getRoleBadgeColor(searchedUser.role || 'user')}>
                        {searchedUser.role || 'user'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="role-select">Update Role</Label>
                        <Select value={selectedRole} onValueChange={(value: 'user' | 'moderator' | 'admin') => setSelectedRole(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button 
                        onClick={handleUpdateRole} 
                        disabled={isUpdating || selectedRole === searchedUser.role}
                        className="w-full"
                      >
                        {isUpdating ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Update Role to {selectedRole}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Role Permissions:</h3>
              <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <div><strong>User:</strong> Can read forums, create questions, and vote</div>
                <div><strong>Moderator:</strong> User permissions + can create and manage events</div>
                <div><strong>Admin:</strong> All permissions + can manage users and moderate forums</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Debug Tools
            </CardTitle>
            <CardDescription>
              Troubleshooting tools to help identify user search issues.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleDebugUsers} variant="outline">
              List All Users in Database
            </Button>
            
            {showDebug && debugUsers.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Users in Database ({debugUsers.length}):</h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {debugUsers.map((user) => (
                    <div key={user.uid} className="p-3 bg-muted/50 rounded-lg text-sm">
                      <div><strong>Email:</strong> {user.email}</div>
                      <div><strong>Name:</strong> {user.displayName || 'No name'}</div>
                      <div><strong>UID:</strong> {user.uid}</div>
                      <div><strong>Role:</strong> {user.role || 'user'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 