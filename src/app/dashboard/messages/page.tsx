
import { MessageList } from "@/components/messages/message-list";
import { PageHeader } from "@/components/page-header";

export default function MessagesPage() {
  return (
    <>
      <PageHeader
        title="Contact Messages"
        description="View all messages submitted through your website's contact form."
      />
      <MessageList />
    </>
  );
}
