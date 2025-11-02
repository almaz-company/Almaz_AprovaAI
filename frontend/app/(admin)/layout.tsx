"use client";

import React from "react";


import AppSidebar from "@/src/presentation/modules/Dashboard/layout/Sidebar/AppSidebar";
import AppHeader from "@/src/presentation/modules/Dashboard/layout/Header/AppHeader";
import { useSidebar } from "@/src/presentation/modules/Dashboard/layout/Sidebar/context/SidebarContext";

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
    <div className="min-h-screen xl:flex">
      

      {/* Sidebar and Backdrop */}
      <AppSidebar />
     
      
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
       

        {/* Page Content */}
        <div className="p-4 mx-auto max-w-[var(--breakpoint-2xl)] md:p-6">
          {/* Barra de carregamento no topo */}
      
          {children}
        </div>
      </div>
    </div>
  );
}