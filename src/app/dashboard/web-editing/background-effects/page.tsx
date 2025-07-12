
import { PageHeader } from "@/components/page-header";
import { BackgroundEffectsManager } from "@/components/web-editing/background-effects-manager";

export default function ManageBackgroundEffectsPage() {
  return (
    <>
      <PageHeader
        title="Manage Background Effects"
        description="Control the subtle, animated gradients on your marketing website."
      />
      <BackgroundEffectsManager />
    </>
  );
}
