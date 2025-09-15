
import PortfolioPageContent from "../portfolio-page-content";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
import type { PortfolioItem } from "@/types";
import { Suspense } from "react";
import Loading from "@/app/dashboard/loading";


async function getPortfolioItems() {
    try {
        const allItemsQuery = query(collection(db, "portfolioItems"), orderBy("createdAt", "desc"));
        const featuredItemsQuery = query(collection(db, "portfolioItems"), where("isFeatured", "==", true), orderBy("createdAt", "desc"));

        const [allItemsSnapshot, featuredItemsSnapshot] = await Promise.all([
            getDocs(allItemsQuery),
            getDocs(featuredItemsQuery)
        ]);
        
        const allItems = allItemsSnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate().toISOString(),
        })) as PortfolioItem[];

        const featuredItems = featuredItemsSnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate().toISOString(),
        })) as PortfolioItem[];
        
        return { allItems, featuredItems };
    } catch (error) {
        console.error("Failed to fetch portfolio items:", error);
        return { allItems: [], featuredItems: [] };
    }
}

export default async function PortfolioPage() {
    const { allItems, featuredItems } = await getPortfolioItems();
    return (
        <Suspense fallback={<Loading />}>
            <PortfolioPageContent allItems={allItems} featuredItems={featuredItems} />
        </Suspense>
    );
}
