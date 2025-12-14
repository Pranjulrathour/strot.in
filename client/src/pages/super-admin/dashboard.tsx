import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, MapPin, Heart, Briefcase, GraduationCap, AlertTriangle, TrendingUp, Activity, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface SystemMetrics {
  totalUsers: number;
  totalMasterAdmins: number;
  activeMasterAdmins: number;
  totalCommunityHeads: number;
  activeCommunityHeads: number;
  pendingCommunityHeads: number;
  suspendedCommunityHeads: number;
  totalDonations: number;
  totalJobs: number;
  totalWorkshops: number;
  totalWorkers: number;
  totalSlumAreas: number;
  pendingFlags: number;
  criticalFlags: number;
  totalCities: number;
}

async function fetchSystemMetrics(): Promise<SystemMetrics> {
  const [
    { count: totalUsers },
    { count: totalMasterAdmins },
    { count: activeMasterAdmins },
    { count: totalCommunityHeads },
    { count: activeCommunityHeads },
    { count: pendingCommunityHeads },
    { count: suspendedCommunityHeads },
    { count: totalDonations },
    { count: totalJobs },
    { count: totalWorkshops },
    { count: totalWorkers },
    { count: totalSlumAreas },
    { count: pendingFlags },
    { count: criticalFlags },
    { data: cities },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("master_admins").select("*", { count: "exact", head: true }),
    supabase.from("master_admins").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("community_heads").select("*", { count: "exact", head: true }),
    supabase.from("community_heads").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("community_heads").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("community_heads").select("*", { count: "exact", head: true }).eq("is_suspended", true),
    supabase.from("donations").select("*", { count: "exact", head: true }),
    supabase.from("jobs").select("*", { count: "exact", head: true }),
    supabase.from("workshops").select("*", { count: "exact", head: true }),
    supabase.from("worker_profiles").select("*", { count: "exact", head: true }),
    supabase.from("slum_areas").select("*", { count: "exact", head: true }),
    supabase.from("ch_flagged_reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("ch_flagged_reports").select("*", { count: "exact", head: true }).eq("status", "pending").gte("severity", 4),
    supabase.from("master_admins").select("city").neq("city", "National"),
  ]);

  const uniqueCities = new Set(cities?.map(c => c.city) || []);

  return {
    totalUsers: totalUsers ?? 0,
    totalMasterAdmins: totalMasterAdmins ?? 0,
    activeMasterAdmins: activeMasterAdmins ?? 0,
    totalCommunityHeads: totalCommunityHeads ?? 0,
    activeCommunityHeads: activeCommunityHeads ?? 0,
    pendingCommunityHeads: pendingCommunityHeads ?? 0,
    suspendedCommunityHeads: suspendedCommunityHeads ?? 0,
    totalDonations: totalDonations ?? 0,
    totalJobs: totalJobs ?? 0,
    totalWorkshops: totalWorkshops ?? 0,
    totalWorkers: totalWorkers ?? 0,
    totalSlumAreas: totalSlumAreas ?? 0,
    pendingFlags: pendingFlags ?? 0,
    criticalFlags: criticalFlags ?? 0,
    totalCities: uniqueCities.size,
  };
}

