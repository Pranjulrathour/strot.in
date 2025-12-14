import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { 
  AlertTriangle, Search, Filter, Clock, CheckCircle, 
  XCircle, Eye, Ban, Shield
} from "lucide-react";

interface FlaggedReport {
  id: string;
  ch_id: string;
  reported_by: string;
  reporter_type: string;
  reason: string;
  description: string | null;
  severity: number;
  status: string;
  resolution_notes: string | null;
  created_at: string;
  resolved_at: string | null;
  community_head?: {
    locality: string;
    profile?: {
      name: string;
      email: string;
    };
  };
}

async function fetchFlaggedReports(): Promise<FlaggedReport[]> {
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
    .from("ch_flagged_reports")
    .select(`
      *,
      community_head:community_heads(
        locality,
        profile:profiles!community_heads_user_id_fkey(name, email)
      )
    `)
    .in("ch_id", chIds)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export default function FlaggedReports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedReport, setSelectedReport] = useState<FlaggedReport | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [actionType, setActionType] = useState<"resolve" | "dismiss" | "suspend" | null>(null);

  const { data: reports, isLoading } = useQuery({
    queryKey: ["/api/master-admin/flags"],
    queryFn: fetchFlaggedReports,
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ reportId, notes, action }: { reportId: string; notes: string; action: string }) => {
      const { data: authData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("ch_flagged_reports")
        .update({ 
          status: action === "dismiss" ? "dismissed" : "resolved",
          resolution_notes: notes,
          reviewed_by: authData.user?.id,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", reportId);
      if (error) throw new Error(error.message);

      if (action === "suspend" && selectedReport) {
        const { error: suspendError } = await supabase
          .from("community_heads")
          .update({ 
            is_suspended: true,
            suspension_reason: `Flagged report: ${selectedReport.reason}`,
            status: "suspended",
          })
          .eq("id", selectedReport.ch_id);
        if (suspendError) throw new Error(suspendError.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master-admin/flags"] });
      queryClient.invalidateQueries({ queryKey: ["/api/master-admin/community-heads"] });
      toast({ title: actionType === "dismiss" ? "Report dismissed" : "Report resolved" });
      setSelectedReport(null);
      setActionType(null);
      setResolutionNotes("");
    },
    onError: (error: Error) => {
      toast({ title: "Action failed", description: error.message, variant: "destructive" });
    },
  });

  const filteredReports = reports?.filter((report) => {
    const matchesSearch = 
      report.community_head?.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getSeverityBadge = (severity: number) => {
    if (severity >= 4) return <Badge variant="destructive">Critical ({severity})</Badge>;
    if (severity >= 3) return <Badge className="bg-orange-500">High ({severity})</Badge>;
    if (severity >= 2) return <Badge className="bg-amber-500">Medium ({severity})</Badge>;
    return <Badge variant="secondary">Low ({severity})</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "under_review":
        return <Badge className="bg-blue-500"><Eye className="h-3 w-3 mr-1" />Under Review</Badge>;
      case "resolved":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>;
      case "dismissed":
        return <Badge variant="outline"><XCircle className="h-3 w-3 mr-1" />Dismissed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pendingCount = reports?.filter(r => r.status === "pending").length ?? 0;
  const criticalCount = reports?.filter(r => r.status === "pending" && r.severity >= 4).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Flagged Reports</h1>
          <p className="text-muted-foreground mt-1">Review and resolve misconduct reports</p>
        </div>
        <div className="flex gap-2">
          {criticalCount > 0 && (
            <Badge variant="destructive" className="text-sm py-1 px-3">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {criticalCount} Critical
            </Badge>
          )}
          {pendingCount > 0 && (
            <Badge variant="secondary" className="text-sm py-1 px-3">
              {pendingCount} Pending
            </Badge>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by CH name, reason, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredReports?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-lg font-medium">No flagged reports</p>
              <p className="text-sm text-muted-foreground">All clear! No misconduct reports to review.</p>
            </CardContent>
          </Card>
        ) : (
          filteredReports?.map((report) => (
            <Card key={report.id} className={`hover:shadow-md transition-shadow ${report.severity >= 4 ? "border-destructive/50" : ""}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className={`p-3 rounded-lg ${report.severity >= 4 ? "bg-destructive/10" : "bg-amber-500/10"}`}>
                      <AlertTriangle className={`h-6 w-6 ${report.severity >= 4 ? "text-destructive" : "text-amber-500"}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{report.community_head?.profile?.name || "Unknown CH"}</h3>
                        {getSeverityBadge(report.severity)}
                        {getStatusBadge(report.status)}
                      </div>
                      <p className="font-medium text-sm">{report.reason}</p>
                      {report.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{report.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Reported by: {report.reporter_type}</span>
                        <span>Area: {report.community_head?.locality}</span>
                        <span>{formatDate(report.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {report.status === "pending" && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => { setSelectedReport(report); setActionType("dismiss"); }}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Dismiss
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => { setSelectedReport(report); setActionType("resolve"); }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                      {report.severity >= 4 && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => { setSelectedReport(report); setActionType("suspend"); }}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Suspend CH
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {report.resolution_notes && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Resolution: </span>
                      {report.resolution_notes}
                    </p>
                    {report.resolved_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Resolved on {formatDate(report.resolved_at)}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!actionType} onOpenChange={() => setActionType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "dismiss" && "Dismiss Report"}
              {actionType === "resolve" && "Resolve Report"}
              {actionType === "suspend" && "Suspend Community Head"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "dismiss" && "This report will be marked as dismissed. The CH will not be affected."}
              {actionType === "resolve" && "Mark this report as resolved after taking appropriate action."}
              {actionType === "suspend" && `This will immediately suspend ${selectedReport?.community_head?.profile?.name} and resolve the report.`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="notes">Resolution Notes</Label>
            <Textarea
              id="notes"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Enter notes about this resolution..."
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)}>Cancel</Button>
            <Button 
              variant={actionType === "suspend" ? "destructive" : "default"}
              onClick={() => selectedReport && resolveMutation.mutate({ 
                reportId: selectedReport.id, 
                notes: resolutionNotes,
                action: actionType!
              })}
            >
              {actionType === "dismiss" && "Dismiss Report"}
              {actionType === "resolve" && "Resolve Report"}
              {actionType === "suspend" && "Suspend & Resolve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
