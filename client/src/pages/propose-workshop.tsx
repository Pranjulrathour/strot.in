import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, MapPin, Users, ArrowLeft, Sparkles } from "lucide-react";
import { LocationPicker } from "@/components/location-picker";
import { Link } from "wouter";

const WORKSHOP_SKILLS = [
  "Basic Computer Skills",
  "Mobile Phone Usage",
  "Digital Payments (UPI/Paytm)",
  "Basic English Speaking",
  "Hindi Reading & Writing",
  "Basic Mathematics",
  "Tailoring & Stitching",
  "Cooking & Food Preparation",
  "First Aid & Health Awareness",
  "Personal Hygiene & Sanitation",
  "Financial Literacy & Savings",
  "Resume Writing & Interview Skills",
  "Communication Skills",
  "Customer Service Basics",
  "Basic Electrical Repairs",
  "Plumbing Basics",
  "Gardening & Plant Care",
  "Beauty & Grooming",
  "Photography Basics",
  "Arts & Crafts",
];

const proposalSchema = z.object({
  topic: z.string().min(1, "Please select a skill to teach"),
  description: z.string().min(20, "Please provide at least 20 characters about what you'll teach"),
  location: z.string().min(3, "Please enter the location where you can conduct the workshop"),
  maxAttendees: z.coerce.number().min(5, "Minimum 5 attendees").max(50, "Maximum 50 attendees"),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});

type ProposalForm = z.infer<typeof proposalSchema>;

export default function ProposeWorkshopPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [coordinates, setCoordinates] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });

  const form = useForm<ProposalForm>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      topic: "",
      description: "",
      location: "",
      maxAttendees: 15,
      latitude: null,
      longitude: null,
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ProposalForm) => {
      return apiRequest("POST", "/api/workshops", {
        ...data,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workshops/my"] });
      toast({
        title: "Workshop Proposed!",
        description: "A Community Head will review your proposal and contact you soon.",
      });
      navigate("/my-workshops");
    },
    onError: (error) => {
      toast({
        title: "Failed to submit",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProposalForm) => {
    submitMutation.mutate(data);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Propose a Workshop</h1>
          <p className="text-muted-foreground">Share your skills with the community</p>
        </div>
      </div>

      <Card className="border-saffron-200 dark:border-saffron-800/30">
        <CardHeader className="bg-saffron-50 dark:bg-saffron-950/20 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-saffron-500 text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <CardTitle>One-Day Workshop</CardTitle>
              <CardDescription>Teach a skill that can be learned in one day</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic">What skill will you teach?</Label>
              <Select
                value={form.watch("topic")}
                onValueChange={(value) => form.setValue("topic", value)}
              >
                <SelectTrigger id="topic" className="w-full">
                  <SelectValue placeholder="Select a skill..." />
                </SelectTrigger>
                <SelectContent>
                  {WORKSHOP_SKILLS.map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.topic && (
                <p className="text-sm text-destructive">{form.formState.errors.topic.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">What will participants learn?</Label>
              <Textarea
                id="description"
                placeholder="Describe what you'll teach, your experience with this skill, and what participants will be able to do after the workshop..."
                rows={4}
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="location">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Workshop Location
                </Label>
                <LocationPicker
                  value={form.watch("location")}
                  onChange={(val) => form.setValue("location", val)}
                  onCoordinatesChange={(lat, lng) => setCoordinates({ lat, lng })}
                  placeholder="Enter location or auto-detect"
                />
                {form.formState.errors.location && (
                  <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAttendees">
                  <Users className="h-4 w-4 inline mr-1" />
                  Max Attendees
                </Label>
                <Input
                  id="maxAttendees"
                  type="number"
                  min={5}
                  max={50}
                  {...form.register("maxAttendees")}
                />
                {form.formState.errors.maxAttendees && (
                  <p className="text-sm text-destructive">{form.formState.errors.maxAttendees.message}</p>
                )}
              </div>
            </div>

            <div className="bg-saffron-50 dark:bg-saffron-950/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-saffron-600 dark:text-saffron-400">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium text-sm">What happens next?</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• A Community Head will review your proposal</li>
                <li>• They will contact you via the phone number in your profile</li>
                <li>• Together you'll finalize the date and venue</li>
                <li>• The CH will help gather participants from the community</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full bg-saffron-500 hover:bg-saffron-600 text-white"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Workshop Proposal"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
