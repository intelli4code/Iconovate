
import { MarketingHeader } from '@/components/marketing/header';
import MarketingLayoutWrapper from './marketing-layout-wrapper';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { FooterContent as FooterContentType } from '@/types';
import { FooterContent } from '@/components/marketing/footer';

async function getFooterData() {
  const contentDocRef = doc(db, "siteContent", "main");
  const contentDoc = await getDoc(contentDocRef);
  
  if (contentDoc.exists()) {
    const contentData = contentDoc.data();
    if(contentData.footer) {
      const footerData = contentData.footer as FooterContentType;
      footerData.columns.sort((a,b) => a.order - b.order);
      return footerData;
    }
  }
  return null;
}

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const footerData = await getFooterData();

  return (
    <MarketingLayoutWrapper footer={<FooterContent footerData={footerData} />}>
      {children}
    </MarketingLayoutWrapper>
  );
}
