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
        <div className="absolute left-[-20rem] top-[-15rem] h-[50rem] w-[50rem] bg-gradient-radial from-primary/25 to-transparent blur-3xl" />
        <div className="absolute bottom-[-20rem] right-[-20rem] h-[60rem] w-[60rem] bg-gradient-radial from-fuchsia-500/15 to-transparent blur-3xl" />
      </div>
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
