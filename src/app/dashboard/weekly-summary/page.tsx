
import { WeeklySummaryForm } from "@/components/weekly-summary-form";
import { PageHeader } from "@/components/page-header";

export default function WeeklySummaryPage() {
  return (
    <>
      <PageHeader
        title="AI Weekly Summary Generator"
        description="Automatically draft a professional progress email for your clients."
      />
      <WeeklySummaryForm />
    </>
  );
}
