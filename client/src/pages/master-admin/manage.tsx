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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { 
  Shield, UserPlus, MapPin, Calendar, Settings, 
  MoreVertical, Check, X, AlertTriangle
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
  };
}

async function fetchMasterAdmins(): Promise<MasterAdmin[]> {
  const { data, error } = await supabase
    .from("master_admins")
    .select(`
      *,
      profile:profiles(name, email)
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export default function ManageMasterAdmins() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    email: "",
    city: "",
    state: "",
    can_create_ch: true,
    can_remove_ch: true,
    can_view_csr: true,
    can_create_admin: false,
  });

  const { data: admins, isLoading } = useQuery({
    queryKey: ["/api/master-admin/manage"],
    queryFn: fetchMasterAdmins,
  });

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ adminId, isActive }: { adminId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("master_admins")
        .update({ is_active: isActive })
        .eq("id", adminId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master-admin/manage"] });
      toast({ title: "Admin status updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ adminId, permissions }: { adminId: string; permissions: MasterAdmin["permissions"] }) => {
      const { error } = await supabase
        .from("master_admins")
        .update({ permissions })
        .eq("id", adminId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master-admin/manage"] });
      toast({ title: "Permissions updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: async (data: typeof newAdmin) => {
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", data.email)
        .maybeSingle();

      if (userError) throw new Error(userError.message);
      if (!userData) throw new Error("User not found with this email");

      const { data: authData } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("master_admins").insert({
        id: userData.id,
        user_id: userData.id,
        city: data.city,
        state: data.state || null,
        assigned_by: authData.user?.id,
        permissions: {
          can_create_ch: data.can_create_ch,
          can_remove_ch: data.can_remove_ch,
          can_view_csr: data.can_view_csr,
          can_create_admin: data.can_create_admin,
        },
      });

      if (error) throw new Error(error.message);

      await supabase
        .from("profiles")
        .update({ role: "MASTER_ADMIN" })
        .eq("id", userData.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master-admin/manage"] });
      toast({ title: "Master Admin created successfully" });
      setIsAddDialogOpen(false);
      setNewAdmin({
        email: "",
        city: "",
        state: "",
        can_create_ch: true,
        can_remove_ch: true,
        can_view_csr: true,
        can_create_admin: false,
      });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create admin", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Access Restricted</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Only Super Admins can manage Master Admin accounts. 
          Contact your system administrator if you need access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Manage Master Admins</h1>
          <p className="text-muted-foreground mt-1">Create and manage city-level administrators</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Master Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Master Admin</DialogTitle>
              <DialogDescription>Add a new city-level administrator</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="email">User Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  placeholder="admin@example.com"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">User must already be registered</p>
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
                    <span className="text-sm">Create Other Admins</span>
                    <Switch
                      checked={newAdmin.can_create_admin}
                      onCheckedChange={(v) => setNewAdmin({ ...newAdmin, can_create_admin: v })}
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={() => createAdminMutation.mutate(newAdmin)}
                disabled={!newAdmin.email || !newAdmin.city}
              >
                Create Admin
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {admins?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No Master Admins</p>
              <p className="text-sm text-muted-foreground">Create your first city administrator</p>
            </CardContent>
          </Card>
        ) : (
          admins?.map((admin) => (
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
                      {admin.permissions.can_create_admin && (
                        <Badge variant="outline" className="text-xs text-violet-500 border-violet-500">Create Admin</Badge>
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
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Edit Permissions
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
    </div>
  );
}
