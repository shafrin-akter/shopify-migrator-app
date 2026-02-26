import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { encrypt } from '@/lib/crypto';

export async function POST(req: NextRequest) {
  try {
    const { sourceShop, sourceToken, destShop, destToken, config } = await req.json();

    if (!sourceShop || !sourceToken || !destShop || !destToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const migration = await prisma.migration.create({
      data: {
        sourceStore: sourceShop.replace(/^https?:\/\//, '').replace(/\/$/, ''),
        destStore: destShop.replace(/^https?:\/\//, '').replace(/\/$/, ''),
        sourceToken: encrypt(sourceToken),
        destToken: encrypt(destToken),
        status: 'PENDING',
        config: config ?? {
          settings: true,
          metafieldDefinitions: true,
          metaobjects: true,
          files: true,
          products: true,
          collections: true,
          customers: true,
          orders: true,
          pages: true,
          blogs: true,
          themes: true,
          menus: true,
          redirects: true,
          discounts: true,
          inventory: true,
        },
      },
    });

    return NextResponse.json({ id: migration.id });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
