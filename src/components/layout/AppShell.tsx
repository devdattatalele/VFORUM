"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import Header from './Header';
import AppSidebar from './AppSidebar';
import { SidebarProvider, SidebarInset, SidebarRail } from '@/components/ui/sidebar';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  
  // Don't show sidebar/header only for auth page
  const isAuthPage = pathname === '/auth';
  
  if (isAuthPage) {
    // Clean layout for auth page
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }
  
  if (loading) {
    // Show minimal layout while loading
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }
  
  // Full app layout with sidebar for everyone (authenticated and non-authenticated)
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
          <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row md:justify-start">
            <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built by VIT students, for VIT students. Powered by VForums And Events.
            </p>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
