
import { EmailList } from "@/components/emails/email-list";
import { PageHeader } from "@/components/page-header";

export default function CollectedEmailsPage() {
  return (
    <>
      <PageHeader
        title="Collected Emails"
        description="A list of all client emails collected through the client portal."
      />
      <EmailList />
    </>
  );
}
