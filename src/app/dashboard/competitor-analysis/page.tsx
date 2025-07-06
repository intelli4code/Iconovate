import { CompetitorAnalysisForm } from "@/components/competitor-analysis-form";
import { PageHeader } from "@/components/page-header";

export default function CompetitorAnalysisPage() {
  return (
    <>
      <PageHeader
        title="AI Competitor Analysis"
        description="Analyze a competitor's branding just by providing their website URL."
      />
      <CompetitorAnalysisForm />
    </>
  );
}
