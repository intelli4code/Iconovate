"use client" // Add use client for state and hooks

import * as React from "react" // Import React
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardNav } from "@/components/dashboard-nav"
import { UserNav } from "@/components/user-nav"
import { Bell, LogIn, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { GlobalSearch } from "@/components/global-search"
import { NotificationCenter } from "@/components/notification-center"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <SidebarProvider>
      <DashboardNav />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 sm:px-6">
          <SidebarTrigger className="sm:hidden" />
          <div className="relative flex-1">
            <Button
                variant="outline"
                className="w-full justify-start text-muted-foreground pl-8 md:w-[200px] lg:w-[320px]"
                onClick={() => setSearchOpen(true)}
              >
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              Search...
              <kbd className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
            <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <Button variant="outline" size="sm" asChild>
                <Link href="/">
                    <LogIn className="mr-2 h-4 w-4" /> Client Portal
                </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
                <Link href="/designer/login">
                    <LogIn className="mr-2 h-4 w-4" /> Designer Portal
                </Link>
            </Button>
          </div>
          <UserNav />
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
