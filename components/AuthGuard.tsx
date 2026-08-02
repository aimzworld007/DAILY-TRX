"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

const publicRoutes = ["/login", "/register"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = publicRoutes.includes(pathname);

  useEffect(() => {
    if (!loading && !user && !isPublic) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    if (!loading && user && isPublic) router.replace("/");
  }, [isPublic, loading, pathname, router, user]);

  if (loading || (!user && !isPublic) || (user && isPublic)) {
    return <div className="min-h-screen grid place-items-center text-indigo-600"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
  }
  return children;
}
