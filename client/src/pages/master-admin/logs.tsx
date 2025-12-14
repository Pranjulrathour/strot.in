import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { 
  Search, Filter, Clock, Heart, Briefcase, GraduationCap, 
  UserPlus, RefreshCw, Activity
} from "lucide-react";

interface ActivityLog {
  id: string;
  ch_id: string;
  action_type: string;
  entity_id: string | null;
  entity_type: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  community_head?: {
    locality: string;
    profile?: {
      name: string;
    };
  };
}

const actionTypeLabels: Record<string, { label: string; icon: typeof Heart; color: string }> = {
  donation_claimed: { label: "Donation Claimed", icon: Heart, color: "text-blue-500" },
  donation_delivered: { label: "Donation Delivered", icon: Heart, color: "text-green-500" },
  job_matched: { label: "Job Matched", icon: Briefcase, color: "text-amber-500" },
  job_placed: { label: "Job Placed", icon: Briefcase, color: "text-emerald-500" },
  workshop_proposed: { label: "Workshop Proposed", icon: GraduationCap, color: "text-violet-500" },
  workshop_hosted: { label: "Workshop Hosted", icon: GraduationCap, color: "text-purple-500" },
  workshop_completed: { label: "Workshop Completed", icon: GraduationCap, color: "text-green-500" },
  worker_onboarded: { label: "Worker Onboarded", icon: UserPlus, color: "text-cyan-500" },
  profile_updated: { label: "Profile Updated", icon: RefreshCw, color: "text-gray-500" },
  tenure_extended: { label: "Tenure Extended", icon: Clock, color: "text-orange-500" },
  status_changed: { label: "Status Changed", icon: Activity, color: "text-rose-500" },
};

async function fetchActivityLogs(): Promise<ActivityLog[]> {
  // Get current Master Admin's managed CHs
  const { data: authData } = await supabase.auth.getUser();
  const { data: managedCHs } = await supabase
    .from("community_heads")
    .select("id")
    .eq("approved_by", authData.user?.id);

  const chIds = managedCHs?.map(ch => ch.id) || [];

  if (chIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("ch_activity_logs")
    .select(`
      *,
      community_head:community_heads(
        locality,
        profile:profiles!community_heads_user_id_fkey(name)
      )
    `)
    .in("ch_id", chIds)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export default function ActivityLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const { data: logs, isLoading } = useQuery({
    queryKey: ["/api/master-admin/logs"],
    queryFn: fetchActivityLogs,
  });

  const filteredLogs = logs?.filter((log) => {
    const matchesSearch = 
      log.community_head?.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.community_head?.locality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === "all" || log.action_type === actionFilter;
    
    let matchesDate = true;
    if (dateFilter !== "all") {
      const logDate = new Date(log.created_at);
      const now = new Date();
      if (dateFilter === "today") {
        matchesDate = logDate.toDateString() === now.toDateString();
      } else if (dateFilter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = logDate >= weekAgo;
      } else if (dateFilter === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = logDate >= monthAgo;
      }
    }
    
    return matchesSearch && matchesAction && matchesDate;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
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
        <h1 className="text-3xl font-semibold tracking-tight">Activity Logs</h1>
        <p className="text-muted-foreground mt-1">Monitor all Community Head activities for transparency</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by CH name, locality, or action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {Object.entries(actionTypeLabels).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[150px]">
            <Clock className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
            <Badge variant="secondary" className="ml-2">{filteredLogs?.length ?? 0} entries</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs?.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No activity logs found</p>
              <p className="text-sm text-muted-foreground">Activities will appear here as Community Heads perform actions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs?.map((log) => {
                const actionInfo = actionTypeLabels[log.action_type] || { 
                  label: log.action_type, 
                  icon: Activity, 
                  color: "text-gray-500" 
                };
                const Icon = actionInfo.icon;

                return (
                  <div key={log.id} className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className={`p-2 rounded-lg bg-muted ${actionInfo.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{log.community_head?.profile?.name || "Unknown CH"}</span>
                        <Badge variant="outline" className="text-xs">{actionInfo.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {log.community_head?.locality && `Area: ${log.community_head.locality}`}
                        {log.entity_type && ` • ${log.entity_type}: ${log.entity_id?.slice(0, 8)}...`}
                      </p>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {JSON.stringify(log.metadata).slice(0, 100)}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
