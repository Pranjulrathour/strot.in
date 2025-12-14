import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { CardSkeleton } from "@/components/loading-skeleton";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, MapPin, Calendar, Users, ExternalLink, Check } from "lucide-react";
import { CopyablePhone } from "@/components/copyable-phone";
import type { Job, WorkerProfile, Application } from "@shared/schema";

export default function JobsPage() {
  const { toast } = useToast();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isWorkerDialogOpen, setIsWorkerDialogOpen] = useState(false);

  const { data: jobs, isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const { data: workers, isLoading: workersLoading } = useQuery<WorkerProfile[]>({
    queryKey: ["/api/workers/ch"],
  });

  const { data: applications } = useQuery<Application[]>({
    queryKey: ["/api/applications/ch"],
  });

  const applyMutation = useMutation({
    mutationFn: async ({ jobId, workerId }: { jobId: string; workerId: string }) => {
      return apiRequest("POST", "/api/applications", { jobId, workerId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications/ch"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
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

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const availableWorkers = workers?.filter((w) => w.status === "available") || [];

  const getMatchingWorkers = (job: Job) => {
    return availableWorkers.filter((w) => w.skill === job.requiredSkill);
  };

  const hasWorkerApplied = (jobId: string, workerId: string) => {
    return applications?.some((a) => a.jobId === jobId && a.workerId === workerId);
  };

  const openWorkerSelection = (job: Job) => {
    setSelectedJob(job);
    setIsWorkerDialogOpen(true);
  };

  const isLoading = jobsLoading || workersLoading;
  const openJobs = jobs?.filter((j) => j.status === "open") || [];

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Available Jobs</h1>
        <p className="text-muted-foreground">Match workers from your community to these positions</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : openJobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No open jobs"
          description="Businesses will post job requirements here. Check back later."
        />
      ) : (
        <div className="space-y-4">
          {openJobs.map((job) => (
            <Card key={job.id} className="overflow-visible" data-testid={`job-${job.id}`}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {job.location}
                            {(job as any).latitude && (job as any).longitude && (
                              <a
                                href={`https://www.google.com/maps?q=${(job as any).latitude},${(job as any).longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline ml-1"
                                title="Open in Google Maps"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </span>
                          <span>{job.requiredSkill}</span>
                        </div>
                      </div>
                      <StatusBadge status={job.status} />
                    </div>
                    
                    {job.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {job.description}
                      </p>
                    )}
                    
                    {job.salaryRange && (
                      <p className="text-sm font-medium text-primary">
                        {job.salaryRange}
                      </p>
                    )}

                    {(job as any).phone && (
                      <CopyablePhone phone={(job as any).phone} label="Contact:" />
                    )}
                    
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Posted {formatDate(job.createdAt)}
                      </span>
                      <Button
                        onClick={() => openWorkerSelection(job)}
                        disabled={getMatchingWorkers(job).length === 0}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Match Worker
                        {getMatchingWorkers(job).length > 0 && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {getMatchingWorkers(job).length}
                          </Badge>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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

          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
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
                    <Avatar className="h-14 w-14 shrink-0">
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
                      {(worker as any).phone && (
                        <CopyablePhone phone={(worker as any).phone} className="mt-1" />
                      )}
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
