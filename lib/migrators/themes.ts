import { BaseMigrator, BatchResult } from './base';
import {
  listThemes,
  listThemeAssets,
  getThemeAsset,
  createTheme,
  uploadThemeAsset,
  ShopifyTheme,
} from '../shopify/rest/themes';
import { sleep } from '../shopify/rate-limiter';
import { prisma } from '../db';

export class ThemesMigrator extends BaseMigrator {
  resourceType() { return 'themes'; }

  async fetchBatch(cursor: string | null) {
    // cursor: "themeSourceId:assetIndex"
    const sourceThemes = await listThemes(this.sourceClient);

    if (!cursor) {
      // Return first theme as the first item to process
      return {
        items: sourceThemes,
        nextCursor: null, // themes processes differently - full themes list at once
      };
    }

    return { items: [], nextCursor: null };
  }

  async migrateItem(theme: ShopifyTheme): Promise<string> {
    const themeId = theme.id;
    // Create theme on destination
    const destTheme = await createTheme(this.destClient, `${theme.name} (Migrated)`);

    // Get all asset keys
    const assets = await listThemeAssets(this.sourceClient, themeId);

    // Upload assets in batches of 3 to avoid rate limits
    for (let i = 0; i < assets.length; i += 3) {
      const batch = assets.slice(i, i + 3);
      await Promise.all(
        batch.map(async (assetRef) => {
          try {
            const asset = await getThemeAsset(this.sourceClient, themeId, assetRef.key);
            const payload: any = { key: asset.key };

            if (asset.attachment) {
              payload.attachment = asset.attachment;
            } else if (asset.value !== undefined) {
              payload.value = asset.value;
            } else if (asset.public_url) {
              payload.src = asset.public_url;
            }

            await uploadThemeAsset(this.destClient, destTheme.id, payload);
          } catch {
            // Skip problematic assets
          }
        })
      );
      await sleep(1000);
    }

    return `theme-${destTheme.id}`;
  }

  // Override processBatch for themes since they're not paginated the same way
  async processBatch(cursor: string | null): Promise<BatchResult> {
    if (cursor) return { migrated: 0, failed: 0, nextCursor: null, errors: [] };

    const errors: Array<{ id: string; message: string }> = [];
    let migrated = 0;
    let failed = 0;

    const sourceThemes = await listThemes(this.sourceClient);

    for (const theme of sourceThemes) {
      try {
        const destId = await this.migrateItem(theme);
        await this.idMapper.save('themes', String(theme.id), destId);
        await prisma.migrationLog.create({
          data: {
            migrationId: this.migrationId,
            resourceType: 'themes',
            sourceId: String(theme.id),
            destId,
            status: 'SUCCESS',
          },
        });
        migrated++;
      } catch (err: any) {
        const message = err?.message ?? String(err);
        errors.push({ id: String(theme.id), message });
        await prisma.migrationLog.create({
          data: {
            migrationId: this.migrationId,
            resourceType: 'themes',
            sourceId: String(theme.id),
            status: 'ERROR',
            message,
          },
        });
        failed++;
      }
    }

    return { migrated, failed, nextCursor: null, errors };
  }
}
