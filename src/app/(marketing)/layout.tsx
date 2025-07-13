import { MarketingHeader } from '@/components/marketing/header';
import MarketingLayoutWrapper from './marketing-layout-wrapper';

export default function MarketingLayout({
  children,
  footer
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
}) {

  return (
    <MarketingLayoutWrapper footer={footer}>
      {children}
    </MarketingLayoutWrapper>
  );
}
