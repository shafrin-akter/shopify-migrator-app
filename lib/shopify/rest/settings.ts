import { ShopifyClient } from '../client';

export async function getShopInfo(client: ShopifyClient): Promise<Record<string, unknown>> {
  const data = await client.rest.get('/shop.json');
  return data.shop;
}

export async function getShippingZones(client: ShopifyClient): Promise<unknown[]> {
  const data = await client.rest.get('/shipping_zones.json');
  return data.shipping_zones ?? [];
}

export async function listLocations(client: ShopifyClient): Promise<unknown[]> {
  const data = await client.rest.get('/locations.json');
  return data.locations ?? [];
}

export async function getScriptTags(client: ShopifyClient): Promise<unknown[]> {
  const data = await client.rest.get('/script_tags.json');
  return data.script_tags ?? [];
}

export async function createScriptTag(
  client: ShopifyClient,
  tag: { event: string; src: string }
): Promise<void> {
  await client.rest.post('/script_tags.json', { script_tag: tag });
}
