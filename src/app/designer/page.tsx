"use client"

import { useState, useEffect } from "react"
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Project } from "@/types"
import { PageHeader } from "@/components/page-header"
import Loading from "@/app/dashboard/loading"
import { DesignerProjectCard } from "@/components/designer-project-card"

// Hardcoded designer name for demonstration purposes
const DESIGNER_NAME = "Casey";

export default function DesignerDashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const projectsQuery = query(
        collection(db, "projects"), 
        where("team", "array-contains", DESIGNER_NAME),
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
  }, []);

  if (loading) {
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
