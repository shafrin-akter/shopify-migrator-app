import { ShopifyClient } from '../client';
import { sleep } from '../rate-limiter';

export interface ShopifyTheme {
  id: number;
  name: string;
  role: string;
  created_at: string;
}

export interface ThemeAsset {
  key: string;
  value?: string;
  attachment?: string;
  content_type?: string;
  public_url?: string;
  size?: number;
}

export async function listThemes(client: ShopifyClient): Promise<ShopifyTheme[]> {
  const data = await client.rest.get('/themes.json');
  return data.themes;
}

export async function listThemeAssets(
  client: ShopifyClient,
  themeId: number
): Promise<ThemeAsset[]> {
  const data = await client.rest.get(`/themes/${themeId}/assets.json`);
  return data.assets;
}

export async function getThemeAsset(
  client: ShopifyClient,
  themeId: number,
  key: string
): Promise<ThemeAsset> {
  const data = await client.rest.get(`/themes/${themeId}/assets.json`, {
    'asset[key]': key,
  });
  return data.asset;
}

export async function createTheme(client: ShopifyClient, name: string): Promise<ShopifyTheme> {
  const data = await client.rest.post('/themes.json', {
    theme: { name, role: 'unpublished' },
  });
  return data.theme;
}

export async function uploadThemeAsset(
  client: ShopifyClient,
  themeId: number,
  asset: Partial<ThemeAsset>
): Promise<void> {
  await sleep(500); // theme assets need extra throttling
  await client.rest.put(`/themes/${themeId}/assets.json`, { asset });
}
