
import { ImportDataCards } from "@/components/import/import-data-cards";
import { PageHeader } from "@/components/page-header";

export default function ImportDataPage() {
  return (
    <>
      <PageHeader
        title="Import Data"
        description="Bulk-upload your data from CSV files."
      />
      <ImportDataCards />
    </>
  );
}
