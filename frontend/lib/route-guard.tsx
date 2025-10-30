"use client"

import type React from "react"
import { useEffect, useMemo } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

const PUBLIC_PATHS = ["/login", "/cadastro", "/esqueci-senha", "/redefinir-senha", "/preview"]

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname() || "/"
  const router = useRouter()

  const isPublic = useMemo(
    () => PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")),
    [pathname]
  )

  useEffect(() => {
    if (loading) return
    if (!user && !isPublic) {
      const redirect = encodeURIComponent(pathname)
      router.replace(`/login?redirect=${redirect}`)
    }
  }, [user, loading, isPublic, pathname, router])

  return <>{children}</>
}
