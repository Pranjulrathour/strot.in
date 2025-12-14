import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { StatCardSkeleton } from "@/components/loading-skeleton";
import { Briefcase, Users, CheckCircle, Clock, Plus, ArrowRight, MapPin, Building2, Eye } from "lucide-react";
import type { Job, Application } from "@shared/schema";

export default function BusinessDashboard() {
  const { user } = useAuth();

  const { data: jobs, isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs/my"],
  });

  const { data: applications, isLoading: appsLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications/business"],
  });

  const isLoading = jobsLoading || appsLoading;

  const stats = {
    totalJobs: jobs?.length || 0,
    openJobs: jobs?.filter((j) => j.status === "open").length || 0,
    filledJobs: jobs?.filter((j) => j.status === "filled").length || 0,
    pendingApplications: applications?.filter((a) => a.status === "pending").length || 0,
  };

  const recentJobs = jobs?.slice(0, 4) || [];

  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      {/* Hero Section - Clean Green */}
      <div className="relative overflow-hidden rounded-3xl bg-primary border border-primary p-6 lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-white" />
              <span className="text-sm font-medium text-white/90">Business Portal</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
              Welcome back, {user?.name?.split(" ")[0]}
            </h1>
            <p className="text-white/90 max-w-md">
              Find skilled workers from local communities for your business needs
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl border-2 border-white/60 text-white bg-white/10 hover:bg-white/20" asChild>
              <Link href="/worker-matches">
                <Eye className="h-4 w-4 mr-2" />
                View Matches
              </Link>
            </Button>
            <Button size="lg" variant="secondary" className="rounded-xl bg-white text-primary border-2 border-white/60 hover:bg-white/90" asChild data-testid="button-post-job">
              <Link href="/post-job">
                <Plus className="h-4 w-4 mr-2" />
                Post a Job
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Jobs"
              value={stats.totalJobs}
              icon={Briefcase}
              subtitle="Posted by you"
            />
            <StatCard
              title="Open Positions"
              value={stats.openJobs}
              icon={Clock}
              subtitle="Accepting workers"
            />
            <StatCard
              title="Filled Positions"
              value={stats.filledJobs}
              icon={CheckCircle}
              subtitle="Successfully hired"
            />
            <StatCard
              title="Worker Matches"
              value={stats.pendingApplications}
              icon={Users}
              subtitle="Awaiting review"
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg">Your Job Postings</CardTitle>
              <CardDescription>Manage your open positions</CardDescription>
            </div>
            {recentJobs.length > 0 && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/my-jobs" data-testid="link-view-all-jobs">
                  View all
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-lg bg-muted/50 animate-pulse">
                    <div className="h-5 w-40 bg-muted rounded mb-2" />
                    <div className="h-4 w-24 bg-muted rounded" />
                  </div>
                ))}
              </div>
            ) : recentJobs.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No jobs posted"
                description="Post your first job to find skilled workers from local communities"
                action={
                  <Button asChild>
                    <Link href="/post-job">Post your first job</Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-lg border bg-card hover-elevate cursor-pointer"
                    data-testid={`job-item-${job.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h4 className="font-medium truncate">{job.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {job.location}
                          </span>
                          <span>·</span>
                          <span>{job.requiredSkill}</span>
                        </div>
                        {job.salaryRange && (
                          <p className="text-sm font-medium text-primary mt-2">
                            {job.salaryRange}
                          </p>
                        )}
                      </div>
                      <StatusBadge status={job.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hiring Process</CardTitle>
            <CardDescription>How STROT connects you with workers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  1
                </div>
                <div>
                  <p className="font-medium">Post job requirements</p>
                  <p className="text-sm text-muted-foreground">
                    Describe the role, skills needed, and salary range
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium">Community Head matches workers</p>
                  <p className="text-sm text-muted-foreground">
                    Local CH selects suitable workers from their community
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  3
                </div>
                <div>
                  <p className="font-medium">Review worker profiles</p>
                  <p className="text-sm text-muted-foreground">
                    View photos, skills, and experience of matched workers
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-sm font-medium">
                  4
                </div>
                <div>
                  <p className="font-medium">Confirm & hire</p>
                  <p className="text-sm text-muted-foreground">
                    Select the best candidate and confirm the placement
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
