import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function AccessDenied() {
  const { user, logout } = useAuth();

  const getRoleDashboard = () => {
    switch (user?.role) {
      case "SUPER_ADMIN":
        return "/admin/dashboard";
      case "MASTER_ADMIN":
        return "/master-admin/dashboard";
      case "COMMUNITY_HEAD":
        return "/";
      case "BUSINESS":
        return "/";
      case "DONOR":
        return "/";
      default:
        return "/";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-destructive/5 to-background">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground mb-2">Your current role:</p>
            <p className="font-semibold">{user?.role?.replace(/_/g, " ") || "Unknown"}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This page is restricted to specific user roles. If you believe this is an error, 
              please contact your administrator.
            </p>
          </div>

          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href={getRoleDashboard()}>
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>

          <Button 
            variant="ghost" 
            className="w-full text-muted-foreground" 
            onClick={logout}
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
