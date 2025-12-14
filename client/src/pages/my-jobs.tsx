import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { CardSkeleton } from "@/components/loading-skeleton";
import { ArrowLeft, Briefcase, Plus, MapPin, Calendar, Users } from "lucide-react";
import type { Job } from "@shared/schema";

export default function MyJobsPage() {
  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs/my"],
  });

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="lg:hidden">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">My Jobs</h1>
            <p className="text-muted-foreground">Manage your job postings</p>
          </div>
        </div>
        <Button asChild data-testid="button-new-job">
          <Link href="/post-job">
            <Plus className="h-4 w-4 mr-2" />
            Post Job
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !jobs || jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs posted"
          description="Post your first job to find skilled workers from local communities."
          action={
            <Button asChild>
              <Link href="/post-job">Post your first job</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="overflow-visible" data-testid={`job-card-${job.id}`}>
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
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Posted {formatDate(job.createdAt)}
                      </span>
                    </div>

                    {job.status === "open" && (
                      <div className="flex gap-2 pt-3">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/worker-matches">
                            <Users className="h-4 w-4 mr-2" />
                            View Matches
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          Close Job
                        </Button>
                      </div>
                    )}
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
