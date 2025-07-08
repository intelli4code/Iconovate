
import { ReminderList } from "@/components/reminders/reminder-list";
import { PageHeader } from "@/components/page-header";

export default function RemindersPage() {
  return (
    <>
      <PageHeader
        title="Reminders"
        description="An overview of upcoming deadlines and due dates."
      />
      <ReminderList />
    </>
  );
}
