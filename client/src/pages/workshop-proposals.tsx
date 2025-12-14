import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/empty-state";
import { CardSkeleton } from "@/components/loading-skeleton";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, MapPin, Users, Phone, Mail, User, Calendar, Check, X, ExternalLink } from "lucide-react";
import type { Workshop } from "@shared/schema";

interface WorkshopWithCreator extends Workshop {
  creator?: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
  };
}

export default function WorkshopProposalsPage() {
  const { toast } = useToast();
  const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopWithCreator | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");

  const { data: proposals, isLoading } = useQuery<WorkshopWithCreator[]>({
    queryKey: ["/api/workshops/proposals"],
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status, scheduleDate }: { id: string; status: string; scheduleDate?: string }) => {
      return apiRequest("PATCH", `/api/workshops/${id}/review`, { status, scheduleDate });
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workshops/proposals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workshops/ch"] });
      toast({
        title: status === "approved" ? "Workshop Approved!" : "Workshop Declined",
        description: status === "approved" 
          ? "The workshop has been scheduled. The proposer will be notified."
          : "The proposer will be notified of your decision.",
      });
      setIsReviewDialogOpen(false);
      setSelectedWorkshop(null);
      setScheduleDate("");
    },
    onError: (error) => {
      toast({
        title: "Failed to update",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const openReviewDialog = (workshop: WorkshopWithCreator) => {
    setSelectedWorkshop(workshop);
    setIsReviewDialogOpen(true);
  };

  const handleApprove = () => {
    if (!selectedWorkshop) return;
    if (!scheduleDate) {
      toast({
        title: "Please set a date",
        description: "Select a date for the workshop before approving",
        variant: "destructive",
      });
      return;
    }
    reviewMutation.mutate({ id: selectedWorkshop.id, status: "approved", scheduleDate });
  };

  const handleReject = () => {
    if (!selectedWorkshop) return;
    reviewMutation.mutate({ id: selectedWorkshop.id, status: "rejected" });
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Workshop Proposals</h1>
        <p className="text-muted-foreground">Review and approve workshop requests from community members</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !proposals || proposals.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No pending proposals"
          description="Workshop proposals from community members will appear here for your review"
        />
      ) : (
        <div className="space-y-4">
          {proposals.map((workshop) => (
            <Card key={workshop.id} className="border-ch-200 dark:border-ch-800/30">
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-ch-100 dark:bg-ch-900/30">
                    <GraduationCap className="h-7 w-7 text-ch-600 dark:text-ch-400" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-lg">{workshop.topic}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {workshop.location || "Location TBD"}
                            {(workshop as any).latitude && (workshop as any).longitude && (
                              <a
                                href={`https://www.google.com/maps?q=${(workshop as any).latitude},${(workshop as any).longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline ml-1"
                                title="Open in Google Maps"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {workshop.maxAttendees || 15} max attendees
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800">
                        Proposed
                      </Badge>
                    </div>

                    {workshop.description && (
                      <p className="text-sm text-muted-foreground">
                        {workshop.description}
                      </p>
                    )}

                    {/* Proposer Details */}
                    <div className="bg-ch-50 dark:bg-ch-950/20 rounded-lg p-4 space-y-2">
                      <h4 className="text-sm font-medium text-ch-700 dark:text-ch-300">Proposed by</h4>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{workshop.creator?.name || "Unknown"}</span>
                        </div>
                        {workshop.creator?.phone && (
                          <a 
                            href={`tel:${workshop.creator.phone}`}
                            className="flex items-center gap-2 text-sm text-ch-600 dark:text-ch-400 hover:underline"
                          >
                            <Phone className="h-4 w-4" />
                            {workshop.creator.phone}
                          </a>
                        )}
                        {workshop.creator?.email && (
                          <a 
                            href={`mailto:${workshop.creator.email}`}
                            className="flex items-center gap-2 text-sm text-ch-600 dark:text-ch-400 hover:underline truncate"
                          >
                            <Mail className="h-4 w-4" />
                            {workshop.creator.email}
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        className="bg-ch-500 hover:bg-ch-600 text-white"
                        onClick={() => openReviewDialog(workshop)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Review & Approve
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Workshop Proposal</DialogTitle>
            <DialogDescription>
              {selectedWorkshop?.topic} by {selectedWorkshop?.creator?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="scheduleDate">
                <Calendar className="h-4 w-4 inline mr-1" />
                Workshop Date
              </Label>
              <Input
                id="scheduleDate"
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-muted-foreground">
                Set the date when this workshop will be conducted
              </p>
            </div>

            {selectedWorkshop?.creator?.phone && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">
                  Contact the proposer to finalize details:
                </p>
                <a 
                  href={`tel:${selectedWorkshop.creator.phone}`}
                  className="text-sm font-medium text-ch-600 dark:text-ch-400 hover:underline"
                >
                  📞 {selectedWorkshop.creator.phone}
                </a>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={reviewMutation.isPending}
            >
              <X className="h-4 w-4 mr-2" />
              Decline
            </Button>
            <Button
              className="bg-ch-500 hover:bg-ch-600 text-white"
              onClick={handleApprove}
              disabled={reviewMutation.isPending}
            >
              <Check className="h-4 w-4 mr-2" />
              Approve & Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
