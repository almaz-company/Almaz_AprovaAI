"use client"

import type React from "react"
import { useEffect, useMemo } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

const PUBLIC_PATHS = ["/preview"]
const AUTH_PAGES = ["/login", "/cadastro", "/esqueci-senha", "/redefinir-senha"]

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname() || "/"
  const router = useRouter()

  const isPublic = useMemo(
    () => PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
      || AUTH_PAGES.includes(pathname),
    [pathname]
  )

  useEffect(() => {
    if (loading) return
    // If not authenticated and trying to access a protected route → go to login with redirect
    if (!user && !isPublic) {
      const redirect = encodeURIComponent(pathname)
      router.replace(`/login?redirect=${redirect}`)
      return
    }
    // If authenticated and on an auth page (login/register/forgot), send to default dashboard
    if (user && AUTH_PAGES.includes(pathname)) {
      router.replace("/visao-geral")
    }
  }, [user, loading, isPublic, pathname, router])

  // Avoid flashing protected content while deciding
  if (!isPublic && (loading || !user)) return null

  return <>{children}</>
}
