import { BaseMigrator, BatchResult } from './base';
import { listLocations } from '../shopify/rest/settings';
import { prisma } from '../db';

export class InventoryMigrator extends BaseMigrator {
  resourceType() { return 'inventory'; }

  async fetchBatch(cursor: string | null) {
    if (cursor) return { items: [], nextCursor: null };
    const locations = await listLocations(this.sourceClient);
    return { items: locations, nextCursor: null };
  }

  async migrateItem(location: any): Promise<string> {
    // Create location on destination
    const result = await this.destClient.rest.post('/locations.json', {
      location: {
        name: location.name,
        address1: location.address1,
        address2: location.address2,
        city: location.city,
        province: location.province,
        zip: location.zip,
        country_code: location.country_code,
        phone: location.phone,
      },
    });

    if (!result.location) throw new Error('Failed to create location');

    await this.idMapper.save('locations', String(location.id), String(result.location.id));
    return `location-${result.location.id}`;
  }
}
