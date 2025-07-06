
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardNav } from "@/components/dashboard-nav"
import { UserNav } from "@/components/user-nav"
import { Input } from "@/components/ui/input"
import { LogIn, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <DashboardNav />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 sm:px-6">
          <SidebarTrigger className="sm:hidden" />
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-secondary pl-8 md:w-[200px] lg:w-[320px]"
            />
          </div>
          <div className="flex items-center gap-2">
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
