import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { logMasterAdminAction, logRoleChange } from "@/lib/audit-log";
import { 
  Shield, UserPlus, MapPin, Calendar, Settings, 
  MoreVertical, Check, X, Activity, Users, TrendingUp
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MasterAdmin {
  id: string;
  user_id: string;
  city: string;
  state: string | null;
  is_active: boolean;
  permissions: {
    can_create_ch: boolean;
    can_remove_ch: boolean;
    can_view_csr: boolean;
    can_create_admin: boolean;
  };
  created_at: string;
  profile?: {
    name: string;
    email: string;
    phone: string;
  };
  stats?: {
    total_chs: number;
    active_chs: number;
    pending_chs: number;
  };
}

async function fetchMasterAdmins(): Promise<MasterAdmin[]> {
  // First, fetch master admins
  const { data, error } = await supabase
    .from("master_admins")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching master admins:", error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Fetch profiles separately for each admin
  const adminsWithProfiles = await Promise.all(
    data.map(async (admin) => {
      // Get profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("name, email, phone")
        .eq("id", admin.user_id)
        .maybeSingle();

      // Get CH stats
      const { count: totalCHs } = await supabase
        .from("community_heads")
        .select("*", { count: "exact", head: true })
        .eq("approved_by", admin.id);

      const { count: activeCHs } = await supabase
        .from("community_heads")
        .select("*", { count: "exact", head: true })
        .eq("approved_by", admin.id)
        .eq("status", "active");

      const { count: pendingCHs } = await supabase
        .from("community_heads")
        .select("*", { count: "exact", head: true })
        .eq("approved_by", admin.id)
        .eq("status", "pending");

      return {
        ...admin,
        profile: profileData || { name: "Unknown", email: "", phone: "" },
        stats: {
          total_chs: totalCHs ?? 0,
          active_chs: activeCHs ?? 0,
          pending_chs: pendingCHs ?? 0,
        },
      };
    })
  );

  return adminsWithProfiles;
}

async function fetchAvailableUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, name, role")
    .in("role", ["DONOR", "BUSINESS", "COMMUNITY_HEAD", "MAIN_ADMIN"])
    .order("name");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export default function SuperAdminMasterAdmins() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<MasterAdmin | null>(null);
  const [isEditPermissionsOpen, setIsEditPermissionsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newAdmin, setNewAdmin] = useState({
    userId: "",
    city: "",
    state: "",
    can_create_ch: true,
    can_remove_ch: true,
    can_view_csr: true,
    can_create_admin: false,
  });
  const [editPermissions, setEditPermissions] = useState({
    can_create_ch: true,
    can_remove_ch: true,
    can_view_csr: true,
    can_create_admin: false,
  });

  const { data: admins, isLoading } = useQuery({
    queryKey: ["/api/super-admin/master-admins"],
    queryFn: fetchMasterAdmins,
  });

  const { data: availableUsers } = useQuery({
    queryKey: ["/api/super-admin/available-users"],
    queryFn: fetchAvailableUsers,
  });

  const createMasterAdminMutation = useMutation({
    mutationFn: async (data: typeof newAdmin) => {
      const { data: authData } = await supabase.auth.getUser();

      // Get current user info for logging
      const { data: targetUser } = await supabase
        .from("profiles")
        .select("name, role")
        .eq("id", data.userId)
        .maybeSingle();

      const oldRole = targetUser?.role || "UNKNOWN";

      // Update user role
      const { error: roleError } = await supabase
        .from("profiles")
        .update({ role: "MASTER_ADMIN" })
        .eq("id", data.userId);

      if (roleError) throw new Error(roleError.message);

      // Create Master Admin entry
      const { error } = await supabase.from("master_admins").insert({
        id: data.userId,
        user_id: data.userId,
        city: data.city,
        state: data.state,
        assigned_by: authData.user?.id,
        permissions: {
          can_create_ch: data.can_create_ch,
          can_remove_ch: data.can_remove_ch,
          can_view_csr: data.can_view_csr,
          can_create_admin: data.can_create_admin,
        },
        is_active: true,
      });

      if (error) throw new Error(error.message);

      // Log the actions
      await logRoleChange(data.userId, oldRole, "MASTER_ADMIN", authData.user?.id || "");
      await logMasterAdminAction("master_admin_created", data.userId, targetUser?.name || "Unknown", {
        city: data.city,
        state: data.state,
        permissions: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/master-admins"] });
      toast({ title: "Master Admin created successfully" });
      setIsAddDialogOpen(false);
      setNewAdmin({
        userId: "",
        city: "",
        state: "",
        can_create_ch: true,
        can_remove_ch: true,
        can_view_csr: true,
        can_create_admin: false,
      });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create Master Admin", description: error.message, variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ adminId, isActive }: { adminId: string; isActive: boolean }) => {
      // Get admin info for logging
      const { data: adminData } = await supabase
        .from("master_admins")
        .select("user_id")
        .eq("id", adminId)
        .maybeSingle();

      let adminName = "Unknown";
      if (adminData?.user_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", adminData.user_id)
          .maybeSingle();
        adminName = profile?.name || "Unknown";
      }

      const { error } = await supabase
        .from("master_admins")
        .update({ is_active: isActive })
        .eq("id", adminId);
      if (error) throw new Error(error.message);

      // If deactivating, also suspend all their CHs
      if (!isActive) {
        await supabase
          .from("community_heads")
          .update({ 
            is_suspended: true, 
            suspension_reason: "Master Admin deactivated" 
          })
          .eq("approved_by", adminId);
      }

      // Log the action
      await logMasterAdminAction(
        isActive ? "master_admin_updated" : "master_admin_deactivated",
        adminId,
        adminName,
        { is_active: isActive }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/master-admins"] });
      toast({ title: "Master Admin status updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update status", description: error.message, variant: "destructive" });
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ adminId, permissions }: { adminId: string; permissions: typeof editPermissions }) => {
      const { error } = await supabase
        .from("master_admins")
        .update({ permissions })
        .eq("id", adminId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/master-admins"] });
      toast({ title: "Permissions updated successfully" });
      setIsEditPermissionsOpen(false);
      setSelectedAdmin(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update permissions", description: error.message, variant: "destructive" });
    },
  });

  const filteredAdmins = admins?.filter((admin) => {
    const matchesSearch = 
      admin.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.state?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-violet-500" />
            Master Admin Management
          </h1>
          <p className="text-muted-foreground mt-1">Create and manage city-level administrators</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Master Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Master Admin</DialogTitle>
              <DialogDescription>Promote a user to Master Admin with city assignment</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="user">Select User</Label>
                <Select value={newAdmin.userId} onValueChange={(v) => setNewAdmin({ ...newAdmin, userId: v })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={newAdmin.city}
                    onChange={(e) => setNewAdmin({ ...newAdmin, city: e.target.value })}
                    placeholder="Mumbai"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={newAdmin.state}
                    onChange={(e) => setNewAdmin({ ...newAdmin, state: e.target.value })}
                    placeholder="Maharashtra"
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Create Community Heads</span>
                    <Switch
                      checked={newAdmin.can_create_ch}
                      onCheckedChange={(v) => setNewAdmin({ ...newAdmin, can_create_ch: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Remove Community Heads</span>
                    <Switch
                      checked={newAdmin.can_remove_ch}
                      onCheckedChange={(v) => setNewAdmin({ ...newAdmin, can_remove_ch: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">View CSR Funds</span>
                    <Switch
                      checked={newAdmin.can_view_csr}
                      onCheckedChange={(v) => setNewAdmin({ ...newAdmin, can_view_csr: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Create Other Admins (Super Admin only)</span>
                    <Switch
                      checked={newAdmin.can_create_admin}
                      onCheckedChange={(v) => setNewAdmin({ ...newAdmin, can_create_admin: v })}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={() => createMasterAdminMutation.mutate(newAdmin)}
                disabled={!newAdmin.userId || !newAdmin.city}
              >
                Create Master Admin
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Input
          placeholder="Search by name, email, city, or state..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid gap-4">
        {filteredAdmins?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No Master Admins</p>
              <p className="text-sm text-muted-foreground">Create your first city administrator</p>
            </CardContent>
          </Card>
        ) : (
          filteredAdmins?.map((admin) => (
            <Card key={admin.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-full bg-violet-500/10 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-violet-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{admin.profile?.name || "Unknown"}</h3>
                        {admin.is_active ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{admin.profile?.email}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {admin.city}{admin.state ? `, ${admin.state}` : ""}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Since {new Date(admin.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {admin.stats?.total_chs ?? 0} CHs managed
                        </span>
                        <span className="flex items-center gap-1 text-green-600">
                          <TrendingUp className="h-3 w-3" />
                          {admin.stats?.active_chs ?? 0} active
                        </span>
                        {(admin.stats?.pending_chs ?? 0) > 0 && (
                          <span className="flex items-center gap-1 text-amber-600">
                            <Activity className="h-3 w-3" />
                            {admin.stats?.pending_chs} pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      {admin.permissions.can_create_ch && (
                        <Badge variant="outline" className="text-xs">Create CH</Badge>
                      )}
                      {admin.permissions.can_remove_ch && (
                        <Badge variant="outline" className="text-xs">Remove CH</Badge>
                      )}
                      {admin.permissions.can_view_csr && (
                        <Badge variant="outline" className="text-xs">View CSR</Badge>
                      )}
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
                            setSelectedAdmin(admin);
                            setEditPermissions(admin.permissions);
                            setIsEditPermissionsOpen(true);
                          }}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Edit Permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => toggleActiveMutation.mutate({ 
                            adminId: admin.id, 
                            isActive: !admin.is_active 
                          })}
                        >
                          {admin.is_active ? (
                            <><X className="h-4 w-4 mr-2" /> Deactivate</>
                          ) : (
                            <><Check className="h-4 w-4 mr-2" /> Activate</>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isEditPermissionsOpen} onOpenChange={setIsEditPermissionsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Permissions</DialogTitle>
            <DialogDescription>
              Update permissions for {selectedAdmin?.profile?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Create Community Heads</span>
              <Switch
                checked={editPermissions.can_create_ch}
                onCheckedChange={(v) => setEditPermissions({ ...editPermissions, can_create_ch: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Remove Community Heads</span>
              <Switch
                checked={editPermissions.can_remove_ch}
                onCheckedChange={(v) => setEditPermissions({ ...editPermissions, can_remove_ch: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">View CSR Funds</span>
              <Switch
                checked={editPermissions.can_view_csr}
                onCheckedChange={(v) => setEditPermissions({ ...editPermissions, can_view_csr: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Create Other Admins</span>
              <Switch
                checked={editPermissions.can_create_admin}
                onCheckedChange={(v) => setEditPermissions({ ...editPermissions, can_create_admin: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditPermissionsOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => selectedAdmin && updatePermissionsMutation.mutate({ 
                adminId: selectedAdmin.id, 
                permissions: editPermissions 
              })}
            >
              Update Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
