
import PortfolioPageContent from "../portfolio-page-content";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
import type { PortfolioItem } from "@/types";

async function getPortfolioItems() {
    try {
        const allItemsQuery = query(collection(db, "portfolioItems"), orderBy("createdAt", "desc"));
        // To fix the composite index error, we'll filter first, then sort in code.
        const featuredItemsQuery = query(collection(db, "portfolioItems"), where("isFeatured", "==", true));

        const [allItemsSnapshot, featuredItemsSnapshot] = await Promise.all([
            getDocs(allItemsQuery),
            getDocs(featuredItemsQuery)
        ]);
        
        const allItems = allItemsSnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate().toISOString(),
        })) as PortfolioItem[];

        const featuredItemsData = featuredItemsSnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate().toISOString(),
        })) as PortfolioItem[];

        // Sort featured items by date descending in the code
        const featuredItems = featuredItemsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        return { allItems, featuredItems };
    } catch (error) {
        console.error("Failed to fetch portfolio items:", error);
        return { allItems: [], featuredItems: [] };
    }
}

export default async function PortfolioPage() {
    const { allItems, featuredItems } = await getPortfolioItems();
    return <PortfolioPageContent allItems={allItems} featuredItems={featuredItems} />;
}
