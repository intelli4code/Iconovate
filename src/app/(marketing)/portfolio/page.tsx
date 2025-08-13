import PortfolioPageContent from "../portfolio-page-content";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import type { PortfolioItem } from "@/types";

async function getPortfolioItems() {
    try {
        const q = query(collection(db, "portfolioItems"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate().toISOString(),
        })) as PortfolioItem[];
    } catch (error) {
        console.error("Failed to fetch portfolio items:", error);
        return [];
    }
}

export default async function PortfolioPage() {
    const portfolioItems = await getPortfolioItems();
    return <PortfolioPageContent portfolioItems={portfolioItems} />;
}