export default function SuperAdminDashboard() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/super-admin/dashboard"],
    queryFn: fetchSystemMetrics,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total System Users",
      value: metrics?.totalUsers ?? 0,
      subtitle: "Registered accounts",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      href: "/admin/users",
    },
    {
      title: "Master Admins",
      value: metrics?.totalMasterAdmins ?? 0,
      subtitle: `${metrics?.activeMasterAdmins ?? 0} active`,
      icon: Shield,
      color: "text-violet-500",
      bgColor: "bg-violet-100",
      href: "/admin/master-admins",
    },
    {
      title: "Cities Covered",
      value: metrics?.totalCities ?? 0,
      subtitle: "With active Master Admins",
      icon: MapPin,
      color: "text-cyan-500",
      bgColor: "bg-cyan-100",
      href: "/admin/master-admins",
    },
    {
      title: "Community Heads",
      value: metrics?.totalCommunityHeads ?? 0,
      subtitle: `${metrics?.activeCommunityHeads ?? 0} active, ${metrics?.pendingCommunityHeads ?? 0} pending`,
      icon: Users,
      color: "text-emerald-500",
      bgColor: "bg-emerald-100",
      href: "/admin/community-heads",
    },
    {
      title: "Total Donations",
      value: metrics?.totalDonations ?? 0,
      subtitle: "System-wide",
      icon: Heart,
      color: "text-rose-500",
      bgColor: "bg-rose-100",
    },
    {
      title: "Job Listings",
      value: metrics?.totalJobs ?? 0,
      subtitle: "Posted by businesses",
      icon: Briefcase,
      color: "text-amber-500",
      bgColor: "bg-amber-100",
    },
    {
      title: "Workshops",
      value: metrics?.totalWorkshops ?? 0,
      subtitle: "Total conducted",
      icon: GraduationCap,
      color: "text-purple-500",
      bgColor: "bg-purple-100",
    },
    {
      title: "Workers Onboarded",
      value: metrics?.totalWorkers ?? 0,
      subtitle: "Across all CHs",
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-100",
    },
    {
      title: "Slum Areas",
      value: metrics?.totalSlumAreas ?? 0,
      subtitle: "Registered areas",
      icon: MapPin,
      color: "text-teal-500",
      bgColor: "bg-teal-100",
      href: "/admin/areas",
    },
    {
      title: "Pending Flags",
      value: metrics?.pendingFlags ?? 0,
      subtitle: `${metrics?.criticalFlags ?? 0} critical`,
      icon: AlertTriangle,
      color: metrics?.criticalFlags ? "text-red-500" : "text-green-500",
      bgColor: metrics?.criticalFlags ? "bg-red-100" : "bg-green-100",
      href: "/admin/flags",
    },
    {
      title: "Suspended CHs",
      value: metrics?.suspendedCommunityHeads ?? 0,
      subtitle: "Under review",
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-violet-500" />
            Super Admin Control Center
          </h1>
          <p className="text-muted-foreground mt-1">System-wide oversight and governance</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card 
            key={stat.title} 
            className={`hover:shadow-md transition-all ${stat.href ? 'cursor-pointer' : ''}`}
            onClick={() => stat.href && window.location.href === stat.href}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-violet-500" />
              Master Admin Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${((metrics?.activeMasterAdmins ?? 0) / Math.max(metrics?.totalMasterAdmins ?? 1, 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8">{metrics?.activeMasterAdmins}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cities Covered</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: "100%" }} />
                  </div>
                  <span className="text-sm font-medium w-8">{metrics?.totalCities}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-500" />
              Community Head Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${((metrics?.activeCommunityHeads ?? 0) / Math.max(metrics?.totalCommunityHeads ?? 1, 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8">{metrics?.activeCommunityHeads}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${((metrics?.pendingCommunityHeads ?? 0) / Math.max(metrics?.totalCommunityHeads ?? 1, 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8">{metrics?.pendingCommunityHeads}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Suspended</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${((metrics?.suspendedCommunityHeads ?? 0) / Math.max(metrics?.totalCommunityHeads ?? 1, 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8">{metrics?.suspendedCommunityHeads}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Admin Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button asChild variant="outline" className="h-auto p-4 flex-col items-start gap-2">
              <Link href="/admin/master-admins">
                <Shield className="h-5 w-5 text-violet-500" />
                <div className="text-left">
                  <p className="font-medium">Manage Master Admins</p>
                  <p className="text-xs text-muted-foreground">Create, activate, assign cities</p>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex-col items-start gap-2">
              <Link href="/admin/users">
                <Users className="h-5 w-5 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium">User Management</p>
                  <p className="text-xs text-muted-foreground">Promote users, manage roles</p>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex-col items-start gap-2">
              <Link href="/admin/community-heads">
                <Users className="h-5 w-5 text-emerald-500" />
                <div className="text-left">
                  <p className="font-medium">All Community Heads</p>
                  <p className="text-xs text-muted-foreground">System-wide CH overview</p>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex-col items-start gap-2">
              <Link href="/admin/system-logs">
                <Activity className="h-5 w-5 text-orange-500" />
                <div className="text-left">
                  <p className="font-medium">System Audit Logs</p>
                  <p className="text-xs text-muted-foreground">Track all admin actions</p>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {metrics?.criticalFlags && metrics.criticalFlags > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Critical Alerts Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{metrics.criticalFlags} critical flag(s) pending review</p>
                <p className="text-sm text-muted-foreground">These require immediate Super Admin intervention</p>
              </div>
              <Button asChild variant="destructive">
                <Link href="/admin/flags">Review Now</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
