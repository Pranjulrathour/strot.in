import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, Briefcase, GraduationCap, AlertTriangle, TrendingUp, MapPin, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface DashboardMetrics {
  totalCommunityHeads: number;
  activeCommunityHeads: number;
  pendingCommunityHeads: number;
  suspendedCommunityHeads: number;
  totalDonations: number;
  pendingDonations: number;
  claimedDonations: number;
  deliveredDonations: number;
  totalJobs: number;
  openJobs: number;
  filledJobs: number;
  totalWorkshops: number;
  pendingFlags: number;
  totalSlumAreas: number;
  totalWorkers: number;
}

async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  // Get current Master Admin's city for filtering
  const { data: authData } = await supabase.auth.getUser();
  const { data: masterAdmin } = await supabase
    .from("master_admins")
    .select("city, state")
    .eq("user_id", authData.user?.id)
    .maybeSingle();

  const city = masterAdmin?.city;

  // Get CH IDs managed by this Master Admin for filtering other data
  const { data: managedCHs } = await supabase
    .from("community_heads")
    .select("id")
    .eq("approved_by", authData.user?.id);

  const chIds = managedCHs?.map(ch => ch.id) || [];

  const [
    { count: totalCH },
    { count: activeCH },
    { count: pendingCH },
    { count: suspendedCH },
    { count: totalDonations },
    { count: pendingDonations },
    { count: claimedDonations },
    { count: deliveredDonations },
    { count: totalJobs },
    { count: openJobs },
    { count: filledJobs },
    { count: totalWorkshops },
    { count: pendingFlags },
    { count: totalSlumAreas },
    { count: totalWorkers },
  ] = await Promise.all([
    // Only CHs managed by this Master Admin
    supabase.from("community_heads").select("*", { count: "exact", head: true }).eq("approved_by", authData.user?.id),
    supabase.from("community_heads").select("*", { count: "exact", head: true }).eq("approved_by", authData.user?.id).eq("status", "active"),
    supabase.from("community_heads").select("*", { count: "exact", head: true }).eq("approved_by", authData.user?.id).eq("status", "pending"),
    supabase.from("community_heads").select("*", { count: "exact", head: true }).eq("approved_by", authData.user?.id).eq("is_suspended", true),
    // Donations from CHs in this city
    chIds.length > 0 
      ? supabase.from("donations").select("*", { count: "exact", head: true }).in("community_head_id", chIds)
      : Promise.resolve({ count: 0 }),
    chIds.length > 0 
      ? supabase.from("donations").select("*", { count: "exact", head: true }).in("community_head_id", chIds).eq("status", "pending")
      : Promise.resolve({ count: 0 }),
    chIds.length > 0 
      ? supabase.from("donations").select("*", { count: "exact", head: true }).in("community_head_id", chIds).eq("status", "claimed")
      : Promise.resolve({ count: 0 }),
    chIds.length > 0 
      ? supabase.from("donations").select("*", { count: "exact", head: true }).in("community_head_id", chIds).eq("status", "delivered")
      : Promise.resolve({ count: 0 }),
    // Jobs in this city
    city ? supabase.from("jobs").select("*", { count: "exact", head: true }).eq("location", city) : Promise.resolve({ count: 0 }),
    city ? supabase.from("jobs").select("*", { count: "exact", head: true }).eq("location", city).eq("status", "open") : Promise.resolve({ count: 0 }),
    city ? supabase.from("jobs").select("*", { count: "exact", head: true }).eq("location", city).eq("status", "filled") : Promise.resolve({ count: 0 }),
    // Workshops by CHs in this city
    chIds.length > 0 
      ? supabase.from("workshops").select("*", { count: "exact", head: true }).in("creator_id", chIds)
      : Promise.resolve({ count: 0 }),
    // Flags for CHs managed by this MA
    chIds.length > 0 
      ? supabase.from("ch_flagged_reports").select("*", { count: "exact", head: true }).in("ch_id", chIds).eq("status", "pending")
      : Promise.resolve({ count: 0 }),
    // Slum areas in this city
    city ? supabase.from("slum_areas").select("*", { count: "exact", head: true }).eq("city", city) : Promise.resolve({ count: 0 }),
    // Workers onboarded by CHs in this city
    chIds.length > 0 
      ? supabase.from("worker_profiles").select("*", { count: "exact", head: true }).in("community_head_id", chIds)
      : Promise.resolve({ count: 0 }),
  ]);

  return {
    totalCommunityHeads: totalCH ?? 0,
    activeCommunityHeads: activeCH ?? 0,
    pendingCommunityHeads: pendingCH ?? 0,
    suspendedCommunityHeads: suspendedCH ?? 0,
    totalDonations: totalDonations ?? 0,
    pendingDonations: pendingDonations ?? 0,
    claimedDonations: claimedDonations ?? 0,
    deliveredDonations: deliveredDonations ?? 0,
    totalJobs: totalJobs ?? 0,
    openJobs: openJobs ?? 0,
    filledJobs: filledJobs ?? 0,
    totalWorkshops: totalWorkshops ?? 0,
    pendingFlags: pendingFlags ?? 0,
    totalSlumAreas: totalSlumAreas ?? 0,
    totalWorkers: totalWorkers ?? 0,
  };
}

