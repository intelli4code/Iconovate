import MarketingLayout from "../layout";
import { FooterContent } from "@/components/marketing/footer";
import { db } from "@/lib/firebase";
import { getDoc, doc } from "firebase/firestore";
import type { FooterContent as FooterContentType } from "@/types";
import ServicesPageContent from "../services-page-content";

async function getFooterData(): Promise<FooterContentType | null> {
    try {
        const contentDocRef = doc(db, "siteContent", "main");
        const docSnap = await getDoc(contentDocRef);
        if (docSnap.exists() && docSnap.data().footer) {
            const footerData = docSnap.data().footer as FooterContentType;
            footerData.columns.sort((a, b) => a.order - b.order);
            return footerData;
        }
        return null;
    } catch (error) {
        console.error("Failed to fetch footer data:", error);
        return null;
    }
}

export default async function ServicesPage() {
    const footerData = await getFooterData();

    return (
        <MarketingLayout footer={<FooterContent footerData={footerData} />}>
            <ServicesPageContent />
        </MarketingLayout>
    );
}
