import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account, team, and application settings."
      />
      <Card>
        <CardHeader>
          <CardTitle>Under Construction</CardTitle>
          <CardDescription>
            This section is currently being developed. Check back soon for more features!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Future settings will include:</p>
          <ul className="list-disc list-inside mt-2 text-muted-foreground">
            <li>User Profile Management</li>
            <li>Team Roles & Permissions</li>
            <li>Billing & Subscription</li>
            <li>Mockup & Template Library Management</li>
            <li>API & Integrations</li>
          </ul>
        </CardContent>
      </Card>
    </>
  )
}
