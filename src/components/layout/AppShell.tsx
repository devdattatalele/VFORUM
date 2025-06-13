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
  
  // Don't show sidebar/header for auth page
  const isAuthPage = pathname === '/auth';
  
  // Allow Q&A forum access for non-authenticated users
  const isQnAPage = pathname.startsWith('/qna');
  const isHelpPage = pathname === '/help';
  
  // Pages that are accessible to non-authenticated users
  const isPublicPage = isQnAPage || isHelpPage;
  
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

  // If user is not authenticated and it's not a public page, show clean layout
  if (!user && !isPublicPage) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }
  
  // Show appropriate layout based on authentication status
  if (!user && isPublicPage) {
    // Limited layout for non-authenticated users on public pages
    // Wrap with SidebarProvider since Header component uses useSidebar hook
    return (
      <SidebarProvider defaultOpen={false}>
        <div className="min-h-screen">
          <Header />
          <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
          <footer className="py-6 md:px-8 md:py-0 border-t">
            <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row md:justify-start">
              <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
                Built by VIT students, for VIT students. Powered by VForums And Events.
              </p>
            </div>
          </footer>
        </div>
      </SidebarProvider>
    );
  }
  
  // Full app layout with sidebar for authenticated users
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
