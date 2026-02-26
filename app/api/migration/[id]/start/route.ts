import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getMigrationClients } from '@/lib/migration-helpers';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { migration, sourceClient } = await getMigrationClients(id);
    const config = migration.config as Record<string, boolean>;

    const counts: Record<string, number> = {};

    const countQueries: Array<{ key: string; query: string }> = [
      { key: 'products', query: `{ productsCount { count } }` },
      { key: 'collections', query: `{ collectionsCount { count } }` },
      { key: 'customers', query: `{ customersCount { count } }` },
    ];

    for (const { key, query } of countQueries) {
      if (config[key]) {
        try {
          const data = await sourceClient.graphql<any>(query);
          const countKey = `${key}Count`;
          counts[key] = data[countKey]?.count ?? 0;
        } catch {
          counts[key] = 0;
        }
      }
    }

    const resources = Object.keys(config).filter((k) => config[k]);
    await Promise.all(
      resources.map((resourceType) =>
        prisma.migrationProgress.upsert({
          where: { migrationId_resourceType: { migrationId: id, resourceType } },
          update: { status: 'PENDING', total: counts[resourceType] ?? 0 },
          create: {
            migrationId: id,
            resourceType,
            status: 'PENDING',
            total: counts[resourceType] ?? 0,
          },
        })
      )
    );

    await prisma.migration.update({
      where: { id },
      data: { status: 'RUNNING' },
    });

    return NextResponse.json({ counts });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
