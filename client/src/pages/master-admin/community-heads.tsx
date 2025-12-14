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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { 
  Users, Check, X, Clock, AlertTriangle, Calendar, 
  MapPin, TrendingUp, MoreVertical, Search, Filter,
  UserPlus, Ban, RefreshCw
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CommunityHead {
  id: string;
  user_id: string;
  locality: string;
  status: string;
  performance_score: number;
  tenure_start: string | null;
  tenure_end: string | null;
  tenure_start_date: string | null;
  tenure_end_date: string | null;
  is_suspended: boolean;
  suspension_reason: string | null;
  total_donations_handled: number;
  total_jobs_placed: number;
  total_workshops_hosted: number;
  created_at: string;
  slum_area_id: string | null;
  profile?: {
    name: string;
    email: string;
    phone: string;
  };
  slum_area?: {
    name: string;
    city: string;
  };
}

interface SlumArea {
  id: string;
  name: string;
  city: string;
}

async function fetchCommunityHeads(): Promise<CommunityHead[]> {
  // Get current Master Admin's ID to filter only their managed CHs
  const { data: authData } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from("community_heads")
    .select(`
      *,
      profile:profiles!community_heads_user_id_fkey(name, email, phone),
      slum_area:slum_areas(name, city)
    `)
    .eq("approved_by", authData.user?.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

async function fetchSlumAreas(): Promise<SlumArea[]> {
  const { data, error } = await supabase
    .from("slum_areas")
    .select("id, name, city")
    .eq("is_active", true)
    .order("name");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export default function CommunityHeadsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCH, setSelectedCH] = useState<CommunityHead | null>(null);
  const [actionType, setActionType] = useState<"approve" | "suspend" | "extend" | "assign" | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [tenureEndDate, setTenureEndDate] = useState("");
  const [selectedSlumArea, setSelectedSlumArea] = useState("");

  const { data: communityHeads, isLoading } = useQuery({
    queryKey: ["/api/master-admin/community-heads"],
    queryFn: fetchCommunityHeads,
  });

  const { data: slumAreas } = useQuery({
    queryKey: ["/api/slum-areas"],
    queryFn: fetchSlumAreas,
  });

  const approveMutation = useMutation({
    mutationFn: async (chId: string) => {
      const { error } = await supabase
        .from("community_heads")
        .update({ 
          status: "active",
          tenure_start_date: new Date().toISOString().split("T")[0],
          tenure_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        })
        .eq("id", chId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master-admin/community-heads"] });
      toast({ title: "Community Head approved successfully" });
      setSelectedCH(null);
      setActionType(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to approve", description: error.message, variant: "destructive" });
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async ({ chId, reason }: { chId: string; reason: string }) => {
      const { error } = await supabase
        .from("community_heads")
        .update({ 
          is_suspended: true,
          suspension_reason: reason,
          status: "suspended",
        })
        .eq("id", chId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master-admin/community-heads"] });
      toast({ title: "Community Head suspended" });
      setSelectedCH(null);
      setActionType(null);
      setSuspensionReason("");
    },
    onError: (error: Error) => {
      toast({ title: "Failed to suspend", description: error.message, variant: "destructive" });
    },
  });

  const extendTenureMutation = useMutation({
    mutationFn: async ({ chId, endDate }: { chId: string; endDate: string }) => {
      const { error } = await supabase
        .from("community_heads")
        .update({ tenure_end_date: endDate })
        .eq("id", chId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master-admin/community-heads"] });
      toast({ title: "Tenure extended successfully" });
      setSelectedCH(null);
      setActionType(null);
      setTenureEndDate("");
    },
    onError: (error: Error) => {
      toast({ title: "Failed to extend tenure", description: error.message, variant: "destructive" });
    },
  });

  const assignAreaMutation = useMutation({
    mutationFn: async ({ chId, areaId }: { chId: string; areaId: string }) => {
      const { error } = await supabase
        .from("community_heads")
        .update({ slum_area_id: areaId })
        .eq("id", chId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master-admin/community-heads"] });
      toast({ title: "Area assigned successfully" });
      setSelectedCH(null);
      setActionType(null);
      setSelectedSlumArea("");
    },
    onError: (error: Error) => {
      toast({ title: "Failed to assign area", description: error.message, variant: "destructive" });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: async (chId: string) => {
      const { error } = await supabase
        .from("community_heads")
        .update({ 
          is_suspended: false,
          suspension_reason: null,
          status: "active",
        })
        .eq("id", chId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master-admin/community-heads"] });
      toast({ title: "Community Head reactivated" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to reactivate", description: error.message, variant: "destructive" });
    },
  });

  const filteredCHs = communityHeads?.filter((ch) => {
    const matchesSearch = 
      ch.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.locality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ch.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (ch: CommunityHead) => {
    if (ch.is_suspended) {
      return <Badge variant="destructive">Suspended</Badge>;
    }
    switch (ch.status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending Approval</Badge>;
      case "expired":
        return <Badge variant="outline">Expired</Badge>;
      default:
        return <Badge variant="outline">{ch.status}</Badge>;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Community Heads</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor community head operations</p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add New CH
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or locality..."
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredCHs?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No community heads found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        ) : (
          filteredCHs?.map((ch) => (
            <Card key={ch.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{ch.profile?.name || "Unknown"}</h3>
                        {getStatusBadge(ch)}
                      </div>
                      <p className="text-sm text-muted-foreground">{ch.profile?.email}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {ch.slum_area?.name || ch.locality || "No area assigned"}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Score: {ch.performance_score}
                        </span>
                        {ch.tenure_end_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Tenure ends: {new Date(ch.tenure_end_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right text-sm mr-4">
                      <div className="flex gap-4">
                        <span className="text-muted-foreground">
                          Donations: <span className="font-medium text-foreground">{ch.total_donations_handled}</span>
                        </span>
                        <span className="text-muted-foreground">
                          Jobs: <span className="font-medium text-foreground">{ch.total_jobs_placed}</span>
                        </span>
                        <span className="text-muted-foreground">
                          Workshops: <span className="font-medium text-foreground">{ch.total_workshops_hosted}</span>
                        </span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {ch.status === "pending" && (
                          <DropdownMenuItem onClick={() => { setSelectedCH(ch); setActionType("approve"); }}>
                            <Check className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                        )}
                        {ch.status === "active" && !ch.is_suspended && (
                          <>
                            <DropdownMenuItem onClick={() => { setSelectedCH(ch); setActionType("extend"); }}>
                              <Calendar className="h-4 w-4 mr-2" />
                              Extend Tenure
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedCH(ch); setActionType("assign"); }}>
                              <MapPin className="h-4 w-4 mr-2" />
                              Assign Area
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => { setSelectedCH(ch); setActionType("suspend"); }}
                              className="text-destructive"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          </>
                        )}
                        {ch.is_suspended && (
                          <DropdownMenuItem onClick={() => reactivateMutation.mutate(ch.id)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reactivate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {ch.is_suspended && ch.suspension_reason && (
                  <div className="mt-4 p-3 bg-destructive/10 rounded-lg">
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Suspension reason: {ch.suspension_reason}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={actionType === "approve"} onOpenChange={() => setActionType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Community Head</DialogTitle>
            <DialogDescription>
              This will activate {selectedCH?.profile?.name} as a Community Head with a 30-day initial tenure.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)}>Cancel</Button>
            <Button onClick={() => selectedCH && approveMutation.mutate(selectedCH.id)}>
              <Check className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={actionType === "suspend"} onOpenChange={() => setActionType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Community Head</DialogTitle>
            <DialogDescription>
              This will immediately suspend {selectedCH?.profile?.name} from all activities.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Suspension Reason</Label>
            <Textarea
              id="reason"
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              placeholder="Enter the reason for suspension..."
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)}>Cancel</Button>
            <Button 
              variant="destructive"
              onClick={() => selectedCH && suspendMutation.mutate({ chId: selectedCH.id, reason: suspensionReason })}
              disabled={!suspensionReason.trim()}
            >
              <Ban className="h-4 w-4 mr-2" />
              Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={actionType === "extend"} onOpenChange={() => setActionType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Tenure</DialogTitle>
            <DialogDescription>
              Set a new tenure end date for {selectedCH?.profile?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="endDate">New End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={tenureEndDate}
              onChange={(e) => setTenureEndDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)}>Cancel</Button>
            <Button 
              onClick={() => selectedCH && extendTenureMutation.mutate({ chId: selectedCH.id, endDate: tenureEndDate })}
              disabled={!tenureEndDate}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Extend Tenure
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={actionType === "assign"} onOpenChange={() => setActionType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Slum Area</DialogTitle>
            <DialogDescription>
              Assign a slum area to {selectedCH?.profile?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="area">Slum Area</Label>
            <Select value={selectedSlumArea} onValueChange={setSelectedSlumArea}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select an area" />
              </SelectTrigger>
              <SelectContent>
                {slumAreas?.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name} - {area.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)}>Cancel</Button>
            <Button 
              onClick={() => selectedCH && assignAreaMutation.mutate({ chId: selectedCH.id, areaId: selectedSlumArea })}
              disabled={!selectedSlumArea}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Assign Area
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
