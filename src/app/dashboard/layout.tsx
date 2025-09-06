

"use client" // Add use client for state and hooks

import * as React from "react" // Import React
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardNav } from "@/components/dashboard-nav"
import { UserNav } from "@/components/user-nav"
import { LogIn, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoadingLink } from "@/components/ui/loading-link"
import { GlobalSearch } from "@/components/global-search"
import { NotificationCenter } from "@/components/notification-center"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import type { Project, TeamMember } from "@/types"
import { useRouter } from "next/navigation"

function PortalLoginDialog({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
    const [projects, setProjects] = React.useState<Project[]>([]);
    const [team, setTeam] = React.useState<TeamMember[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [view, setView] = React.useState<'client' | 'designer'>('client');
    const router = useRouter();

    React.useEffect(() => {
        const projectsQuery = query(collection(db, "projects"));
        const teamQuery = query(collection(db, "teamMembers"), where("role", "==", "Designer"));
        
        const unsubProjects = onSnapshot(projectsQuery, (snap) => setProjects(snap.docs.map(d => ({id: d.id, ...d.data()}) as Project)));
        const unsubTeam = onSnapshot(teamQuery, (snap) => setTeam(snap.docs.map(d => ({id: d.id, ...d.data()}) as TeamMember)));
        
        setLoading(false);
        return () => {
            unsubProjects();
            unsubTeam();
        };
    }, []);

    const handleLogin = (url: string) => {
        onOpenChange(false);
        router.push(url);
    }
    
    const handleDesignerLogin = (designerId: string) => {
        sessionStorage.setItem('designerId', designerId);
        handleLogin('/designer');
    }

    return (
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>Quick Portal Login</DialogTitle>
                <DialogDescription>
                    Select a portal to log into directly without needing credentials.
                </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2">
                <Button variant={view === 'client' ? 'default' : 'outline'} onClick={() => setView('client')}>Client Portals</Button>
                <Button variant={view === 'designer' ? 'default' : 'outline'} onClick={() => setView('designer')}>Designer Portals</Button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{view === 'client' ? 'Project' : 'Designer'}</TableHead>
                            <TableHead>{view === 'client' ? 'Client' : 'Email'}</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? <TableRow><TableCell colSpan={3} className="text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto"/></TableCell></TableRow> :
                        view === 'client' ? (
                             projects.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.name}</TableCell>
                                    <TableCell>{p.client}</TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" onClick={() => handleLogin(`/portal/${p.id}`)}>
                                            <LogIn className="mr-2 h-4 w-4"/> Login
                                        </Button>
                                    </TableCell>
                                </TableRow>
                             ))
                        ) : (
                             team.map(d => (
                                <TableRow key={d.id}>
                                    <TableCell>{d.name}</TableCell>
                                    <TableCell>{d.email}</TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" onClick={() => handleDesignerLogin(d.id)}>
                                            <LogIn className="mr-2 h-4 w-4"/> Login
                                        </Button>
                                    </TableCell>
                                </TableRow>
                             ))
                        )
                        }
                    </TableBody>
                 </Table>
            </div>
        </DialogContent>
    )
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [portalLoginOpen, setPortalLoginOpen] = React.useState(false);

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
            <Dialog open={portalLoginOpen} onOpenChange={setPortalLoginOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <LogIn className="mr-2 h-4 w-4" /> Portal Login
                </Button>
              </DialogTrigger>
              <PortalLoginDialog onOpenChange={setPortalLoginOpen} />
            </Dialog>
          </div>
          <UserNav />
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
