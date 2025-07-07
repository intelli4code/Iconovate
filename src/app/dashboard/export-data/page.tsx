import { ExportDataCards } from "@/components/export/export-data-cards";
import { PageHeader } from "@/components/page-header";

export default function ExportDataPage() {
  return (
    <>
      <PageHeader
        title="Export Data"
        description="Download your application data in CSV format."
      />
      <ExportDataCards />
    </>
  );
}
