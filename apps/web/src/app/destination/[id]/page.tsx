import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Legacy singular destination route.
 * Permanently redirects to canonical plural route: /destinations/[slug].
 */
export default async function LegacyDestinationRedirect({ params }: PageProps) {
  const { id } = await params;
  redirect(`/destinations/${id}`);
}
