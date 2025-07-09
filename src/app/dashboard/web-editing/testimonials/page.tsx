
import { PageHeader } from "@/components/page-header";
import { TestimonialsManager } from "@/components/web-editing/testimonials-manager";

export default function ManageTestimonialsPage() {
  return (
    <>
      <PageHeader
        title="Manage Testimonials"
        description="Add, edit, or delete the client testimonials on your website."
      />
      <TestimonialsManager />
    </>
  );
}
