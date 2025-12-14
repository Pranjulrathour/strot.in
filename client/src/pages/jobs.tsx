import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { CardSkeleton } from "@/components/loading-skeleton";
import { Briefcase, MapPin, Calendar, Users, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import type { Job } from "@shared/schema";

export default function JobsPage() {
  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

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
                    
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Posted {formatDate(job.createdAt)}
                      </span>
                      <Button asChild>
                        <Link href="/workers">
                          <Users className="h-4 w-4 mr-2" />
                          Match Worker
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
