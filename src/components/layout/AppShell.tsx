"use client";

import React from 'react';
import Header from './Header';
import AppSidebar from './AppSidebar';
import { SidebarProvider, SidebarInset, SidebarRail } from '@/components/ui/sidebar';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  // Determine if sidebar should be shown based on route, or always show for authenticated routes
  // For now, we assume it's part of the main app layout and always potentially visible.
  
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarRail />
      <SidebarInset className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <footer className="py-6 md:px-8 md:py-0 border-t">
          <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built by VIT students, for VIT students.
            </p>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}