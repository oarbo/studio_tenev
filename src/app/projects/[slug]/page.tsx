import { permanentRedirect } from 'next/navigation';

export default async function LegacyProjectRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  permanentRedirect(`/work/${slug}`);
}
