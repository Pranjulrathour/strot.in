import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Heart,
  Briefcase,
  Users,
  GraduationCap,
  Plus,
} from "lucide-react";

export function MobileNav() {
  const { user } = useAuth();
  const [location] = useLocation();

  const donorItems = [
    { title: "Home", url: "/", icon: LayoutDashboard },
    { title: "Donate", url: "/donate", icon: Plus },
    { title: "History", url: "/my-donations", icon: Heart },
  ];

  const businessItems = [
    { title: "Home", url: "/", icon: LayoutDashboard },
    { title: "Post", url: "/post-job", icon: Plus },
    { title: "Jobs", url: "/my-jobs", icon: Briefcase },
    { title: "Workers", url: "/worker-matches", icon: Users },
  ];

  const chItems = [
    { title: "Home", url: "/", icon: LayoutDashboard },
    { title: "Donations", url: "/donations", icon: Heart },
    { title: "Jobs", url: "/jobs", icon: Briefcase },
    { title: "Workers", url: "/workers", icon: Users },
    { title: "Workshops", url: "/workshops", icon: GraduationCap },
  ];

  const getItems = () => {
    switch (user?.role) {
      case "DONOR":
        return donorItems;
      case "BUSINESS":
        return businessItems;
      case "COMMUNITY_HEAD":
        return chItems;
      default:
        return donorItems;
    }
  };

  const items = getItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const isActive = location === item.url;
          return (
            <Link
              key={item.title}
              href={item.url}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full py-2",
                "transition-colors duration-200",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              data-testid={`mobile-nav-${item.title.toLowerCase()}`}
            >
              <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className="text-[10px] font-medium">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
