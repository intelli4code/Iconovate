
import ShopPageContent from "../shop-page-content";
import { Suspense } from "react";
import Loading from "@/app/dashboard/loading";

export default async function ShopPage() {
    return (
        <Suspense fallback={<Loading />}>
            <ShopPageContent />
        </Suspense>
    );
}
