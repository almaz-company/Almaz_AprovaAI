"use client";
import { useSidebar } from "@/src/presentation/modules/Dashboard/layout/Sidebar/context/SidebarContext";
import AppSidebar from "@/src/presentation/modules/Dashboard/layout/Sidebar/AppSidebar";
import Backdrop from "@/src/presentation/modules/Dashboard/layout/Sidebar/Backdrop";
import React from "react";
import { Providers } from "../providers";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <Providers>
      <div className="min-h-screen xl:flex">
        <AppSidebar />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
        >
          <Backdrop />
          <div className="p-4 mx-auto max-w-[var(--breakpoint-2xl)] md:p-6">
            {children}
          </div>
        </div>
      </div>
    </Providers>
  );
}
