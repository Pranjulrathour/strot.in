import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { CardSkeleton } from "@/components/loading-skeleton";
import { GraduationCap, MapPin, Users, Plus, Clock, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import type { Workshop } from "@shared/schema";

export default function MyWorkshopsPage() {
  const { data: workshops, isLoading } = useQuery<Workshop[]>({
    queryKey: ["/api/workshops/my"],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "proposed":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800">
            <Clock className="h-3 w-3 mr-1" />
            Under Review
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-emerald-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="secondary">
            <XCircle className="h-3 w-3 mr-1" />
            Not Approved
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "Date TBD";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Workshop Proposals</h1>
          <p className="text-muted-foreground">Track the status of your workshop submissions</p>
        </div>
        <Button className="bg-saffron-500 hover:bg-saffron-600 text-white" asChild>
          <Link href="/propose-workshop">
            <Plus className="h-4 w-4 mr-2" />
            Propose New Workshop
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !workshops || workshops.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No workshop proposals yet"
          description="Share your skills with the community by proposing a one-day workshop"
          action={
            <Button className="bg-saffron-500 hover:bg-saffron-600 text-white" asChild>
              <Link href="/propose-workshop">Propose a Workshop</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {workshops.map((workshop) => (
            <Card key={workshop.id} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-saffron-100 dark:bg-saffron-950/30">
                    <GraduationCap className="h-7 w-7 text-saffron-600 dark:text-saffron-400" />
                  </div>
                  <div className="flex-1 space-y-2">
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
                            {workshop.maxAttendees || 15} max
                          </span>
                        </div>
                      </div>
                      {getStatusBadge(workshop.status)}
                    </div>
                    
                    {workshop.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {workshop.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-muted-foreground">
                        {workshop.status === "approved" && workshop.scheduleDate
                          ? `Scheduled: ${formatDate(workshop.scheduleDate)}`
                          : `Submitted: ${formatDate(workshop.createdAt)}`}
                      </span>
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
