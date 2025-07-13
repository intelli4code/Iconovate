
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingLink } from "@/components/ui/loading-link";
import { Brush, Image as ImageIcon, MessageSquareText, FileText, PencilRuler, Tags, Users, Link as LinkIcon, CaseUpper, Palette, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WebEditingHubPage() {
  const editingSections = [
    { title: "Manage Site Text", description: "Edit headlines and text on your website.", href: "/dashboard/web-editing/site-text", icon: <CaseUpper /> },
    { title: "Manage Theme", description: "Change the color palette of your website.", href: "/dashboard/web-editing/theme", icon: <Palette /> },
    { title: "Manage Portfolio", description: "Add, edit, or delete portfolio projects.", href: "/dashboard/web-editing/portfolio", icon: <Brush /> },
    { title: "Manage Team Display", description: "Choose which team members appear on the site.", href: "/dashboard/web-editing/team", icon: <Users /> },
    { title: "Manage Pricing", description: "Update your service tiers and prices.", href: "/dashboard/web-editing/pricing", icon: <Tags /> },
    { title: "Manage Services", description: "Add or edit the services you offer.", href: "/dashboard/web-editing/services", icon: <PencilRuler /> },
    { title: "Manage Testimonials", description: "Curate client testimonials for marketing pages.", href: "/dashboard/web-editing/testimonials", icon: <MessageSquareText /> },
    { title: "Manage Site Images", description: "Change key images like the homepage hero.", href: "/dashboard/web-editing/site-images", icon: <ImageIcon /> },
    { title: "Manage Footer", description: "Edit the links and text in the site footer.", href: "/dashboard/web-editing/footer", icon: <LinkIcon /> },
  ];

  return (
    <>
      <PageHeader
        title="Website Content Management"
        description="Edit the content of your public-facing marketing website from one place."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {editingSections.map((section) => (
          <Card key={section.title}>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="p-3 rounded-full bg-primary/10 text-primary">{section.icon}</div>
              <div>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <LoadingLink href={section.href}>
                  Manage
                </LoadingLink>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
