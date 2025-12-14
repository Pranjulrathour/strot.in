import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { logRoleChange } from "@/lib/audit-log";
import { 
  Users, Search, Shield, Building2, Heart, UserCheck,
  MoreVertical, Edit
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  locality: string | null;
  created_at: string;
}

async function fetchUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, name, phone, role, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }
  
  // Map data to include locality as null since profiles table may not have it
  return (data ?? []).map(user => ({
    ...user,
    locality: null,
  }));
}

export default function UsersManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: fetchUsers,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { data: authData } = await supabase.auth.getUser();

      // Get current role for logging
      const { data: currentUser } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      const oldRole = currentUser?.role || "UNKNOWN";

      // Update role in profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId);

      if (profileError) throw new Error(profileError.message);

      // If promoting to MASTER_ADMIN, create master_admins entry
      if (role === "MASTER_ADMIN" || role === "SUPER_ADMIN") {
        // Check if already exists
        const { data: existing } = await supabase
          .from("master_admins")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (!existing) {
          const { error: adminError } = await supabase
            .from("master_admins")
            .insert({
              id: userId,
              user_id: userId,
              city: city || "Mumbai",
              state: state || "Maharashtra",
              assigned_by: authData.user?.id,
              permissions: {
                can_create_ch: true,
                can_remove_ch: true,
                can_view_csr: true,
                can_create_admin: role === "SUPER_ADMIN",
              },
              is_active: true,
            });

          if (adminError) throw new Error(adminError.message);
        }
      }

      // Log the role change
      await logRoleChange(userId, oldRole, role, authData.user?.id || "");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User role updated successfully" });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      setNewRole("");
      setCity("");
      setState("");
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update role", description: error.message, variant: "destructive" });
    },
  });

  const filteredUsers = users?.filter((user) => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <Badge className="bg-purple-500">Super Admin</Badge>;
      case "MASTER_ADMIN":
        return <Badge className="bg-violet-500">Master Admin</Badge>;
      case "MAIN_ADMIN":
        return <Badge className="bg-blue-500">Main Admin</Badge>;
      case "COMMUNITY_HEAD":
        return <Badge className="bg-emerald-500">Community Head</Badge>;
      case "BUSINESS":
        return <Badge className="bg-amber-500">Business</Badge>;
      case "DONOR":
        return <Badge className="bg-rose-500">Donor</Badge>;
      default:
        return <Badge variant="secondary">User</Badge>;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
      case "MASTER_ADMIN":
        return Shield;
      case "COMMUNITY_HEAD":
        return UserCheck;
      case "BUSINESS":
        return Building2;
      default:
        return Heart;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-1">View and manage all registered users</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
            <SelectItem value="MASTER_ADMIN">Master Admin</SelectItem>
            <SelectItem value="MAIN_ADMIN">Main Admin</SelectItem>
            <SelectItem value="COMMUNITY_HEAD">Community Head</SelectItem>
            <SelectItem value="BUSINESS">Business</SelectItem>
            <SelectItem value="DONOR">Donor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users
            <Badge variant="secondary" className="ml-2">{filteredUsers?.length ?? 0} users</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers?.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers?.map((user) => {
                const RoleIcon = getRoleIcon(user.role);
                
                return (
                  <div key={user.id} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <RoleIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{user.name}</h3>
                        {getRoleBadge(user.role)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="truncate">{user.email}</span>
                        <span>{user.phone}</span>
                        {user.locality && <span>• {user.locality}</span>}
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>Joined {new Date(user.created_at).toLocaleDateString()}</div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedUser(user);
                            setNewRole(user.role);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Change Role
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedUser?.name} ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="role">New Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DONOR">Donor</SelectItem>
                  <SelectItem value="BUSINESS">Business</SelectItem>
                  <SelectItem value="COMMUNITY_HEAD">Community Head</SelectItem>
                  <SelectItem value="MAIN_ADMIN">Main Admin</SelectItem>
                  <SelectItem value="MASTER_ADMIN">Master Admin</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(newRole === "MASTER_ADMIN" || newRole === "SUPER_ADMIN") && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g., Mumbai"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g., Maharashtra"
                      className="mt-2"
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {newRole === "SUPER_ADMIN" 
                    ? "Super Admin will have full system access including creating other admins."
                    : "Master Admin will be able to manage Community Heads in their city."}
                </p>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => selectedUser && updateRoleMutation.mutate({ userId: selectedUser.id, role: newRole })}
              disabled={!newRole || ((newRole === "MASTER_ADMIN" || newRole === "SUPER_ADMIN") && !city)}
            >
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
