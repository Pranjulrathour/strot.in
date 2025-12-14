import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { CardSkeleton } from "@/components/loading-skeleton";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Upload, X } from "lucide-react";
import type { WorkerProfile } from "@shared/schema";

const workerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  age: z.number().min(16, "Minimum age is 16").max(70, "Maximum age is 70"),
  skill: z.string().min(1, "Please select a skill"),
  experience: z.string().optional(),
});

type WorkerForm = z.infer<typeof workerSchema>;

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

export default function WorkersPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);

  const { data: workers, isLoading } = useQuery<WorkerProfile[]>({
    queryKey: ["/api/workers/ch"],
  });

  const form = useForm<WorkerForm>({
    resolver: zodResolver(workerSchema),
    defaultValues: {
      name: "",
      age: 25,
      skill: "",
      experience: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: WorkerForm) => {
      return apiRequest("POST", "/api/workers", { ...data, photos });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workers/ch"] });
      toast({ title: "Worker added!", description: "The worker profile has been created." });
      setIsOpen(false);
      form.reset();
      setPhotos([]);
    },
    onError: (error) => {
      toast({
        title: "Failed to add worker",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Worker Profiles</h1>
          <p className="text-muted-foreground">Manage workers from your community</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-worker">
              <Plus className="h-4 w-4 mr-2" />
              Add Worker
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Worker</DialogTitle>
              <DialogDescription>
                Create a profile for a skilled worker in your community
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter worker's name"
                          data-testid="input-worker-name"
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
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={16}
                            max={70}
                            data-testid="input-worker-age"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 25)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="skill"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Skill</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-worker-skill">
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
                </div>

                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe work experience, previous employers, certifications..."
                          className="resize-none"
                          rows={3}
                          data-testid="input-worker-experience"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Photos</FormLabel>
                  <div className="flex gap-2 flex-wrap">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden border">
                        <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-0.5 right-0.5 h-5 w-5"
                          onClick={() => removePhoto(index)}
                        >
                          <X className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    ))}
                    {photos.length < 3 && (
                      <label className="w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover-elevate">
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoUpload}
                          data-testid="input-worker-photo"
                        />
                      </label>
                    )}
                  </div>
                </div>

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
                    disabled={mutation.isPending}
                    data-testid="button-submit-worker"
                  >
                    {mutation.isPending ? "Adding..." : "Add Worker"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !workers || workers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No workers added"
          description="Add skilled workers from your community to match them with job opportunities."
          action={
            <Button onClick={() => setIsOpen(true)}>Add your first worker</Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workers.map((worker) => (
            <Card key={worker.id} className="overflow-visible" data-testid={`worker-card-${worker.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14">
                    {worker.photos && worker.photos.length > 0 ? (
                      <img
                        src={worker.photos[0]}
                        alt={worker.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                        {worker.name.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{worker.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {worker.skill} · {worker.age} years
                        </p>
                      </div>
                      <StatusBadge status={worker.status} />
                    </div>
                    {worker.experience && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {worker.experience}
                      </p>
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
