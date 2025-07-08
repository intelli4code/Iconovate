
"use client"

import { useState, useEffect, useMemo } from "react"
import { collection, onSnapshot, query, orderBy, where, doc } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth";
import type { Project, Invoice, TeamMember } from "@/types"
import ClassicDashboard from "@/components/dashboards/classic-dashboard"
import ModernDashboard from "@/components/dashboards/modern-dashboard"
import Loading from "./loading"

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState<'classic' | 'modern'>('classic');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        if (user?.email) {
            const userDocRef = doc(db, "teamMembers", user.uid); // Assuming user's auth UID is doc ID
            const q = query(collection(db, "teamMembers"), where("email", "==", user.email));
            
            const unsubscribeUser = onSnapshot(q, (querySnapshot) => {
                if (!querySnapshot.empty) {
                    const userData = querySnapshot.docs[0].data() as TeamMember;
                    setLayout(userData.dashboardLayout || 'classic');
                }
            });
            return () => unsubscribeUser();
        }
    });

    const projectsQuery = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const invoicesQuery = query(collection(db, "invoices"));
    const teamQuery = query(collection(db, "teamMembers"));
    
    const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
      setProjects(projectsData);
    });

    const unsubscribeInvoices = onSnapshot(invoicesQuery, (snapshot) => {
      const invoicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Invoice[];
      setInvoices(invoicesData);
    });

    const unsubscribeTeam = onSnapshot(teamQuery, (snapshot) => {
        const teamData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TeamMember[];
        setTeamMembers(teamData);
    });

    Promise.all([new Promise(res => onSnapshot(projectsQuery, res)), new Promise(res => onSnapshot(invoicesQuery, res)), new Promise(res => onSnapshot(teamQuery, res))]).then(() => {
        setLoading(false);
    })

    return () => {
      unsubscribeAuth();
      unsubscribeProjects();
      unsubscribeInvoices();
      unsubscribeTeam();
    };
  }, []);

  const dashboardData = useMemo(() => {
    if (loading) return null;
    return { projects, invoices, teamMembers };
  }, [loading, projects, invoices, teamMembers]);

  if (loading || !dashboardData) {
    return <Loading />;
  }

  return (
    <>
      {layout === 'classic' ? (
        <ClassicDashboard {...dashboardData} />
      ) : (
        <ModernDashboard {...dashboardData} />
      )}
    </>
  );
}
