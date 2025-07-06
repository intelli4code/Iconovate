"use client"

import { useState, useEffect } from "react"
import { collection, onSnapshot, query, where, orderBy, getDocs } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import type { Project } from "@/types"
import { PageHeader } from "@/components/page-header"
import Loading from "@/app/dashboard/loading"
import { DesignerProjectCard } from "@/components/designer-project-card"
import { onAuthStateChanged } from "firebase/auth"
import { useRouter } from "next/navigation"

export default function DesignerDashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [designerName, setDesignerName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            const teamRef = collection(db, "teamMembers");
            const q = query(teamRef, where("email", "==", user.email));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const designerData = querySnapshot.docs[0].data();
                setDesignerName(designerData.name);
            } else {
                router.push('/designer/login');
            }
        } else {
            router.push('/designer/login');
        }
    });

    return () => unsubscribe();
  }, [router]);


  useEffect(() => {
    if (!designerName) return;

    setLoading(true);
    const projectsQuery = query(
        collection(db, "projects"), 
        where("team", "array-contains", designerName),
        orderBy("createdAt", "desc")
    );
    
    const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
      setProjects(projectsData);
      setLoading(false);
    });

    return () => {
      unsubscribeProjects();
    };
  }, [designerName]);

  if (loading || !designerName) {
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
