
import { PageHeader } from "@/components/page-header";
import { FeaturePointsManager } from "@/components/web-editing/feature-points-manager";

export default function ManageFeaturePointsPage() {
  return (
    <>
      <PageHeader
        title="Manage Feature Points"
        description="Add, edit, or delete the feature points displayed on your homepage."
      />
      <FeaturePointsManager />
    </>
  );
}
