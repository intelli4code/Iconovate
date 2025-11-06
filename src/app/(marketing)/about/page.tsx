
import AboutPageContent from "../about-page-content";
import { Suspense } from "react";
import Loading from "@/app/dashboard/loading";

export default async function AboutPage() {
    return (
        <Suspense fallback={<Loading />}>
            <AboutPageContent />
        </Suspense>
    );
}
