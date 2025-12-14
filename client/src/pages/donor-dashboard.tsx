import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { StatCardSkeleton, CardSkeleton } from "@/components/loading-skeleton";
import { Heart, Package, CheckCircle, Clock, Plus, ArrowRight } from "lucide-react";
import type { Donation } from "@shared/schema";

export default function DonorDashboard() {
  const { user } = useAuth();

  const { data: donations, isLoading } = useQuery<Donation[]>({
    queryKey: ["/api/donations/my"],
  });

  const stats = {
    total: donations?.length || 0,
    pending: donations?.filter((d) => d.status === "pending").length || 0,
    claimed: donations?.filter((d) => d.status === "claimed").length || 0,
    delivered: donations?.filter((d) => d.status === "delivered").length || 0,
  };

  const recentDonations = donations?.slice(0, 5) || [];

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground">
            Your donations are making a difference in communities
          </p>
        </div>
        <Button asChild data-testid="button-donate">
          <Link href="/donate">
            <Plus className="h-4 w-4 mr-2" />
            Donate Items
          </Link>
        </Button>
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
              title="Total Donations"
              value={stats.total}
              icon={Heart}
              subtitle="Items donated"
            />
            <StatCard
              title="Pending"
              value={stats.pending}
              icon={Clock}
              subtitle="Awaiting pickup"
            />
            <StatCard
              title="In Progress"
              value={stats.claimed}
              icon={Package}
              subtitle="Being delivered"
            />
            <StatCard
              title="Delivered"
              value={stats.delivered}
              icon={CheckCircle}
              subtitle="Successfully received"
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg">Recent Donations</CardTitle>
              <CardDescription>Your latest contribution history</CardDescription>
            </div>
            {recentDonations.length > 0 && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/my-donations" data-testid="link-view-all-donations">
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
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 animate-pulse">
                    <div className="h-10 w-10 rounded-lg bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-3 w-24 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentDonations.length === 0 ? (
              <EmptyState
                icon={Heart}
                title="No donations yet"
                description="Start making a difference by donating items to those in need"
                action={
                  <Button asChild>
                    <Link href="/donate">Make your first donation</Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {recentDonations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover-elevate"
                    data-testid={`donation-item-${donation.id}`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{donation.itemName}</p>
                      <p className="text-sm text-muted-foreground">
                        {donation.category} · Qty: {donation.quantity}
                      </p>
                    </div>
                    <StatusBadge status={donation.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How it works</CardTitle>
            <CardDescription>Your donation journey with STROT</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  1
                </div>
                <div>
                  <p className="font-medium">List your items</p>
                  <p className="text-sm text-muted-foreground">
                    Upload photos and describe items you want to donate
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium">Community Head claims</p>
                  <p className="text-sm text-muted-foreground">
                    A verified CH from a nearby locality will claim your donation
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  3
                </div>
                <div>
                  <p className="font-medium">Pickup & delivery</p>
                  <p className="text-sm text-muted-foreground">
                    Items are picked up and delivered to those in need
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-sm font-medium">
                  4
                </div>
                <div>
                  <p className="font-medium">Proof of delivery</p>
                  <p className="text-sm text-muted-foreground">
                    You receive confirmation with photo proof of delivery
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