export default function MasterAdminDashboard() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/master-admin/dashboard"],
    queryFn: fetchDashboardMetrics,
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
      title: "Community Heads",
      value: metrics?.totalCommunityHeads ?? 0,
      subtitle: `${metrics?.activeCommunityHeads ?? 0} active, ${metrics?.pendingCommunityHeads ?? 0} pending`,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Donations",
      value: metrics?.totalDonations ?? 0,
      subtitle: `${metrics?.deliveredDonations ?? 0} delivered`,
      icon: Heart,
      color: "text-rose-500",
      bgColor: "bg-rose-100",
    },
    {
      title: "Job Listings",
      value: metrics?.totalJobs ?? 0,
      subtitle: `${metrics?.openJobs ?? 0} open, ${metrics?.filledJobs ?? 0} filled`,
      icon: Briefcase,
      color: "text-emerald-500",
      bgColor: "bg-emerald-100",
    },
    {
      title: "Workshops",
      value: metrics?.totalWorkshops ?? 0,
      subtitle: "Total scheduled",
      icon: GraduationCap,
      color: "text-violet-500",
      bgColor: "bg-violet-100",
    },
    {
      title: "Pending Flags",
      value: metrics?.pendingFlags ?? 0,
      subtitle: "Requires attention",
      icon: AlertTriangle,
      color: metrics?.pendingFlags ? "text-amber-500" : "text-green-500",
      bgColor: metrics?.pendingFlags ? "bg-amber-100" : "bg-green-100",
    },
    {
      title: "Slum Areas",
      value: metrics?.totalSlumAreas ?? 0,
      subtitle: "Registered areas",
      icon: MapPin,
      color: "text-cyan-500",
      bgColor: "bg-cyan-100",
    },
    {
      title: "Workers",
      value: metrics?.totalWorkers ?? 0,
      subtitle: "Onboarded profiles",
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-100",
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
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Master Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">City-wide operational overview and control center</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
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
              <Heart className="h-5 w-5 text-rose-500" />
              Donation Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${((metrics?.pendingDonations ?? 0) / Math.max(metrics?.totalDonations ?? 1, 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8">{metrics?.pendingDonations}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Claimed</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${((metrics?.claimedDonations ?? 0) / Math.max(metrics?.totalDonations ?? 1, 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8">{metrics?.claimedDonations}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Delivered</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${((metrics?.deliveredDonations ?? 0) / Math.max(metrics?.totalDonations ?? 1, 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8">{metrics?.deliveredDonations}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Community Head Status
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
                <span className="text-sm text-muted-foreground">Pending Approval</span>
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
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <a href="/master-admin/community-heads" className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Manage CHs</p>
                <p className="text-xs text-muted-foreground">Approve, suspend, extend tenure</p>
              </div>
            </a>
            <a href="/master-admin/flags" className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div>
                <p className="font-medium">Review Flags</p>
                <p className="text-xs text-muted-foreground">{metrics?.pendingFlags ?? 0} pending reports</p>
              </div>
            </a>
            <a href="/master-admin/logs" className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="font-medium">Activity Logs</p>
                <p className="text-xs text-muted-foreground">View CH activities</p>
              </div>
            </a>
            <a href="/master-admin/csr" className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <DollarSign className="h-5 w-5 text-violet-500" />
              <div>
                <p className="font-medium">CSR Funds</p>
                <p className="text-xs text-muted-foreground">Monitor allocations</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
