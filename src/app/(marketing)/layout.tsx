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
        <div className="absolute left-[-35rem] top-[-25rem] h-[70rem] w-[70rem] bg-gradient-radial from-primary/30 to-transparent blur-3xl" />
        <div className="absolute bottom-[-30rem] right-[-35rem] h-[80rem] w-[80rem] bg-gradient-radial from-fuchsia-500/20 to-transparent blur-3xl" />
      </div>
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
