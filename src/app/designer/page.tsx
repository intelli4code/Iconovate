"use client"

import { useState, useEffect, useMemo } from "react"
import { collection, onSnapshot, query, where, orderBy, getDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Project, TeamMember } from "@/types"
import { PageHeader } from "@/components/page-header"
import Loading from "@/app/dashboard/loading"
import { DesignerProjectCard } from "@/components/designer-project-card"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { FolderKanban, FolderCheck, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

function CompletedProjectReviewCard({ project }: { project: Project }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>For client: {project.client}</CardDescription>
            </CardHeader>
            <CardContent>
                {project.rating && project.review ? (
                    <>
                        <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={cn(
                                        'h-5 w-5',
                                        (project.rating || 0) > i ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
                                    )}
                                />
                            ))}
                        </div>
                        <p className="text-muted-foreground italic">"{project.review}"</p>
                    </>
                ) : (
                    <p className="text-muted-foreground text-sm">This project was completed, but no review was left.</p>
                )}
            </CardContent>
             <CardFooter>
                 <Link href={`/designer/projects/${project.id}`} className="text-sm text-primary hover:underline">
                    View Project Details
                </Link>
            </CardFooter>
        </Card>
    );
}


export default function DesignerDashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [designer, setDesigner] = useState<TeamMember | null>(null);
  const router = useRouter();

  useEffect(() => {
    const designerId = sessionStorage.getItem('designerId');
    if (!designerId) {
        router.push('/designer/login');
        return;
    }

    const fetchDesigner = async () => {
        const designerDocRef = doc(db, "teamMembers", designerId);
        const designerDoc = await getDoc(designerDocRef);
        if (designerDoc.exists()) {
            setDesigner(designerDoc.data() as TeamMember);
        } else {
            router.push('/designer/login');
        }
    };
    fetchDesigner();
  }, [router]);


  useEffect(() => {
    if (!designer) return;

    setLoading(true);
    const projectsQuery = query(
        collection(db, "projects"), 
        where("team", "array-contains", designer.name),
        orderBy("createdAt", "desc")
    );
    
    const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
      setProjects(projectsData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching designer projects: ", error);
        setLoading(false);
    });

    return () => {
      unsubscribeProjects();
    };
  }, [designer]);

  const { stats, activeProjectsList, completedProjectsList } = useMemo(() => {
    if (!projects || projects.length === 0) {
      return { stats: { total: 0, completed: 0, averageRating: 0, ratedCount: 0 }, activeProjectsList: [], completedProjectsList: [] };
    }

    const active = projects.filter(p => p.status !== 'Completed' && p.status !== 'Canceled');
    const completed = projects.filter(p => p.status === 'Completed');
    const rated = completed.filter(p => p.rating && p.rating > 0);
    const avgRating = rated.length > 0 ? rated.reduce((acc, p) => acc + p.rating!, 0) / rated.length : 0;
    
    return {
        stats: {
            total: projects.length,
            completed: completed.length,
            averageRating: avgRating,
            ratedCount: rated.length,
        },
        activeProjectsList: active,
        completedProjectsList: completed
    };

  }, [projects]);


  if (loading || !designer) {
    return <Loading />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome, ${designer.name.split(' ')[0]}`}
        description="Here's an overview of your projects and performance."
      />
      <div className="grid gap-4 md:grid-cols-3">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Assigned Projects</CardTitle>
                  <FolderKanban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">All projects you've been assigned to</p>
              </CardContent>
          </Card>
           <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
                  <FolderCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{stats.completed}</div>
                  <p className="text-xs text-muted-foreground">Successfully delivered projects</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)} / 5.0</div>
                  <p className="text-xs text-muted-foreground">From {stats.ratedCount} client reviews</p>
              </CardContent>
          </Card>
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Active Projects</h2>
        {activeProjectsList.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeProjectsList.map(project => (
                    <DesignerProjectCard key={project.id} project={project} />
                ))}
            </div>
        ) : (
            <div className="text-center text-muted-foreground p-8 border rounded-lg bg-card">
                You have no active projects right now. Great job!
            </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Completed Projects & Reviews</h2>
        {completedProjectsList.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedProjectsList.map(project => (
                    <CompletedProjectReviewCard key={project.id} project={project} />
                ))}
            </div>
        ) : (
            <div className="text-center text-muted-foreground p-8 border rounded-lg bg-card">
                You haven't completed any projects yet.
            </div>
        )}
      </div>
    </div>
  )
}
