import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LocationPicker } from "@/components/location-picker";
import { Heart, Briefcase, GraduationCap, Eye, EyeOff } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum(["DONOR", "BUSINESS", "COMMUNITY_HEAD"]),
  location: z.string().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "DONOR",
      location: "",
      latitude: null,
      longitude: null,
    },
  });

  async function onSubmit(data: RegisterForm) {
    setIsLoading(true);
    try {
      await register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
      });
      toast({ title: "Welcome to STROT!", description: "Your account has been created successfully." });
      setLocation("/", { replace: true });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/90 to-primary p-12 text-primary-foreground flex-col justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">STROT</h1>
          <p className="text-lg opacity-90 mt-2">The platform that gives Bal, Buddhi, and Vidya</p>
        </div>
        
        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-white/10 p-3">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">BAL - Donations</h3>
              <p className="text-sm opacity-80">Ensure delivery of basic necessities to those in need</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-white/10 p-3">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">BUDDHI - Employment</h3>
              <p className="text-sm opacity-80">Create verified employment opportunities for skilled workers</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-white/10 p-3">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">VIDYA - Upskilling</h3>
              <p className="text-sm opacity-80">Long-term skill development through workshops</p>
            </div>
          </div>
        </div>

        <p className="text-sm opacity-70">Breaking generational poverty through structured upliftment</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-primary">STROT</h1>
            <p className="text-muted-foreground mt-1">Bal, Buddhi, Vidya</p>
          </div>

          <Card className="border-0 shadow-none lg:border lg:shadow-sm">
            <CardHeader className="space-y-1 px-0 lg:px-6">
              <CardTitle className="text-2xl font-semibold">Create an account</CardTitle>
              <CardDescription>Join STROT and make a difference in communities</CardDescription>
            </CardHeader>
            <CardContent className="px-0 lg:px-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your full name"
                            data-testid="input-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            data-testid="input-email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>I want to join as</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-role">
                              <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DONOR">Donor - I want to donate items</SelectItem>
                            <SelectItem value="BUSINESS">Business - I want to hire workers</SelectItem>
                            <SelectItem value="COMMUNITY_HEAD">Community Head - I want to manage a locality</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a password"
                              data-testid="input-password"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowPassword(!showPassword)}
                              data-testid="button-toggle-password"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirm your password"
                            data-testid="input-confirm-password"
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
                        <FormLabel>Location (Optional)</FormLabel>
                        <FormControl>
                          <LocationPicker
                            value={field.value || ""}
                            onChange={field.onChange}
                            onCoordinatesChange={(lat, lng) => {
                              form.setValue("latitude", lat);
                              form.setValue("longitude", lng);
                            }}
                            placeholder="Auto-detect or enter your location"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                    data-testid="button-register"
                  >
                    {isLoading ? "Creating account..." : "Create account"}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link href="/login" className="text-primary font-medium hover:underline" data-testid="link-login">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
