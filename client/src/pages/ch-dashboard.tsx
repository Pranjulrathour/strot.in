import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { StatCardSkeleton, CardSkeleton } from "@/components/loading-skeleton";
import {
  Heart,
  Briefcase,
  Users,
  GraduationCap,
  Award,
  ArrowRight,
  Package,
  Clock,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { CopyablePhone } from "@/components/copyable-phone";
import type { Donation, Job, WorkerProfile, Workshop, CommunityHead } from "@shared/schema";

export default function CHDashboard() {
  const { user } = useAuth();

  const { data: chProfile } = useQuery<CommunityHead>({
    queryKey: ["/api/community-heads/me"],
  });

  const { data: donations, isLoading: donationsLoading } = useQuery<Donation[]>({
    queryKey: ["/api/donations/ch"],
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const { data: workers, isLoading: workersLoading } = useQuery<WorkerProfile[]>({
    queryKey: ["/api/workers/ch"],
  });

  const { data: workshops, isLoading: workshopsLoading } = useQuery<Workshop[]>({
    queryKey: ["/api/workshops/ch"],
  });

  const isLoading = donationsLoading || jobsLoading || workersLoading || workshopsLoading;

  const pendingDonations = donations?.filter((d) => d.status === "pending") || [];
  const claimedDonations = donations?.filter((d) => d.status === "claimed") || [];
  const openJobs = jobs?.filter((j) => j.status === "open") || [];
  const availableWorkers = workers?.filter((w) => w.status === "available") || [];
  const upcomingWorkshops = workshops?.filter((w) => w.status === "approved") || [];

  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      {/* Hero Section - Clean Blue */}
      <div className="relative overflow-hidden rounded-3xl bg-primary border border-primary p-6 lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-white text-primary">
                <TrendingUp className="h-3 w-3 mr-1" />
                Score: {chProfile?.performanceScore || 0}
              </Badge>
              <StatusBadge status={chProfile?.status || "pending"} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
              Community Head Dashboard
            </h1>
            <p className="text-white/90 max-w-md">
              Managing <span className="font-medium text-white">{chProfile?.locality || "your locality"}</span> · 
              Empowering your community through donations, jobs, and skill development
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl border-2 border-white/60 text-white bg-white/10 hover:bg-white/20" asChild>
              <Link href="/workers">
                <Users className="h-4 w-4 mr-2" />
                Add Worker
              </Link>
            </Button>
            <Button variant="secondary" className="rounded-xl bg-white text-primary border-2 border-white/60 hover:bg-white/90" asChild>
              <Link href="/job-allocation">
                <UserPlus className="h-4 w-4 mr-2" />
                Allocate Jobs
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Pending Donations"
              value={pendingDonations.length}
              icon={Clock}
              subtitle="Ready to claim"
            />
            <StatCard
              title="In Delivery"
              value={claimedDonations.length}
              icon={Package}
              subtitle="Being delivered"
            />
            <StatCard
              title="Open Jobs"
              value={openJobs.length}
              icon={Briefcase}
              subtitle="Need workers"
            />
            <StatCard
              title="Available Workers"
              value={availableWorkers.length}
              icon={Users}
              subtitle="Ready for work"
            />
            <StatCard
              title="Upcoming Workshops"
              value={upcomingWorkshops.length}
              icon={GraduationCap}
              subtitle="Scheduled"
            />
          </>
        )}
      </div>

      <Tabs defaultValue="donations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="donations" data-testid="tab-donations">
            <Heart className="h-4 w-4 mr-2 hidden sm:inline" />
            Donations
          </TabsTrigger>
          <TabsTrigger value="jobs" data-testid="tab-jobs">
            <Briefcase className="h-4 w-4 mr-2 hidden sm:inline" />
            Jobs
          </TabsTrigger>
          <TabsTrigger value="workers" data-testid="tab-workers">
            <Users className="h-4 w-4 mr-2 hidden sm:inline" />
            Workers
          </TabsTrigger>
          <TabsTrigger value="workshops" data-testid="tab-workshops">
            <GraduationCap className="h-4 w-4 mr-2 hidden sm:inline" />
            Workshops
          </TabsTrigger>
        </TabsList>

        <TabsContent value="donations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg">Pending Donations</CardTitle>
                <CardDescription>Claim and deliver donations to your community</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/donations">
                  View all
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {donationsLoading ? (
                <div className="space-y-3">
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
              ) : pendingDonations.length === 0 ? (
                <EmptyState
                  icon={Heart}
                  title="No pending donations"
                  description="All donations have been claimed or delivered"
                />
              ) : (
                <div className="space-y-3">
                  {pendingDonations.slice(0, 3).map((donation) => (
                    <div
                      key={donation.id}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-card hover-elevate"
                      data-testid={`pending-donation-${donation.id}`}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                        <Heart className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium">{donation.itemName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {donation.category} · Qty: {donation.quantity}
                        </p>
                      </div>
                      <Button size="sm" data-testid={`button-claim-${donation.id}`}>
                        Claim
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg">Open Job Positions</CardTitle>
                <CardDescription>Match workers from your community to these jobs</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/jobs">
                  View all
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="space-y-3">
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
              ) : openJobs.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title="No open jobs"
                  description="No businesses have posted jobs yet"
                />
              ) : (
                <div className="space-y-3">
                  {openJobs.slice(0, 3).map((job) => (
                    <div
                      key={job.id}
                      className="p-4 rounded-lg border bg-card hover-elevate"
                      data-testid={`open-job-${job.id}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-medium">{job.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {job.requiredSkill} · {job.location}
                          </p>
                          {job.salaryRange && (
                            <p className="text-sm font-medium text-primary mt-1">
                              {job.salaryRange}
                            </p>
                          )}
                        </div>
                        <Button size="sm" variant="outline">
                          Match Worker
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workers" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg">Worker Profiles</CardTitle>
                <CardDescription>Manage workers from your community</CardDescription>
              </div>
              <Button asChild>
                <Link href="/workers">
                  Add Worker
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {workersLoading ? (
                <div className="space-y-3">
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
              ) : availableWorkers.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No workers added"
                  description="Add skilled workers from your community to match them with jobs"
                  action={
                    <Button asChild>
                      <Link href="/workers">Add your first worker</Link>
                    </Button>
                  }
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {availableWorkers.slice(0, 4).map((worker) => (
                    <div
                      key={worker.id}
                      className="p-4 rounded-lg border bg-card hover-elevate"
                      data-testid={`worker-${worker.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ch-100 text-ch-700 font-medium">
                          {worker.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{worker.name}</h4>
                          <p className="text-sm text-muted-foreground">{worker.skill}</p>
                        </div>
                        <StatusBadge status={worker.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workshops" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg">Workshops</CardTitle>
                <CardDescription>Review and manage skill development workshops</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/workshops">
                  View all
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {workshopsLoading ? (
                <div className="space-y-3">
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
              ) : upcomingWorkshops.length === 0 ? (
                <EmptyState
                  icon={GraduationCap}
                  title="No upcoming workshops"
                  description="Workshops proposed by instructors will appear here for your approval"
                />
              ) : (
                <div className="space-y-3">
                  {upcomingWorkshops.slice(0, 3).map((workshop) => (
                    <div
                      key={workshop.id}
                      className="p-4 rounded-lg border bg-card hover-elevate"
                      data-testid={`workshop-${workshop.id}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-medium">{workshop.topic}</h4>
                          <p className="text-sm text-muted-foreground">
                            {workshop.location} · {workshop.maxAttendees} max attendees
                          </p>
                          {(workshop as any).phone && (
                            <CopyablePhone phone={(workshop as any).phone} label="Tutor:" className="mt-2" />
                          )}
                          {workshop.scheduleDate && (
                            <p className="text-sm text-primary mt-1">
                              {new Date(workshop.scheduleDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <StatusBadge status={workshop.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
