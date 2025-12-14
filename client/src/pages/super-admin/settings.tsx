import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { 
  Settings, Shield, Bell, Lock, Database, 
  Save, RefreshCw, AlertTriangle, CheckCircle
} from "lucide-react";

interface SystemSettings {
  id: string;
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState({
    allowNewRegistrations: true,
    requireEmailVerification: false,
    maxDonationsPerDay: 10,
    maxJobsPerBusiness: 5,
    chTenureDays: 365,
    autoApproveWorkshops: false,
    enableNotifications: true,
    maintenanceMode: false,
  });

  const [profileSettings, setProfileSettings] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileSettings) => {
      if (data.newPassword) {
        if (data.newPassword !== data.confirmPassword) {
          throw new Error("Passwords don't match");
        }
        if (data.newPassword.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
        const { error } = await supabase.auth.updateUser({
          password: data.newPassword,
        });
        if (error) throw new Error(error.message);
      }

      if (data.name !== user?.name) {
        const { error } = await supabase
          .from("profiles")
          .update({ name: data.name })
          .eq("id", user?.id);
        if (error) throw new Error(error.message);
      }

      // Log the action
      await supabase.from("system_logs").insert({
        user_id: user?.id,
        action_type: "settings_updated",
        entity_type: "user",
        entity_id: user?.id,
        description: `Profile settings updated by ${user?.name}`,
        metadata: { updated_fields: data.newPassword ? ["name", "password"] : ["name"] },
      });
    },
    onSuccess: () => {
      toast({ title: "Profile updated successfully" });
      setProfileSettings(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to update profile", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const saveSystemSettings = async () => {
    try {
      // Log the settings change
      await supabase.from("system_logs").insert({
        user_id: user?.id,
        action_type: "settings_updated",
        entity_type: "system",
        description: `System settings updated by ${user?.name}`,
        metadata: settings,
      });

      toast({ title: "System settings saved successfully" });
    } catch (error) {
      toast({ 
        title: "Failed to save settings", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">Manage system configuration and your profile</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>Update your personal information and password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={profileSettings.name}
                onChange={(e) => setProfileSettings({ ...profileSettings, name: e.target.value })}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profileSettings.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={profileSettings.newPassword}
                onChange={(e) => setProfileSettings({ ...profileSettings, newPassword: e.target.value })}
                placeholder="Leave blank to keep current"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={profileSettings.confirmPassword}
                onChange={(e) => setProfileSettings({ ...profileSettings, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>

            <Button 
              onClick={() => updateProfileMutation.mutate(profileSettings)}
              disabled={updateProfileMutation.isPending}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Settings
            </CardTitle>
            <CardDescription>Configure platform-wide settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Allow New Registrations</Label>
                <p className="text-xs text-muted-foreground">Enable new user sign-ups</p>
              </div>
              <Switch
                checked={settings.allowNewRegistrations}
                onCheckedChange={(v) => setSettings({ ...settings, allowNewRegistrations: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Require Email Verification</Label>
                <p className="text-xs text-muted-foreground">Users must verify email before access</p>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={(v) => setSettings({ ...settings, requireEmailVerification: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-Approve Workshops</Label>
                <p className="text-xs text-muted-foreground">Skip CH approval for workshops</p>
              </div>
              <Switch
                checked={settings.autoApproveWorkshops}
                onCheckedChange={(v) => setSettings({ ...settings, autoApproveWorkshops: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Notifications</Label>
                <p className="text-xs text-muted-foreground">Send email/push notifications</p>
              </div>
              <Switch
                checked={settings.enableNotifications}
                onCheckedChange={(v) => setSettings({ ...settings, enableNotifications: v })}
              />
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <Label htmlFor="maxDonations">Max Donations Per Day (per user)</Label>
              <Input
                id="maxDonations"
                type="number"
                value={settings.maxDonationsPerDay}
                onChange={(e) => setSettings({ ...settings, maxDonationsPerDay: parseInt(e.target.value) || 10 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxJobs">Max Active Jobs Per Business</Label>
              <Input
                id="maxJobs"
                type="number"
                value={settings.maxJobsPerBusiness}
                onChange={(e) => setSettings({ ...settings, maxJobsPerBusiness: parseInt(e.target.value) || 5 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chTenure">CH Tenure Duration (days)</Label>
              <Input
                id="chTenure"
                type="number"
                value={settings.chTenureDays}
                onChange={(e) => setSettings({ ...settings, chTenureDays: parseInt(e.target.value) || 365 })}
              />
            </div>

            <Button onClick={saveSystemSettings} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save System Settings
            </Button>
          </CardContent>
        </Card>

        {/* Maintenance Mode */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Maintenance Mode
            </CardTitle>
            <CardDescription>
              Enable maintenance mode to temporarily disable the platform for all users except admins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
              <div className="flex items-center gap-4">
                {settings.maintenanceMode ? (
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                ) : (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                )}
                <div>
                  <p className="font-medium">
                    {settings.maintenanceMode ? "Maintenance Mode is ON" : "Platform is Live"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {settings.maintenanceMode 
                      ? "Only admins can access the platform" 
                      : "All users can access the platform normally"}
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(v) => setSettings({ ...settings, maintenanceMode: v })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <RefreshCw className="h-5 w-5" />
                <span>Clear Cache</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <Database className="h-5 w-5" />
                <span>Export Data</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <Bell className="h-5 w-5" />
                <span>Send Announcement</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
