import ContactPageContent from "../contact-page-content";
import { Suspense } from "react";
import Loading from "@/app/dashboard/loading";

export default async function ContactPage() {
    return (
        <Suspense fallback={<Loading />}>
            <ContactPageContent />
        </Suspense>
    );
}
