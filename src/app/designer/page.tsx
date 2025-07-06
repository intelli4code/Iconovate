"use client"

import { useState, useEffect } from "react"
import { collection, onSnapshot, query, where, orderBy, getDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Project, TeamMember } from "@/types"
import { PageHeader } from "@/components/page-header"
import Loading from "@/app/dashboard/loading"
import { DesignerProjectCard } from "@/components/designer-project-card"
import { useRouter } from "next/navigation"

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

  if (loading || !designer) {
    return <Loading />;
  }

  return (
    <>
      <PageHeader
        title="My Projects"
        description="A list of all projects assigned to you."
      />
       {projects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => (
                <DesignerProjectCard key={project.id} project={project} />
            ))}
        </div>
        ) : (
            <div className="col-span-full text-center text-muted-foreground p-8 border rounded-lg bg-card">
                You have no projects assigned to you yet.
            </div>
        )}
    </>
  )
}
