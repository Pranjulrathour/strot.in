import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Heart,
  Briefcase,
  Users,
  GraduationCap,
  Settings,
  LogOut,
  Building2,
  FileText,
  UserCheck,
  ClipboardList,
  Shield,
  AlertTriangle,
  Activity,
  DollarSign,
  UserPlus,
} from "lucide-react";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const donorMenuItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Donate Items", url: "/donate", icon: Heart },
    { title: "My Donations", url: "/my-donations", icon: FileText },
    { title: "Propose Workshop", url: "/propose-workshop", icon: GraduationCap },
    { title: "My Workshops", url: "/my-workshops", icon: ClipboardList },
  ];

  const businessMenuItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Post Job", url: "/post-job", icon: Briefcase },
    { title: "My Jobs", url: "/my-jobs", icon: ClipboardList },
    { title: "Worker Matches", url: "/worker-matches", icon: Users },
  ];

  const communityHeadMenuItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Donations", url: "/donations", icon: Heart },
    { title: "Job Allocation", url: "/job-allocation", icon: UserPlus },
    { title: "Workers", url: "/workers", icon: Users },
    { title: "Workshop Proposals", url: "/workshop-proposals", icon: GraduationCap },
  ];

  const superAdminMenuItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Master Admins", url: "/admin/master-admins", icon: Shield },
    { title: "User Management", url: "/admin/users", icon: Users },
    { title: "Community Heads", url: "/admin/community-heads", icon: UserCheck },
    { title: "System Logs", url: "/admin/system-logs", icon: Activity },
    { title: "Settings", url: "/settings", icon: Settings },
  ];

  const adminMenuItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "User Management", url: "/admin/users", icon: Users },
    { title: "Community Heads", url: "/community-heads", icon: UserCheck },
    { title: "Donations", url: "/donations", icon: Heart },
    { title: "Jobs", url: "/jobs", icon: Briefcase },
    { title: "Workshops", url: "/workshops", icon: GraduationCap },
    { title: "Settings", url: "/settings", icon: Settings },
  ];

  const masterAdminMenuItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Community Heads", url: "/master-admin/community-heads", icon: Users },
    { title: "Activity Logs", url: "/master-admin/logs", icon: Activity },
    { title: "Flagged Reports", url: "/master-admin/flags", icon: AlertTriangle },
    { title: "CSR Funds", url: "/master-admin/csr", icon: DollarSign },
  ];

  const getMenuItems = () => {
    switch (user?.role) {
      case "SUPER_ADMIN":
        return superAdminMenuItems;
      case "MASTER_ADMIN":
        return masterAdminMenuItems;
      case "MAIN_ADMIN":
        return adminMenuItems;
      case "COMMUNITY_HEAD":
        return communityHeadMenuItems;
      case "BUSINESS":
        return businessMenuItems;
      case "DONOR":
        return donorMenuItems;
      default:
        return donorMenuItems;
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case "DONOR":
        return "Donor";
      case "BUSINESS":
        return "Business";
      case "COMMUNITY_HEAD":
        return "Community Head";
      case "MAIN_ADMIN":
        return "Administrator";
      case "MASTER_ADMIN":
        return "Master Admin";
      case "SUPER_ADMIN":
        return "Super Admin";
      default:
        return "User";
    }
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case "BUSINESS":
        return Building2;
      case "COMMUNITY_HEAD":
        return Users;
      case "MAIN_ADMIN":
        return Settings;
      case "MASTER_ADMIN":
      case "SUPER_ADMIN":
        return Shield;
      default:
        return Heart;
    }
  };

  const RoleIcon = getRoleIcon();
  const menuItems = getMenuItems();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            S
          </div>
          <div>
            <h2 className="font-semibold text-lg tracking-tight">STROT</h2>
            <p className="text-xs text-muted-foreground">Bal, Buddhi, Vidya</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <RoleIcon className="h-3.5 w-3.5" />
            {getRoleLabel()}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {user?.name ? getInitials(user.name) : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-user-name">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.phone ? `XXXX-XXX-${user.phone.slice(-4)}` : ""}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={logout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
