
import { ImportDataCards } from "@/components/import/import-data-cards";
import { PageHeader } from "@/components/page-header";
import { Suspense } from "react";
import Loading from "../loading";

export default function ImportDataPage() {
  return (
    <>
      <PageHeader
        title="Import Data"
        description="Bulk-upload your data from CSV files."
      />
      <Suspense fallback={<Loading />}>
        <ImportDataCards />
      </Suspense>
    </>
  );
}
