import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { CardSkeleton } from "@/components/loading-skeleton";
import { useToast } from "@/hooks/use-toast";
import { Users, MapPin, Calendar, Award, Check, X } from "lucide-react";
import type { CommunityHead, User } from "@shared/schema";

interface CHWithUser extends CommunityHead {
  user?: User;
}

export default function CommunityHeadsPage() {
  const { toast } = useToast();

  const { data: communityHeads, isLoading } = useQuery<CHWithUser[]>({
    queryKey: ["/api/community-heads"],
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, approve }: { id: string; approve: boolean }) => {
      return apiRequest("PATCH", `/api/community-heads/${id}`, {
        status: approve ? "active" : "suspended",
      });
    },
    onSuccess: (_, { approve }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/community-heads"] });
      toast({
        title: approve ? "Community Head approved!" : "Application rejected",
        description: approve
          ? "They can now manage their locality."
          : "The application has been declined.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: string | Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const pendingCHs = communityHeads?.filter((ch) => ch.status === "pending") || [];
  const activeCHs = communityHeads?.filter((ch) => ch.status === "active") || [];
  const otherCHs = communityHeads?.filter((ch) => !["pending", "active"].includes(ch.status)) || [];

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Community Heads</h1>
        <p className="text-muted-foreground">Manage Community Head applications and tenures</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !communityHeads || communityHeads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Community Heads"
          description="Community Head applications will appear here for your review."
        />
      ) : (
        <div className="space-y-6">
          {pendingCHs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pending Approvals</CardTitle>
                <CardDescription>Review and approve Community Head applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingCHs.map((ch) => (
                    <div
                      key={ch.id}
                      className="p-4 rounded-lg border bg-card"
                      data-testid={`pending-ch-${ch.id}`}
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Avatar className="h-14 w-14">
                          <AvatarFallback className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-lg font-semibold">
                            {ch.user?.name?.charAt(0) || "C"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-semibold text-lg">{ch.user?.name || "Unknown"}</h4>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {ch.locality}
                              </p>
                            </div>
                            <StatusBadge status={ch.status} />
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Phone: {ch.user?.phone ? `XXXX-XXX-${ch.user.phone.slice(-4)}` : "N/A"}
                          </p>
                          <div className="flex gap-2 mt-4">
                            <Button
                              variant="outline"
                              onClick={() => approveMutation.mutate({ id: ch.id, approve: false })}
                              disabled={approveMutation.isPending}
                              data-testid={`button-reject-ch-${ch.id}`}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button
                              onClick={() => approveMutation.mutate({ id: ch.id, approve: true })}
                              disabled={approveMutation.isPending}
                              data-testid={`button-approve-ch-${ch.id}`}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeCHs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Community Heads</CardTitle>
                <CardDescription>Currently managing localities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {activeCHs.map((ch) => (
                    <div
                      key={ch.id}
                      className="p-4 rounded-lg border bg-card"
                      data-testid={`active-ch-${ch.id}`}
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-semibold">
                            {ch.user?.name?.charAt(0) || "C"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold">{ch.user?.name || "Unknown"}</h4>
                            <StatusBadge status={ch.status} />
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {ch.locality}
                          </p>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              Score: {ch.performanceScore || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Since {formatDate(ch.tenureStart)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {otherCHs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Inactive / Expired</CardTitle>
                <CardDescription>Past Community Heads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {otherCHs.map((ch) => (
                    <div
                      key={ch.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                      data-testid={`other-ch-${ch.id}`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          {ch.user?.name?.charAt(0) || "C"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{ch.user?.name || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">{ch.locality}</p>
                      </div>
                      <StatusBadge status={ch.status} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
