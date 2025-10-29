"use client"

import type React from "react"
import { AuthProvider } from "@/lib/auth-context"
import { RouteGuard } from "@/lib/route-guard"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Toaster position="top-center" richColors closeButton />
      <RouteGuard>{children}</RouteGuard>
    </AuthProvider>
  )
}
