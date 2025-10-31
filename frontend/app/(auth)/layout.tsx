"use client";
import React from "react";
import { Providers } from "../providers";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <main>
        {children}
      </main>
    </Providers>
  );
}
