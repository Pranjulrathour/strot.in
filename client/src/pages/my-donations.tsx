import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { CardSkeleton } from "@/components/loading-skeleton";
import { ArrowLeft, Heart, Plus, Calendar, Package } from "lucide-react";
import type { Donation } from "@shared/schema";

export default function MyDonationsPage() {
  const { data: donations, isLoading } = useQuery<Donation[]>({
    queryKey: ["/api/donations/my"],
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
            <h1 className="text-2xl font-semibold tracking-tight">My Donations</h1>
            <p className="text-muted-foreground">Track the status of your donations</p>
          </div>
        </div>
        <Button asChild data-testid="button-new-donation">
          <Link href="/donate">
            <Plus className="h-4 w-4 mr-2" />
            Donate
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !donations || donations.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No donations yet"
          description="Your donation history will appear here. Start by donating items to those in need."
          action={
            <Button asChild>
              <Link href="/donate">Make your first donation</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {donations.map((donation) => (
            <Card key={donation.id} className="overflow-visible" data-testid={`donation-card-${donation.id}`}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {donation.images && donation.images.length > 0 ? (
                    <div className="w-full sm:w-24 h-32 sm:h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img
                        src={donation.images[0]}
                        alt={donation.itemName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full sm:w-24 h-32 sm:h-24 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{donation.itemName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {donation.category} · Quantity: {donation.quantity}
                        </p>
                      </div>
                      <StatusBadge status={donation.status} />
                    </div>
                    
                    {donation.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {donation.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Listed {formatDate(donation.createdAt)}
                      </span>
                      {donation.status === "claimed" && donation.claimedAt && (
                        <span>Claimed {formatDate(donation.claimedAt)}</span>
                      )}
                      {donation.status === "delivered" && donation.deliveredAt && (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Delivered {formatDate(donation.deliveredAt)}
                        </span>
                      )}
                    </div>

                    {donation.status === "delivered" && donation.proofImage && (
                      <div className="pt-3">
                        <p className="text-sm font-medium mb-2">Proof of Delivery</p>
                        <div className="w-32 h-24 rounded-lg overflow-hidden border">
                          <img
                            src={donation.proofImage}
                            alt="Proof of delivery"
                            className="w-full h-full object-cover"
                          />
                        </div>
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
