import { ReactNode } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/lib/auth";
import { PageLoading } from "@/components/loading-skeleton";

interface RouteGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export function RouteGuard({ children, allowedRoles, redirectTo = "/" }: RouteGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoading />;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Redirect to={redirectTo} />;
  }

  return <>{children}</>;
}

export function SuperAdminGuard({ children }: { children: ReactNode }) {
  return (
    <RouteGuard allowedRoles={["SUPER_ADMIN"]} redirectTo="/access-denied">
      {children}
    </RouteGuard>
  );
}

export function MasterAdminGuard({ children }: { children: ReactNode }) {
  return (
    <RouteGuard allowedRoles={["MASTER_ADMIN", "SUPER_ADMIN"]} redirectTo="/access-denied">
      {children}
    </RouteGuard>
  );
}

export function AdminGuard({ children }: { children: ReactNode }) {
  return (
    <RouteGuard allowedRoles={["MAIN_ADMIN", "MASTER_ADMIN", "SUPER_ADMIN"]} redirectTo="/access-denied">
      {children}
    </RouteGuard>
  );
}

export function CommunityHeadGuard({ children }: { children: ReactNode }) {
  return (
    <RouteGuard allowedRoles={["COMMUNITY_HEAD"]} redirectTo="/">
      {children}
    </RouteGuard>
  );
}
