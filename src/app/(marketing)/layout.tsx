import { MarketingHeader } from '@/components/marketing/header';
import { MarketingFooter } from '@/components/marketing/footer';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate flex min-h-screen flex-col bg-[#0d1222] font-body text-foreground">
       <div 
        className="absolute inset-0 z-[-1] overflow-hidden" 
        aria-hidden="true"
      >
        <div className="absolute right-[-40rem] top-[-30rem] h-[80rem] w-[80rem] bg-gradient-radial from-purple-500/15 to-transparent blur-3xl" />
        <div className="absolute left-[-30rem] bottom-[-10rem] h-[70rem] w-[70rem] bg-gradient-radial from-primary/20 to-transparent blur-3xl" />
      </div>
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
