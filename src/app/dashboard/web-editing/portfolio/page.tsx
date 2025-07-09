
import { PortfolioManager } from "@/components/web-editing/portfolio-manager";
import { PageHeader } from "@/components/page-header";

export default function ManagePortfolioPage() {
  return (
    <>
      <PageHeader
        title="Manage Portfolio"
        description="Add, edit, and delete the portfolio items displayed on your website."
      />
      <PortfolioManager />
    </>
  );
}
