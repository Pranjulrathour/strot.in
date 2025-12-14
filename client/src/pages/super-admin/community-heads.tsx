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
import { Users, Search, Filter, MapPin, TrendingUp, Calendar, AlertTriangle } from "lucide-react";

interface CommunityHead {
  id: string;
  user_id: string;
  locality: string;
  status: string;
  performance_score: number;
  tenure_start_date: string | null;
  tenure_end_date: string | null;
  is_suspended: boolean;
  suspension_reason: string | null;
  total_donations_handled: number;
  total_jobs_placed: number;
  total_workshops_hosted: number;
  created_at: string;
  slum_area_id: string | null;
  approved_by: string | null;
  profile?: {
    name: string;
    email: string;
    phone: string;
  };
  slum_area?: {
    name: string;
    city: string;
  };
  master_admin?: {
    profile?: {
      name: string;
    };
    city: string;
  };
}

async function fetchAllCommunityHeads(): Promise<CommunityHead[]> {
  // Fetch community heads first
  const { data, error } = await supabase
    .from("community_heads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching community heads:", error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Fetch related data separately for each CH
  const chsWithData = await Promise.all(
    data.map(async (ch) => {
      // Get profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("name, email, phone")
        .eq("id", ch.user_id)
        .maybeSingle();

      // Get slum area if exists
      let slumAreaData = null;
      if (ch.slum_area_id) {
        const { data: slum } = await supabase
          .from("slum_areas")
          .select("name, city")
          .eq("id", ch.slum_area_id)
          .maybeSingle();
        slumAreaData = slum;
      }

      // Get master admin if exists
      let masterAdminData = null;
      if (ch.approved_by) {
        const { data: ma } = await supabase
          .from("master_admins")
          .select("city, user_id")
          .eq("id", ch.approved_by)
          .maybeSingle();
        
        if (ma) {
          const { data: maProfile } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", ma.user_id)
            .maybeSingle();
          
          masterAdminData = {
            city: ma.city,
            profile: maProfile,
          };
        }
      }

      return {
        ...ch,
        profile: profileData || { name: "Unknown", email: "", phone: "" },
        slum_area: slumAreaData,
        master_admin: masterAdminData,
      };
    })
  );

  return chsWithData;
}

export default function SuperAdminCommunityHeads() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");

  const { data: communityHeads, isLoading } = useQuery({
    queryKey: ["/api/super-admin/community-heads"],
    queryFn: fetchAllCommunityHeads,
  });

  const filteredCHs = communityHeads?.filter((ch) => {
    const matchesSearch = 
      ch.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.locality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ch.status === statusFilter;
    
    const matchesCity = cityFilter === "all" || 
      ch.slum_area?.city === cityFilter || 
      ch.master_admin?.city === cityFilter;
    
    return matchesSearch && matchesStatus && matchesCity;
  });

  const cities = Array.from(new Set(
    communityHeads?.map(ch => ch.slum_area?.city || ch.master_admin?.city).filter(Boolean)
  )).sort();

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

  const stats = {
    total: communityHeads?.length ?? 0,
    active: communityHeads?.filter(ch => ch.status === "active").length ?? 0,
    pending: communityHeads?.filter(ch => ch.status === "pending").length ?? 0,
    suspended: communityHeads?.filter(ch => ch.is_suspended).length ?? 0,
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
        <h1 className="text-3xl font-semibold tracking-tight">All Community Heads</h1>
        <p className="text-muted-foreground mt-1">System-wide Community Head overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Community Heads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-500">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Pending Approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-500">{stats.suspended}</div>
            <p className="text-xs text-muted-foreground">Suspended</p>
          </CardContent>
        </Card>
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
        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-[180px]">
            <MapPin className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by city" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city!}>{city}</SelectItem>
            ))}
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
                          {ch.slum_area?.name || ch.locality || "No area"}
                        </span>
                        {ch.slum_area?.city && (
                          <span className="text-muted-foreground">• {ch.slum_area.city}</span>
                        )}
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
                      {ch.master_admin && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Managed by: {ch.master_admin.profile?.name} ({ch.master_admin.city})
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right text-sm">
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
    </div>
  );
}
