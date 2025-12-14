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
  Activity, Search, Filter, User, Shield, Heart, Briefcase, 
  GraduationCap, Users, Settings, Calendar, Clock
} from "lucide-react";

interface SystemLog {
  id: string;
  user_id: string | null;
  action_type: string;
  entity_type: string | null;
  entity_id: string | null;
  description: string | null;
  metadata: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
  user?: {
    name: string;
    email: string;
    role: string;
  } | null;
}

async function fetchSystemLogs(): Promise<SystemLog[]> {
  const { data, error } = await supabase
    .from("system_logs")
    .select(`
      *,
      user:profiles!system_logs_user_id_fkey(name, email, role)
    `)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("Error fetching system logs:", error);
    // Return empty array if table doesn't exist or query fails
    return [];
  }
  return data ?? [];
}

export default function SystemLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");

  const { data: logs, isLoading } = useQuery({
    queryKey: ["/api/admin/system-logs"],
    queryFn: fetchSystemLogs,
  });

  const filteredLogs = logs?.filter((log) => {
    const matchesSearch = 
      log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === "all" || log.action_type?.startsWith(actionFilter);
    const matchesEntity = entityFilter === "all" || log.entity_type === entityFilter;
    
    return matchesSearch && matchesAction && matchesEntity;
  });

  const getActionIcon = (actionType: string) => {
    if (actionType.startsWith("user_")) return User;
    if (actionType.startsWith("master_admin_")) return Shield;
    if (actionType.startsWith("ch_")) return Users;
    if (actionType.startsWith("donation_")) return Heart;
    if (actionType.startsWith("job_")) return Briefcase;
    if (actionType.startsWith("workshop_")) return GraduationCap;
    if (actionType.startsWith("worker_")) return Users;
    if (actionType.startsWith("settings_")) return Settings;
    return Activity;
  };

  const getActionBadgeColor = (actionType: string) => {
    if (actionType.includes("created") || actionType.includes("approved") || actionType.includes("login")) {
      return "bg-green-500";
    }
    if (actionType.includes("deleted") || actionType.includes("suspended") || actionType.includes("rejected")) {
      return "bg-red-500";
    }
    if (actionType.includes("updated") || actionType.includes("change")) {
      return "bg-blue-500";
    }
    return "bg-gray-500";
  };

  const formatActionType = (actionType: string) => {
    return actionType
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = {
    total: logs?.length ?? 0,
    today: logs?.filter(log => {
      const today = new Date();
      const logDate = new Date(log.created_at);
      return logDate.toDateString() === today.toDateString();
    }).length ?? 0,
    userActions: logs?.filter(log => log.action_type.startsWith("user_")).length ?? 0,
    adminActions: logs?.filter(log => 
      log.action_type.startsWith("master_admin_") || 
      log.action_type.startsWith("ch_")
    ).length ?? 0,
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
        <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
          <Activity className="h-8 w-8 text-primary" />
          System Logs
        </h1>
        <p className="text-muted-foreground mt-1">Monitor all system activities and user actions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Logs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">{stats.today}</div>
            <p className="text-xs text-muted-foreground">Today's Activity</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">{stats.userActions}</div>
            <p className="text-xs text-muted-foreground">User Actions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-violet-500">{stats.adminActions}</div>
            <p className="text-xs text-muted-foreground">Admin Actions</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs by description, user, or action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="user_">User Actions</SelectItem>
            <SelectItem value="role_">Role Changes</SelectItem>
            <SelectItem value="master_admin_">Master Admin</SelectItem>
            <SelectItem value="ch_">Community Head</SelectItem>
            <SelectItem value="donation_">Donations</SelectItem>
            <SelectItem value="job_">Jobs</SelectItem>
            <SelectItem value="workshop_">Workshops</SelectItem>
            <SelectItem value="worker_">Workers</SelectItem>
          </SelectContent>
        </Select>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by entity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            <SelectItem value="user">Users</SelectItem>
            <SelectItem value="master_admin">Master Admins</SelectItem>
            <SelectItem value="community_head">Community Heads</SelectItem>
            <SelectItem value="donation">Donations</SelectItem>
            <SelectItem value="job">Jobs</SelectItem>
            <SelectItem value="workshop">Workshops</SelectItem>
            <SelectItem value="worker">Workers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Log
            <Badge variant="secondary" className="ml-2">{filteredLogs?.length ?? 0} entries</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs?.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No logs found</p>
              <p className="text-sm text-muted-foreground">
                {logs?.length === 0 
                  ? "System logs will appear here as users perform actions"
                  : "Try adjusting your search or filters"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs?.map((log) => {
                const ActionIcon = getActionIcon(log.action_type);
                
                return (
                  <div 
                    key={log.id} 
                    className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <ActionIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getActionBadgeColor(log.action_type)}>
                          {formatActionType(log.action_type)}
                        </Badge>
                        {log.entity_type && (
                          <Badge variant="outline">{log.entity_type}</Badge>
                        )}
                      </div>
                      <p className="text-sm mt-1">
                        {log.description || `Action: ${formatActionType(log.action_type)}`}
                      </p>
                      {log.user && (
                        <p className="text-xs text-muted-foreground mt-1">
                          By: {log.user.name} ({log.user.email}) • {log.user.role}
                        </p>
                      )}
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                            View details
                          </summary>
                          <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground shrink-0">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(log.created_at)}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(log.created_at)}
                      </div>
                    </div>
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
