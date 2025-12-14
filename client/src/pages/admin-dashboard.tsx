import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { StatCardSkeleton, CardSkeleton } from "@/components/loading-skeleton";
import {
  Users,
  Heart,
  Briefcase,
  GraduationCap,
  MapPin,
  ArrowRight,
  CheckCircle,
  Clock,
  Shield,
} from "lucide-react";
import type { CommunityHead, Donation, Job, Workshop, User } from "@shared/schema";

interface CHWithUser extends CommunityHead {
  user?: User;
}

export default function AdminDashboard() {
  const { data: communityHeads, isLoading: chLoading } = useQuery<CHWithUser[]>({
    queryKey: ["/api/community-heads"],
  });

  const { data: donations, isLoading: donationsLoading } = useQuery<Donation[]>({
    queryKey: ["/api/donations"],
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const { data: workshops, isLoading: workshopsLoading } = useQuery<Workshop[]>({
    queryKey: ["/api/workshops"],
  });

  const isLoading = chLoading || donationsLoading || jobsLoading || workshopsLoading;

  const stats = {
    totalCH: communityHeads?.length || 0,
    activeCH: communityHeads?.filter((ch) => ch.status === "active").length || 0,
    pendingCH: communityHeads?.filter((ch) => ch.status === "pending").length || 0,
    totalDonations: donations?.length || 0,
    deliveredDonations: donations?.filter((d) => d.status === "delivered").length || 0,
    totalJobs: jobs?.length || 0,
    filledJobs: jobs?.filter((j) => j.status === "filled").length || 0,
    totalWorkshops: workshops?.length || 0,
  };

  const pendingCHApprovals = communityHeads?.filter((ch) => ch.status === "pending") || [];

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Platform overview and management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/community-heads">
              <Users className="h-4 w-4 mr-2" />
              Manage CH
            </Link>
          </Button>
        </div>
      </div>

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
              title="Community Heads"
              value={stats.activeCH}
              icon={Users}
              subtitle={`${stats.pendingCH} pending approval`}
            />
            <StatCard
              title="Donations"
              value={stats.totalDonations}
              icon={Heart}
              subtitle={`${stats.deliveredDonations} delivered`}
            />
            <StatCard
              title="Jobs"
              value={stats.totalJobs}
              icon={Briefcase}
              subtitle={`${stats.filledJobs} filled`}
            />
            <StatCard
              title="Workshops"
              value={stats.totalWorkshops}
              icon={GraduationCap}
              subtitle="Total conducted"
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg">Pending CH Approvals</CardTitle>
              <CardDescription>Community Head applications awaiting review</CardDescription>
            </div>
            {pendingCHApprovals.length > 0 && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/community-heads">
                  View all
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {chLoading ? (
              <div className="space-y-3">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : pendingCHApprovals.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                title="No pending approvals"
                description="All Community Head applications have been reviewed"
              />
            ) : (
              <div className="space-y-3">
                {pendingCHApprovals.slice(0, 4).map((ch) => (
                  <div
                    key={ch.id}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card hover-elevate"
                    data-testid={`pending-ch-${ch.id}`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                      <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">{ch.user?.name || "Unknown"}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {ch.locality}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" data-testid={`button-reject-${ch.id}`}>
                        Reject
                      </Button>
                      <Button size="sm" data-testid={`button-approve-${ch.id}`}>
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Platform Health</CardTitle>
            <CardDescription>Key metrics and performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Donation Delivery Rate</p>
                    <p className="text-xs text-muted-foreground">Items delivered / Total</p>
                  </div>
                </div>
                <span className="text-lg font-semibold">
                  {stats.totalDonations > 0
                    ? Math.round((stats.deliveredDonations / stats.totalDonations) * 100)
                    : 0}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                    <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Job Fill Rate</p>
                    <p className="text-xs text-muted-foreground">Positions filled / Total</p>
                  </div>
                </div>
                <span className="text-lg font-semibold">
                  {stats.totalJobs > 0
                    ? Math.round((stats.filledJobs / stats.totalJobs) * 100)
                    : 0}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Active Communities</p>
                    <p className="text-xs text-muted-foreground">Localities with active CH</p>
                  </div>
                </div>
                <span className="text-lg font-semibold">{stats.activeCH}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">Quick Actions</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/community-heads">Manage CH</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/donations">View Donations</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/jobs">View Jobs</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
