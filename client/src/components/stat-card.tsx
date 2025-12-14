import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  variant?: "default" | "gradient";
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, className, variant = "default" }: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border p-5 transition-all duration-300 bg-card",
        variant === "gradient" ? "" : "",
        "hover:shadow-lg hover:-translate-y-0.5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          <p 
            className="text-3xl font-semibold tracking-tight" 
            data-testid={`stat-value-${title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              trend.isPositive 
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200" 
                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
            )}>
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
}
