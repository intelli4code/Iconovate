
import ServicesPageContent from "../services-page-content";
import { Suspense } from "react";
import Loading from "@/app/dashboard/loading";

export default async function ServicesPage() {
    return (
        <Suspense fallback={<Loading />}>
            <ServicesPageContent />
        </Suspense>
    );
}
