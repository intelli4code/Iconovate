import PricingPageContent from "../pricing-page-content";
import { Suspense } from "react";
import Loading from "@/app/dashboard/loading";

export default async function PricingPage() {
    return (
        <Suspense fallback={<Loading />}>
            <PricingPageContent />
        </Suspense>
    );
}
