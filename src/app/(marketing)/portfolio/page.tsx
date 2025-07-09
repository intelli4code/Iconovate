
import { PortfolioItemCard } from "@/components/marketing/portfolio-item-card";
import { db } from "@/lib/firebase";
import type { PortfolioItem } from "@/types";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export default async function PortfolioPage() {
  const portfolioItems = await (async () => {
    try {
      const q = query(collection(db, "portfolioItems"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PortfolioItem[];
    } catch (error) {
      console.error("Failed to fetch portfolio items:", error);
      return [];
    }
  })();

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold">Our Work</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We take pride in our work. Here’s a selection of projects that showcase our passion for design and strategic thinking.
        </p>
      </section>

      <section className="mt-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolioItems.map((item) => (
            <PortfolioItemCard key={item.id} item={item} />
          ))}
        </div>
        {portfolioItems.length === 0 && (
          <p className="text-center text-muted-foreground mt-16">No portfolio items have been added yet.</p>
        )}
      </section>
    </div>
  );
}
