import { BaseMigrator, BatchResult } from './base';
import { MENUS_QUERY, MENU_CREATE_MUTATION } from '../shopify/graphql/menus';
import { prisma } from '../db';

export class MenusMigrator extends BaseMigrator {
  resourceType() { return 'menus'; }

  async fetchBatch(cursor: string | null) {
    if (cursor) return { items: [], nextCursor: null };
    const data = await this.sourceClient.graphql<any>(MENUS_QUERY);
    const items = data.menus.edges.map((e: any) => e.node);
    return { items, nextCursor: null };
  }

  async migrateItem(menu: any): Promise<string> {
    function mapItems(items: any[]): any[] {
      return items.map((item: any) => ({
        title: item.title,
        type: item.type,
        url: item.url,
        resourceId: item.resourceId || undefined,
        items: item.items?.length ? mapItems(item.items) : undefined,
      }));
    }

    const result = await this.destClient.graphql<any>(MENU_CREATE_MUTATION, {
      title: menu.title,
      handle: menu.handle,
      items: mapItems(menu.items),
    });

    const errors = result.menuCreate.userErrors;
    if (errors.length) throw new Error(errors[0].message);

    return result.menuCreate.menu.id;
  }
}
