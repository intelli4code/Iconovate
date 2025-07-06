import { BriefAnalysisForm } from "@/components/brief-analysis-form";
import { PageHeader } from "@/components/page-header";

export default function BriefAnalysisPage() {
  return (
    <>
      <PageHeader
        title="AI Project Brief Analysis"
        description="Paste a client's brief to get a suggested timeline, risks, and clarifying questions."
      />
      <BriefAnalysisForm />
    </>
  );
}
