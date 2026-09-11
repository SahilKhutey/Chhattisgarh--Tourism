import { TemplateVersionsPage } from "@/components/template-versions/TemplateVersionsPage";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;

  return <TemplateVersionsPage templateId={id} />;
}
