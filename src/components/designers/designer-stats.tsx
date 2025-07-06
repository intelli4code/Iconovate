"use client"

import { useState, useEffect } from "react"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Project, TeamMember } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Copy, KeyRound, User, Loader2, Star, FolderKanban, FolderClock } from "lucide-react"

export function DesignerStats() {
  const [designers, setDesigners] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const teamQuery = query(collection(db, "teamMembers"), where("role", "==", "Designer"));
    const projectsQuery = query(collection(db, "projects"));

    const unsubscribeTeam = onSnapshot(teamQuery, (snapshot) => {
      const designersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TeamMember[];
      setDesigners(designersData);
    });

    const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
      setProjects(projectsData);
      setLoading(false);
    });

    return () => {
      unsubscribeTeam();
      unsubscribeProjects();
    };
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} Copied!`,
      description: text,
    });
  };

  const designerStats = designers.map(designer => {
    const assignedProjects = projects.filter(p => p.team.includes(designer.name));
    const activeProjects = assignedProjects.filter(p => ['In Progress', 'Pending Feedback', 'Revision Requested'].includes(p.status)).length;
    const completedProjects = assignedProjects.filter(p => p.status === 'Completed');
    const ratedProjects = completedProjects.filter(p => p.rating && p.rating > 0);
    const averageRating = ratedProjects.length > 0
      ? ratedProjects.reduce((acc, p) => acc + p.rating!, 0) / ratedProjects.length
      : 0;

    return {
      ...designer,
      totalProjects: assignedProjects.length,
      activeProjects,
      averageRating
    };
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (designers.length === 0) {
      return (
        <Card className="text-center h-48 flex flex-col justify-center items-center">
          <CardHeader>
            <CardTitle>No Designers Found</CardTitle>
            <CardDescription>Invite a designer from the Team Management page to see their stats here.</CardDescription>
          </CardHeader>
        </Card>
      )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      {designerStats.map(designer => (
        <Card key={designer.id} className="flex flex-col">
          <CardHeader className="flex flex-row items-start gap-4 space-y-0">
            <Avatar className="h-12 w-12">
              <AvatarImage src={designer.avatarUrl} data-ai-hint="person portrait" />
              <AvatarFallback>{designer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle>{designer.name}</CardTitle>
              <CardDescription>{designer.email}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="flex items-center"><FolderKanban className="mr-2 h-4 w-4" /> Total Projects: <span className="ml-auto font-semibold text-foreground">{designer.totalProjects}</span></div>
                <div className="flex items-center"><FolderClock className="mr-2 h-4 w-4" /> Active Projects: <span className="ml-auto font-semibold text-foreground">{designer.activeProjects}</span></div>
                <div className="flex items-center"><Star className="mr-2 h-4 w-4" /> Average Rating: <span className="ml-auto font-semibold text-foreground">{designer.averageRating.toFixed(1)} / 5.0</span></div>
              </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 bg-secondary/30 pt-4">
            <h4 className="text-xs text-muted-foreground font-semibold">LOGIN CREDENTIALS</h4>
            <div className="w-full flex items-center justify-between p-2 border rounded-md bg-background">
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground"/>
                    <span className="font-mono text-xs">{designer.name}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(designer.name, 'Name')}><Copy className="h-4 w-4" /></Button>
            </div>
            {designer.designerKey && (
                <div className="w-full flex items-center justify-between p-2 border rounded-md bg-background">
                    <div className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-muted-foreground"/>
                        <span className="font-mono text-xs">{designer.designerKey}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(designer.designerKey!, 'Designer Key')}><Copy className="h-4 w-4" /></Button>
                </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
