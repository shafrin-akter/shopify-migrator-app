import { ShopifyClient } from '../shopify/client';
import { IdMapper } from '../id-mapper';
import { prisma } from '../db';

export interface BatchResult {
  migrated: number;
  failed: number;
  nextCursor: string | null;
  errors: Array<{ id: string; message: string }>;
}

export abstract class BaseMigrator {
  constructor(
    protected sourceClient: ShopifyClient,
    protected destClient: ShopifyClient,
    protected migrationId: string,
    protected idMapper: IdMapper
  ) {}

  abstract fetchBatch(
    cursor: string | null
  ): Promise<{ items: any[]; nextCursor: string | null }>;

  abstract migrateItem(item: any): Promise<string>; // returns dest ID

  resourceType(): string {
    return this.constructor.name.replace('Migrator', '').toLowerCase();
  }

  async processBatch(cursor: string | null): Promise<BatchResult> {
    const errors: Array<{ id: string; message: string }> = [];
    let migrated = 0;
    let failed = 0;

    const { items, nextCursor } = await this.fetchBatch(cursor);

    for (const item of items) {
      const sourceId = String(item.id);
      try {
        const destId = await this.migrateItem(item);
        await this.idMapper.save(this.resourceType(), sourceId, destId);
        await prisma.migrationLog.create({
          data: {
            migrationId: this.migrationId,
            resourceType: this.resourceType(),
            sourceId,
            destId,
            status: 'SUCCESS',
          },
        });
        migrated++;
      } catch (err: any) {
        const message = err?.message ?? String(err);
        errors.push({ id: sourceId, message });
        await prisma.migrationLog.create({
          data: {
            migrationId: this.migrationId,
            resourceType: this.resourceType(),
            sourceId,
            status: 'ERROR',
            message,
          },
        });
        failed++;
      }
    }

    return { migrated, failed, nextCursor, errors };
  }
}
