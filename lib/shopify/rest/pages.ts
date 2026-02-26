import { ShopifyClient } from '../client';

export interface ShopifyPage {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  template_suffix: string | null;
  published: boolean;
  published_at: string | null;
  metafields?: Array<{ namespace: string; key: string; value: string; type: string }>;
}

export async function listPages(
  client: ShopifyClient,
  limit = 50,
  sinceId?: number
): Promise<ShopifyPage[]> {
  const params: Record<string, string> = { limit: String(limit) };
  if (sinceId) params.since_id = String(sinceId);
  const data = await client.rest.get('/pages.json', params);
  return data.pages;
}

export async function createPage(
  client: ShopifyClient,
  page: Partial<ShopifyPage>
): Promise<ShopifyPage> {
  const data = await client.rest.post('/pages.json', { page });
  return data.page;
}
