import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Briefcase } from "lucide-react";
import { LocationPicker } from "@/components/location-picker";
import { useState } from "react";
import { Link } from "wouter";

const jobSchema = z.object({
  title: z.string().min(2, "Job title is required"),
  description: z.string().optional(),
  requiredSkill: z.string().min(1, "Please select a required skill"),
  salaryRange: z.string().optional(),
  location: z.string().min(2, "Location is required"),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});

type JobForm = z.infer<typeof jobSchema>;

const skills = [
  "Driver",
  "Cook",
  "Cleaner",
  "Security Guard",
  "Electrician",
  "Plumber",
  "Carpenter",
  "Painter",
  "Mason",
  "Helper",
  "Packer",
  "Delivery",
  "Tailor",
  "Mechanic",
  "Gardener",
  "Watchman",
  "Office Boy",
  "Other",
];

export default function PostJobPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [coordinates, setCoordinates] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });

  const form = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      description: "",
      requiredSkill: "",
      salaryRange: "",
      location: "",
      latitude: null,
      longitude: null,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: JobForm) => {
      return apiRequest("POST", "/api/jobs", {
        ...data,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/my"] });
      toast({ title: "Job posted!", description: "Community Heads will start matching workers soon." });
      setLocation("/my-jobs");
    },
    onError: (error) => {
      toast({
        title: "Failed to post job",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Post a Job</h1>
          <p className="text-muted-foreground">Find skilled workers from local communities</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Job Details
          </CardTitle>
          <CardDescription>Describe the position you're looking to fill</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Full-time Driver, Kitchen Helper"
                        data-testid="input-job-title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="requiredSkill"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Skill</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-skill">
                            <SelectValue placeholder="Select skill" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {skills.map((skill) => (
                            <SelectItem key={skill} value={skill}>
                              {skill}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salaryRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary Range (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., ₹15,000 - ₹20,000/month"
                          data-testid="input-salary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Location</FormLabel>
                    <FormControl>
                      <LocationPicker
                        value={field.value}
                        onChange={field.onChange}
                        onCoordinatesChange={(lat, lng) => setCoordinates({ lat, lng })}
                        placeholder="Enter location or auto-detect"
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
                    <FormLabel>Job Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the responsibilities, working hours, and any other requirements..."
                        className="resize-none"
                        rows={4}
                        data-testid="input-job-description"
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
                  onClick={() => setLocation("/")}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={mutation.isPending}
                  data-testid="button-post-job"
                >
                  {mutation.isPending ? "Posting..." : "Post Job"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
