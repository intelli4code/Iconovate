
// This component is based on the v0 `dashboard-05` reference
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

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
import { Rocket, LayoutGrid, FolderKanban, BrainCircuit, Presentation, Settings, LifeBuoy, GalleryHorizontalEnd, BookText, PenTool, Palette, Quote, Baseline, Users, Grid3x3, Shapes, Blend, Share2, Star } from "lucide-react"

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
              <Link href="/dashboard">
                <LayoutGrid />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/projects")}>
              <Link href="/dashboard/projects">
                <FolderKanban />
                <span>Projects</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/clients")}>
              <Link href="/dashboard/clients">
                <Users />
                <span>Clients</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/reviews")}>
              <Link href="/dashboard/reviews">
                <Star />
                <span>Reviews</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <Separator className="my-2" />
          <SidebarMenuItem className="px-2 text-xs text-muted-foreground">
              AI Tools
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/brand-research")}>
              <Link href="/dashboard/brand-research">
                <BrainCircuit />
                <span>AI Brand Research</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/mood-board")}>
              <Link href="/dashboard/mood-board">
                <Grid3x3 />
                <span>AI Mood Board</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/icon-generator")}>
              <Link href="/dashboard/icon-generator">
                <Shapes />
                <span>AI Icon Generator</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/logo-generator")}>
              <Link href="/dashboard/logo-generator">
                <PenTool />
                <span>AI Logo Generator</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/logo-variations")}>
              <Link href="/dashboard/logo-variations">
                <Blend />
                <span>Logo Variations</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/color-palette")}>
              <Link href="/dashboard/color-palette">
                <Palette />
                <span>AI Color Palette</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/typography-pairing")}>
              <Link href="/dashboard/typography-pairing">
                <Baseline />
                <span>Typography Pairing</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/slogan-generator")}>
              <Link href="/dashboard/slogan-generator">
                <Quote />
                <span>Slogan Generator</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/presentation-text")}>
              <Link href="/dashboard/presentation-text">
                <Presentation />
                <span>Presentation Text</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/logo-mockups")}>
              <Link href="/dashboard/logo-mockups">
                <GalleryHorizontalEnd />
                <span>Logo Mockups</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/brand-guidelines")}>
              <Link href="/dashboard/brand-guidelines">
                <BookText />
                <span>Brand Guidelines</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/social-media-kit")}>
              <Link href="/dashboard/social-media-kit">
                <Share2 />
                <span>Social Media Kit</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard/settings")}>
                <Link href="/dashboard/settings">
                    <Settings />
                    <span>Settings</span>
                </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild>
                <Link href="#">
                    <LifeBuoy />
                    <span>Help & Support</span>
                </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
