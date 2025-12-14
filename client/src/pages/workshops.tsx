import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { CardSkeleton } from "@/components/loading-skeleton";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Plus, Calendar, MapPin, Users, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import type { Workshop } from "@shared/schema";

const workshopSchema = z.object({
  topic: z.string().min(2, "Topic is required"),
  description: z.string().optional(),
  location: z.string().min(2, "Location is required"),
  scheduleDate: z.string().optional(),
  maxAttendees: z.number().min(5, "Minimum 5 attendees").max(100, "Maximum 100 attendees"),
});

type WorkshopForm = z.infer<typeof workshopSchema>;

export default function WorkshopsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const isCH = user?.role === "COMMUNITY_HEAD";

  const { data: workshops, isLoading } = useQuery<Workshop[]>({
    queryKey: [isCH ? "/api/workshops/ch" : "/api/workshops"],
  });

  const form = useForm<WorkshopForm>({
    resolver: zodResolver(workshopSchema),
    defaultValues: {
      topic: "",
      description: "",
      location: "",
      scheduleDate: "",
      maxAttendees: 20,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: WorkshopForm) => {
      return apiRequest("POST", "/api/workshops", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workshops"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workshops/ch"] });
      toast({ title: "Workshop proposed!", description: "Waiting for Community Head approval." });
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to propose workshop",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, approve }: { id: string; approve: boolean }) => {
      return apiRequest("PATCH", `/api/workshops/${id}`, {
        status: approve ? "approved" : "rejected",
      });
    },
    onSuccess: (_, { approve }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workshops/ch"] });
      toast({
        title: approve ? "Workshop approved!" : "Workshop rejected",
        description: approve
          ? "The workshop has been scheduled."
          : "The proposal has been declined.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update workshop",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: string | Date | null) => {
    if (!date) return "TBD";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const proposedWorkshops = workshops?.filter((w) => w.status === "proposed") || [];
  const otherWorkshops = workshops?.filter((w) => w.status !== "proposed") || [];

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workshops</h1>
          <p className="text-muted-foreground">
            {isCH ? "Manage skill development workshops in your community" : "Skill development programs"}
          </p>
        </div>
        {!isCH && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-propose-workshop">
                <Plus className="h-4 w-4 mr-2" />
                Propose Workshop
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Propose a Workshop</DialogTitle>
                <DialogDescription>
                  Submit a workshop proposal for Community Head approval
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workshop Topic</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Basic Computer Skills, Tailoring, English Speaking"
                            data-testid="input-workshop-topic"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe what will be taught, target audience, duration..."
                            className="resize-none"
                            rows={3}
                            data-testid="input-workshop-description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 grid-cols-2">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Venue name"
                              data-testid="input-workshop-location"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxAttendees"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Attendees</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={5}
                              max={100}
                              data-testid="input-workshop-max-attendees"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 20)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="scheduleDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proposed Date (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            data-testid="input-workshop-date"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={createMutation.isPending}
                      data-testid="button-submit-workshop"
                    >
                      {createMutation.isPending ? "Submitting..." : "Submit Proposal"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isCH && proposedWorkshops.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Approvals</CardTitle>
            <CardDescription>Workshop proposals awaiting your review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {proposedWorkshops.map((workshop) => (
                <div
                  key={workshop.id}
                  className="p-4 rounded-lg border bg-card"
                  data-testid={`pending-workshop-${workshop.id}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold">{workshop.topic}</h4>
                      {workshop.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {workshop.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {workshop.location}
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
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(workshop.scheduleDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {workshop.maxAttendees} max
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => approveMutation.mutate({ id: workshop.id, approve: false })}
                        disabled={approveMutation.isPending}
                        data-testid={`button-reject-workshop-${workshop.id}`}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate({ id: workshop.id, approve: true })}
                        disabled={approveMutation.isPending}
                        data-testid={`button-approve-workshop-${workshop.id}`}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !workshops || workshops.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No workshops"
          description={
            isCH
              ? "Workshop proposals will appear here for your approval."
              : "Propose a workshop to help upskill community members."
          }
          action={
            !isCH && (
              <Button onClick={() => setIsOpen(true)}>Propose a workshop</Button>
            )
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(isCH ? otherWorkshops : workshops).map((workshop) => (
            <Card key={workshop.id} className="overflow-visible" data-testid={`workshop-card-${workshop.id}`}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <StatusBadge status={workshop.status} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{workshop.topic}</h3>
                    {workshop.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {workshop.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {workshop.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(workshop.scheduleDate)}
                    </span>
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
