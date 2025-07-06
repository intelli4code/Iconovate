
import { PageHeader } from "@/components/page-header";
import { ReviewList } from "@/components/reviews/review-list";

export default function ReviewsPage() {
  return (
    <>
      <PageHeader
        title="Client Reviews"
        description="See what your clients are saying about your work."
      />
      <ReviewList />
    </>
  );
}
