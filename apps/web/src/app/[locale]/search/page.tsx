import { Metadata } from 'next';
import { SearchPage } from '@/components/search/SearchPage';

interface Props {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    q?: string;
    district?: string;
    category?: string;
    contentType?: string;
    page?: string;
  }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { locale } = await params;
  const { q } = await searchParams;

  const title = q
    ? `Search: "${q}" | CG Tourism Discovery`
    : 'Explore & Discover Tourism | CG Tourism';

  const description =
    'Search and discover pristine waterfalls, ancient heritage temples, national parks, and tribal culture across Chhattisgarh.';

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/search${q ? `?q=${encodeURIComponent(q)}` : ''}`,
    },
    robots: {
      index: !q, // Prevent indexing arbitrary search query combinations to prevent duplicate SEO crawl bloat
      follow: true,
    },
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;

  return (
    <SearchPage
      locale={locale}
      query={query.q ?? ''}
      district={query.district}
      category={query.category}
      contentType={query.contentType}
      page={Number(query.page ?? '1')}
    />
  );
}
