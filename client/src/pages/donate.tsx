import { useState } from "react";
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
import { ArrowLeft, Upload, X, Heart } from "lucide-react";
import { LocationPicker } from "@/components/location-picker";
import { Link } from "wouter";

const donationSchema = z.object({
  itemName: z.string().min(2, "Item name is required"),
  category: z.string().min(1, "Please select a category"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  description: z.string().optional(),
  phone: z.string().min(10, "Phone number is required").max(15, "Invalid phone number"),
  location: z.string().min(1, "Location is required"),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});

type DonationForm = z.infer<typeof donationSchema>;

const categories = [
  "Food",
  "Clothing",
  "Books",
  "Electronics",
  "Furniture",
  "Medical Supplies",
  "Household Items",
  "Toys",
  "Other",
];

export default function DonatePage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [images, setImages] = useState<string[]>([]);
  const [coordinates, setCoordinates] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });

  const form = useForm<DonationForm>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      itemName: "",
      category: "",
      quantity: 1,
      description: "",
      phone: "",
      location: "",
      latitude: null,
      longitude: null,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: DonationForm) => {
      return apiRequest("POST", "/api/donations", { 
        ...data, 
        images,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/donations/my"] });
      toast({ title: "Donation listed!", description: "A Community Head will claim your donation soon." });
      setLocation("/my-donations");
    },
    onError: (error) => {
      toast({
        title: "Failed to list donation",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Donate Items</h1>
          <p className="text-muted-foreground">List items you want to donate to those in need</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Item Details
          </CardTitle>
          <CardDescription>Provide information about the items you're donating</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
              <FormField
                control={form.control}
                name="itemName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Winter Clothes, Rice Bags, Books"
                        data-testid="input-item-name"
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
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
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
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          data-testid="input-quantity"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any details about the items, condition, special instructions..."
                        className="resize-none"
                        rows={3}
                        data-testid="input-description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 9876543210"
                        type="tel"
                        data-testid="input-phone"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pickup Location</FormLabel>
                    <FormControl>
                      <LocationPicker
                        value={field.value}
                        onChange={field.onChange}
                        onCoordinatesChange={(lat, lng) => setCoordinates({ lat, lng })}
                        placeholder="Enter address or click to auto-detect"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormLabel>Photos</FormLabel>
                <div className="grid grid-cols-3 gap-3">
                  {images.map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img src={img} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => removeImage(index)}
                        data-testid={`button-remove-image-${index}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer hover-elevate transition-colors">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Add Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        data-testid="input-image-upload"
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Add up to 5 photos of the items you're donating
                </p>
              </div>

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
                  data-testid="button-submit-donation"
                >
                  {mutation.isPending ? "Listing..." : "List Donation"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
