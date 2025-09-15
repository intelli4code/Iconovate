import TeamPageContent from "../team-page-content";
import { Suspense } from "react";
import Loading from "@/app/dashboard/loading";

export default async function TeamPage() {
    return (
        <Suspense fallback={<Loading />}>
            <TeamPageContent />
        </Suspense>
    );
}
