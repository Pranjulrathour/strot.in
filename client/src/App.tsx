import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { PageLoading } from "@/components/loading-skeleton";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DonorDashboard from "@/pages/donor-dashboard";
import BusinessDashboard from "@/pages/business-dashboard";
import CHDashboard from "@/pages/ch-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import DonatePage from "@/pages/donate";
import MyDonationsPage from "@/pages/my-donations";
import PostJobPage from "@/pages/post-job";
import MyJobsPage from "@/pages/my-jobs";
import WorkersPage from "@/pages/workers";
import WorkshopsPage from "@/pages/workshops";
import DonationsPage from "@/pages/donations";
import JobsPage from "@/pages/jobs";
import WorkerMatchesPage from "@/pages/worker-matches";
import CommunityHeadsPage from "@/pages/community-heads";

function Dashboard() {
  const { user } = useAuth();
  
  switch (user?.role) {
    case "BUSINESS":
      return <BusinessDashboard />;
    case "COMMUNITY_HEAD":
      return <CHDashboard />;
    case "MAIN_ADMIN":
      return <AdminDashboard />;
    default:
      return <DonorDashboard />;
  }
}

function ProtectedRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoading />;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-3 lg:p-4">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/donate" component={DonatePage} />
              <Route path="/my-donations" component={MyDonationsPage} />
              <Route path="/post-job" component={PostJobPage} />
              <Route path="/my-jobs" component={MyJobsPage} />
              <Route path="/workers" component={WorkersPage} />
              <Route path="/workshops" component={WorkshopsPage} />
              <Route path="/donations" component={DonationsPage} />
              <Route path="/jobs" component={JobsPage} />
              <Route path="/worker-matches" component={WorkerMatchesPage} />
              <Route path="/community-heads" component={CommunityHeadsPage} />
              <Route path="/donation-requests" component={DonationsPage} />
              <Route path="/settings" component={NotFound} />
              <Route component={NotFound} />
            </Switch>
          </main>
          <MobileNav />
        </div>
      </div>
    </SidebarProvider>
  );
}

function PublicRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoading />;
  }

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route>
        <Redirect to="/login" />
      </Route>
    </Switch>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoading />;
  }

  if (!user) {
    return <PublicRoutes />;
  }

  return <ProtectedRoutes />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
