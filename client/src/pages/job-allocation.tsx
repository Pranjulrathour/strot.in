import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { CardSkeleton } from "@/components/loading-skeleton";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, MapPin, Users, Check, Sparkles, Clock, CheckCircle, XCircle } from "lucide-react";
import type { Job, WorkerProfile, Application } from "@shared/schema";

interface JobWithMatching extends Job {
  hasMatchingWorker?: boolean;
}

interface ApplicationWithDetails extends Application {
  worker?: WorkerProfile;
  job?: Job;
}

export default function JobAllocationPage() {
  const { toast } = useToast();
  const [selectedJob, setSelectedJob] = useState<JobWithMatching | null>(null);
  const [isWorkerDialogOpen, setIsWorkerDialogOpen] = useState(false);

  const { data: jobs, isLoading: jobsLoading } = useQuery<JobWithMatching[]>({
    queryKey: ["/api/jobs/matching"],
  });

  const { data: workers, isLoading: workersLoading } = useQuery<WorkerProfile[]>({
    queryKey: ["/api/workers/ch"],
  });

  const { data: applications, isLoading: appsLoading } = useQuery<ApplicationWithDetails[]>({
    queryKey: ["/api/applications/ch"],
  });

  const applyMutation = useMutation({
    mutationFn: async ({ jobId, workerId }: { jobId: string; workerId: string }) => {
      return apiRequest("POST", "/api/applications", { jobId, workerId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications/ch"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/matching"] });
      toast({
        title: "Worker applied!",
        description: "The business will review and respond to your application.",
      });
      setIsWorkerDialogOpen(false);
      setSelectedJob(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to apply",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const isLoading = jobsLoading || workersLoading || appsLoading;

  const availableWorkers = workers?.filter((w) => w.status === "available") || [];
  const pendingApplications = applications?.filter((a) => a.status === "pending") || [];
  const decidedApplications = applications?.filter((a) => a.status !== "pending") || [];

  const getMatchingWorkers = (job: JobWithMatching) => {
    return availableWorkers.filter((w) => w.skill === job.requiredSkill);
  };

  const hasWorkerApplied = (jobId: string, workerId: string) => {
    return applications?.some((a) => a.jobId === jobId && a.workerId === workerId);
  };

  const openWorkerSelection = (job: JobWithMatching) => {
    setSelectedJob(job);
    setIsWorkerDialogOpen(true);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Job Allocation</h1>
        <p className="text-muted-foreground">Match workers from your community to available jobs</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Available Jobs Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Available Jobs</h2>
              <Badge variant="secondary">{jobs?.length || 0}</Badge>
            </div>

            {!jobs || jobs.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No open jobs"
                description="Businesses will post job requirements here. Check back later."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {jobs.map((job) => {
                  const matchingWorkers = getMatchingWorkers(job);
                  return (
                    <Card key={job.id} className="relative overflow-visible">
                      {job.hasMatchingWorker && (
                        <div className="absolute -top-2 -right-2">
                          <Badge className="bg-emerald-500 hover:bg-emerald-600">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Match
                          </Badge>
                        </div>
                      )}
                      <CardContent className="p-5">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {job.location}
                              </span>
                              <span>·</span>
                              <Badge variant="outline">{job.requiredSkill}</Badge>
                            </div>
                          </div>

                          {job.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {job.description}
                            </p>
                          )}

                          {job.salaryRange && (
                            <p className="text-sm font-medium text-primary">{job.salaryRange}</p>
                          )}

                          <div className="flex items-center justify-between pt-2">
                            <span className="text-sm text-muted-foreground">
                              {matchingWorkers.length} matching worker{matchingWorkers.length !== 1 ? "s" : ""}
                            </span>
                            <Button
                              size="sm"
                              onClick={() => openWorkerSelection(job)}
                              disabled={matchingWorkers.length === 0}
                            >
                              <Users className="h-4 w-4 mr-2" />
                              Apply Worker
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending Applications Section */}
          {pendingApplications.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-semibold">Pending Applications</h2>
                <Badge variant="secondary">{pendingApplications.length}</Badge>
              </div>

              <div className="grid gap-3">
                {pendingApplications.map((app) => (
                  <Card key={app.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          {app.worker?.photos && app.worker.photos.length > 0 ? (
                            <img
                              src={app.worker.photos[0]}
                              alt={app.worker.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {app.worker?.name?.charAt(0) || "W"}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{app.worker?.name}</span>
                            <StatusBadge status={app.status} />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {app.worker?.skill} → {app.job?.title}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-amber-600 border-amber-300">
                          Awaiting Review
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Application History Section */}
          {decidedApplications.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Application History</h2>
              </div>

              <div className="grid gap-3">
                {decidedApplications.map((app) => (
                  <Card key={app.id} className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {app.worker?.name?.charAt(0) || "W"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">{app.worker?.name}</span>
                          <p className="text-sm text-muted-foreground">
                            {app.worker?.skill} · {app.job?.title}
                          </p>
                        </div>
                        {app.status === "selected" ? (
                          <Badge className="bg-emerald-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Hired
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="h-3 w-3 mr-1" />
                            Declined
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Worker Selection Dialog */}
      <Dialog open={isWorkerDialogOpen} onOpenChange={setIsWorkerDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Select Worker for {selectedJob?.title}</DialogTitle>
            <DialogDescription>
              Choose a worker with matching skills to apply for this position
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {selectedJob && getMatchingWorkers(selectedJob).length === 0 ? (
              <EmptyState
                icon={Users}
                title="No matching workers"
                description={`You don't have any available workers with "${selectedJob.requiredSkill}" skill`}
              />
            ) : (
              selectedJob &&
              getMatchingWorkers(selectedJob).map((worker) => {
                const alreadyApplied = hasWorkerApplied(selectedJob.id, worker.id);
                return (
                  <div
                    key={worker.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      alreadyApplied ? "bg-muted/50 opacity-60" : "bg-card hover:bg-muted/30"
                    }`}
                  >
                    <Avatar className="h-14 w-14">
                      {worker.photos && worker.photos.length > 0 ? (
                        <img
                          src={worker.photos[0]}
                          alt={worker.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                          {worker.name.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">{worker.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {worker.skill} · {worker.age} years
                      </p>
                      {worker.experience && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {worker.experience}
                        </p>
                      )}
                    </div>
                    {alreadyApplied ? (
                      <Badge variant="secondary">Applied</Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() =>
                          applyMutation.mutate({
                            jobId: selectedJob.id,
                            workerId: worker.id,
                          })
                        }
                        disabled={applyMutation.isPending}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Apply
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
