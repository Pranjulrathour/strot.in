import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { CardSkeleton } from "@/components/loading-skeleton";
import { useToast } from "@/hooks/use-toast";
import { Heart, Package, CheckCircle, Clock, Camera } from "lucide-react";
import type { Donation } from "@shared/schema";

export default function DonationsPage() {
  const { toast } = useToast();

  const { data: pendingDonations, isLoading: loadingPending } = useQuery<Donation[]>({
    queryKey: ["/api/donations/pending"],
  });

  const { data: myClaimedDonations, isLoading: loadingClaimed } = useQuery<Donation[]>({
    queryKey: ["/api/donations/ch"],
  });

  const claimMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("PATCH", `/api/donations/${id}/claim`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/donations/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/donations/ch"] });
      toast({ title: "Donation claimed!", description: "Pick up and deliver to those in need." });
    },
    onError: (error) => {
      toast({
        title: "Failed to claim",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const deliverMutation = useMutation({
    mutationFn: async ({ id, proofImage }: { id: string; proofImage: string }) => {
      return apiRequest("PATCH", `/api/donations/${id}/deliver`, { proofImage });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/donations/ch"] });
      toast({ title: "Marked as delivered!", description: "The donor has been notified." });
    },
    onError: (error) => {
      toast({
        title: "Failed to mark delivered",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleProofUpload = (donationId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        deliverMutation.mutate({ id: donationId, proofImage: event.target.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const availablePending = pendingDonations || [];
  const claimedDonations = myClaimedDonations?.filter((d) => d.status === "claimed") || [];
  const deliveredDonations = myClaimedDonations?.filter((d) => d.status === "delivered") || [];
  const isLoading = loadingPending || loadingClaimed;

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Donations</h1>
        <p className="text-muted-foreground">Claim and deliver donations to your community</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" data-testid="tab-pending">
            <Clock className="h-4 w-4 mr-2" />
            Available ({availablePending.length})
          </TabsTrigger>
          <TabsTrigger value="claimed" data-testid="tab-claimed">
            <Package className="h-4 w-4 mr-2" />
            Claimed ({claimedDonations.length})
          </TabsTrigger>
          <TabsTrigger value="delivered" data-testid="tab-delivered">
            <CheckCircle className="h-4 w-4 mr-2" />
            Delivered ({deliveredDonations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {isLoading ? (
            <div className="space-y-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : availablePending.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="No pending donations"
              description="New donations from donors will appear here for you to claim."
            />
          ) : (
            <div className="space-y-4">
              {availablePending.map((donation) => (
                <Card key={donation.id} data-testid={`pending-donation-${donation.id}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {donation.images && donation.images.length > 0 ? (
                        <div className="w-full sm:w-24 h-32 sm:h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                          <img src={donation.images[0]} alt={donation.itemName} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-full sm:w-24 h-32 sm:h-24 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-lg">{donation.itemName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {donation.category} · Qty: {donation.quantity}
                            </p>
                          </div>
                          <StatusBadge status={donation.status} />
                        </div>
                        {donation.description && (
                          <p className="text-sm text-muted-foreground mt-2">{donation.description}</p>
                        )}
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-sm text-muted-foreground">
                            Listed {formatDate(donation.createdAt)}
                          </span>
                          <Button
                            onClick={() => claimMutation.mutate(donation.id)}
                            disabled={claimMutation.isPending}
                            data-testid={`button-claim-${donation.id}`}
                          >
                            Claim Donation
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="claimed">
          {claimedDonations.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No claimed donations"
              description="Donations you've claimed will appear here."
            />
          ) : (
            <div className="space-y-4">
              {claimedDonations.map((donation) => (
                <Card key={donation.id} data-testid={`claimed-donation-${donation.id}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {donation.images && donation.images.length > 0 ? (
                        <div className="w-full sm:w-24 h-32 sm:h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                          <img src={donation.images[0]} alt={donation.itemName} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-full sm:w-24 h-32 sm:h-24 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-lg">{donation.itemName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {donation.category} · Qty: {donation.quantity}
                            </p>
                          </div>
                          <StatusBadge status={donation.status} />
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-sm text-muted-foreground">
                            Claimed {formatDate(donation.claimedAt)}
                          </span>
                          <label>
                            <Button asChild disabled={deliverMutation.isPending}>
                              <span className="cursor-pointer">
                                <Camera className="h-4 w-4 mr-2" />
                                Upload Proof & Deliver
                              </span>
                            </Button>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleProofUpload(donation.id, e)}
                              data-testid={`input-proof-${donation.id}`}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="delivered">
          {deliveredDonations.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="No delivered donations"
              description="Successfully delivered donations will appear here."
            />
          ) : (
            <div className="space-y-4">
              {deliveredDonations.map((donation) => (
                <Card key={donation.id} data-testid={`delivered-donation-${donation.id}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex gap-2 shrink-0">
                        {donation.images && donation.images.length > 0 && (
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted">
                            <img src={donation.images[0]} alt={donation.itemName} className="w-full h-full object-cover" />
                          </div>
                        )}
                        {donation.proofImage && (
                          <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-emerald-500">
                            <img src={donation.proofImage} alt="Proof" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold">{donation.itemName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {donation.category} · Qty: {donation.quantity}
                            </p>
                          </div>
                          <StatusBadge status={donation.status} />
                        </div>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                          Delivered {formatDate(donation.deliveredAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
