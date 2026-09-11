import {
  TemplateBuilderPage,
} from "@/components/template-builder/TemplateBuilderPage";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export const metadata = {
  title: "Template Builder | Admin",
  description: "Design and configure generic tourism content schemas.",
};

export default async function BuilderPage({
  params,
}: Props) {
  const { id } = await params;

  return (
    <TemplateBuilderPage
      templateId={id}
    />
  );
}
