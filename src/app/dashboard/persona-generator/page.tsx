import { PersonaGeneratorForm } from "@/components/persona-generator-form";
import { PageHeader } from "@/components/page-header";

export default function PersonaGeneratorPage() {
  return (
    <>
      <PageHeader
        title="AI Persona Generator"
        description="Generate detailed user personas from a simple brand description."
      />
      <PersonaGeneratorForm />
    </>
  );
}
