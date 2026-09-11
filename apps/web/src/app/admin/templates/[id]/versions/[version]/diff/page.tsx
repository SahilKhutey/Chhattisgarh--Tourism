import { TemplateVersionDiffPage } from "@/components/template-versions/TemplateVersionDiffPage";

interface Props {
  params: Promise<{
    id: string;
    version: string;
  }>;
}

export default async function Page({ params }: Props) {
  const { id, version } = await params;

  return (
    <TemplateVersionDiffPage
      templateId={id}
      version={Number(version)}
    />
  );
}
