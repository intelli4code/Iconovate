
import { PageHeader } from "@/components/page-header";
import { ThemeManager } from "@/components/web-editing/theme-manager";

export default function ManageThemePage() {
  return (
    <>
      <PageHeader
        title="Manage Website Theme"
        description="Select a color palette to apply to your entire marketing site."
      />
      <ThemeManager />
    </>
  );
}
