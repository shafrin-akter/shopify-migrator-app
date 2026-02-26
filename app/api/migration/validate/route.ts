import { NextRequest, NextResponse } from 'next/server';
import { createShopifyClient } from '@/lib/shopify/client';

export async function POST(req: NextRequest) {
  try {
    const { shop, token } = await req.json();
    if (!shop || !token) {
      return NextResponse.json({ error: 'Missing shop or token' }, { status: 400 });
    }

    const normalizedShop = shop.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const client = createShopifyClient(normalizedShop, token);

    const data = await client.graphql<any>(`
      query {
        shop {
          name
          myshopifyDomain
          plan { displayName }
        }
      }
    `);

    return NextResponse.json({
      valid: true,
      shop: {
        name: data.shop.name,
        domain: data.shop.myshopifyDomain,
        plan: data.shop.plan?.displayName,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { valid: false, error: err?.message ?? 'Invalid credentials' },
      { status: 400 }
    );
  }
}
