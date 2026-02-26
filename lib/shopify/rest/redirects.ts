import { ShopifyClient } from '../client';

export interface ShopifyRedirect {
  id: number;
  path: string;
  target: string;
}

export async function listRedirects(
  client: ShopifyClient,
  limit = 250,
  sinceId?: number
): Promise<ShopifyRedirect[]> {
  const params: Record<string, string> = { limit: String(limit) };
  if (sinceId) params.since_id = String(sinceId);
  const data = await client.rest.get('/redirects.json', params);
  return data.redirects;
}

export async function createRedirects(
  client: ShopifyClient,
  redirects: Array<Omit<ShopifyRedirect, 'id'>>
): Promise<void> {
  // Create in bulk using individual calls
  for (const redirect of redirects) {
    try {
      await client.rest.post('/redirects.json', { redirect });
    } catch {
      // Ignore duplicates
    }
  }
}
