import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { CardSkeleton } from "@/components/loading-skeleton";
import { useToast } from "@/hooks/use-toast";
import { Users, Check, X, Briefcase } from "lucide-react";
import type { Application, WorkerProfile, Job } from "@shared/schema";

interface ApplicationWithDetails extends Application {
  worker?: WorkerProfile;
  job?: Job;
}

export default function WorkerMatchesPage() {
  const { toast } = useToast();

  const { data: applications, isLoading } = useQuery<ApplicationWithDetails[]>({
    queryKey: ["/api/applications/business"],
  });

  const decideMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "selected" | "rejected" }) => {
      return apiRequest("PATCH", `/api/applications/${id}`, { status });
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications/business"] });
      toast({
        title: status === "selected" ? "Worker selected!" : "Application declined",
        description: status === "selected"
          ? "The placement has been confirmed."
          : "The worker has been notified.",
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

  const pendingApplications = applications?.filter((a) => a.status === "pending") || [];
  const decidedApplications = applications?.filter((a) => a.status !== "pending") || [];

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Worker Matches</h1>
        <p className="text-muted-foreground">Review workers matched to your job postings</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !applications || applications.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No matches yet"
          description="Community Heads will match suitable workers to your job postings. Check back soon."
        />
      ) : (
        <div className="space-y-6">
          {pendingApplications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pending Review</CardTitle>
                <CardDescription>Workers matched to your jobs awaiting your decision</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingApplications.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 rounded-lg border bg-card"
                      data-testid={`pending-match-${app.id}`}
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Avatar className="h-16 w-16">
                          {app.worker?.photos && app.worker.photos.length > 0 ? (
                            <img
                              src={app.worker.photos[0]}
                              alt={app.worker.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                              {app.worker?.name?.charAt(0) || "W"}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-semibold text-lg">{app.worker?.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {app.worker?.skill} · {app.worker?.age} years old
                              </p>
                            </div>
                            <StatusBadge status={app.status} />
                          </div>
                          {app.worker?.experience && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {app.worker.experience}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-sm">
                            <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">For:</span>
                            <span className="font-medium">{app.job?.title}</span>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button
                              variant="outline"
                              onClick={() => decideMutation.mutate({ id: app.id, status: "rejected" })}
                              disabled={decideMutation.isPending}
                              data-testid={`button-reject-${app.id}`}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Decline
                            </Button>
                            <Button
                              onClick={() => decideMutation.mutate({ id: app.id, status: "selected" })}
                              disabled={decideMutation.isPending}
                              data-testid={`button-select-${app.id}`}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Select & Hire
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

          {decidedApplications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Decision History</CardTitle>
                <CardDescription>Past worker matches and your decisions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {decidedApplications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-muted/30"
                      data-testid={`decided-match-${app.id}`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {app.worker?.name?.charAt(0) || "W"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{app.worker?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.worker?.skill} · {app.job?.title}
                        </p>
                      </div>
                      <StatusBadge status={app.status} />
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
