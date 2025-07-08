import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import HomePage from "./(marketing)/home/page";
import HomePageContent from "./(marketing)/home/page";

export default function RootPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-body">
      <MarketingHeader />
      <main className="flex-1">
        <HomePageContent />
      </main>
      <MarketingFooter />
    </div>
  );
}
