import { prisma } from './db';
import { decrypt } from './crypto';
import { createShopifyClient } from './shopify/client';
import { IdMapper } from './id-mapper';
import { BatchResult } from './migrators/base';

export async function getMigrationClients(migrationId: string) {
  const migration = await prisma.migration.findUniqueOrThrow({
    where: { id: migrationId },
  });

  const sourceClient = createShopifyClient(migration.sourceStore, decrypt(migration.sourceToken));
  const destClient = createShopifyClient(migration.destStore, decrypt(migration.destToken));
  const idMapper = new IdMapper(migrationId);

  return { migration, sourceClient, destClient, idMapper };
}

export async function updateProgress(
  migrationId: string,
  resourceType: string,
  result: BatchResult,
  cursor: string | null
): Promise<void> {
  await prisma.migrationProgress.upsert({
    where: { migrationId_resourceType: { migrationId, resourceType } },
    update: {
      completed: { increment: result.migrated },
      failed: { increment: result.failed },
      cursor: cursor,
      status: cursor ? 'RUNNING' : 'COMPLETED',
    },
    create: {
      migrationId,
      resourceType,
      completed: result.migrated,
      failed: result.failed,
      cursor,
      status: cursor ? 'RUNNING' : 'COMPLETED',
    },
  });
}
