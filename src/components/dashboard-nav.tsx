// This component is based on the v0 `dashboard-05` reference
"use client"

import { usePathname } from "next/navigation"
import { LoadingLink } from "@/components/ui/loading-link"

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Rocket, LayoutGrid, FolderKanban, BrainCircuit, Presentation, Settings, LifeBuoy, GalleryHorizontalEnd, BookText, PenTool, Palette, Quote, Baseline, Users, Grid3x3, Shapes, Blend, Share2, Star, Mail, FileText, Megaphone, SearchCode, ReceiptText, Brush, ClipboardCheck, UsersRound, CalendarClock, CreditCard } from "lucide-react"

export function DashboardNav() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <Sidebar>
      <SidebarHeader>
          <div className="flex items-center gap-2">
            <Rocket className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold font-headline">BrandBoost AI</span>
          </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
              <LoadingLink href="/dashboard">
                <LayoutGrid />
                <span>Dashboard</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/projects")}>
              <LoadingLink href="/dashboard/projects">
                <FolderKanban />
                <span>Projects</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/clients")}>
              <LoadingLink href="/dashboard/clients">
                <Users />
                <span>Clients</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/invoices")}>
              <LoadingLink href="/dashboard/invoices">
                <ReceiptText />
                <span>Invoices</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/payments")}>
              <LoadingLink href="/dashboard/payments">
                <CreditCard />
                <span>Payments</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/team")}>
              <LoadingLink href="/dashboard/team">
                <Users />
                <span>Team</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/designers")}>
                <LoadingLink href="/dashboard/designers">
                    <Brush />
                    <span>Designers</span>
                </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/emails")}>
                <LoadingLink href="/dashboard/emails">
                    <Mail />
                    <span>Collected Emails</span>
                </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/reviews")}>
              <LoadingLink href="/dashboard/reviews">
                <Star />
                <span>Reviews</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <Separator className="my-2" />
          <SidebarMenuItem className="px-2 text-xs text-muted-foreground">
              AI Tools
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/brief-analysis")}>
              <LoadingLink href="/dashboard/brief-analysis">
                <ClipboardCheck />
                <span>Brief Analysis</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/persona-generator")}>
              <LoadingLink href="/dashboard/persona-generator">
                <UsersRound />
                <span>Persona Generator</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/brand-research")}>
              <LoadingLink href="/dashboard/brand-research">
                <BrainCircuit />
                <span>AI Brand Research</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/competitor-analysis")}>
              <LoadingLink href="/dashboard/competitor-analysis">
                <SearchCode />
                <span>Competitor Analysis</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/mood-board")}>
              <LoadingLink href="/dashboard/mood-board">
                <Grid3x3 />
                <span>AI Mood Board</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/icon-generator")}>
              <LoadingLink href="/dashboard/icon-generator">
                <Shapes />
                <span>AI Icon Generator</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/logo-generator")}>
              <LoadingLink href="/dashboard/logo-generator">
                <PenTool />
                <span>AI Logo Generator</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/logo-variations")}>
              <LoadingLink href="/dashboard/logo-variations">
                <Blend />
                <span>Logo Variations</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/color-palette")}>
              <LoadingLink href="/dashboard/color-palette">
                <Palette />
                <span>AI Color Palette</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/typography-pairing")}>
              <LoadingLink href="/dashboard/typography-pairing">
                <Baseline />
                <span>Typography Pairing</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/slogan-generator")}>
              <LoadingLink href="/dashboard/slogan-generator">
                <Quote />
                <span>Slogan Generator</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/presentation-text")}>
              <LoadingLink href="/dashboard/presentation-text">
                <Presentation />
                <span>Presentation Text</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/logo-mockups")}>
              <LoadingLink href="/dashboard/logo-mockups">
                <GalleryHorizontalEnd />
                <span>Logo Mockups</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/brand-guidelines")}>
              <LoadingLink href="/dashboard/brand-guidelines">
                <BookText />
                <span>Brand Guidelines</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/social-media-kit")}>
              <LoadingLink href="/dashboard/social-media-kit">
                <Share2 />
                <span>Social Media Kit</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/social-media-posts")}>
              <LoadingLink href="/dashboard/social-media-posts">
                <Megaphone />
                <span>Social Media Posts</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/weekly-summary")}>
              <LoadingLink href="/dashboard/weekly-summary">
                <CalendarClock />
                <span>Weekly Summary</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/invoice-generator")}>
              <LoadingLink href="/dashboard/invoice-generator">
                <FileText />
                <span>Invoice Generator</span>
              </LoadingLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard/settings")}>
                <LoadingLink href="/dashboard/settings">
                    <Settings />
                    <span>Settings</span>
                </LoadingLink>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild>
                <LoadingLink href="#">
                    <LifeBuoy />
                    <span>Help & Support</span>
                </LoadingLink>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
