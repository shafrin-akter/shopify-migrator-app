import { BaseMigrator, BatchResult } from './base';
import { getShopInfo } from '../shopify/rest/settings';
import { prisma } from '../db';

export class SettingsMigrator extends BaseMigrator {
  resourceType() { return 'settings'; }

  async fetchBatch(cursor: string | null) {
    if (cursor) return { items: [], nextCursor: null };
    const shop = await getShopInfo(this.sourceClient);
    return { items: [shop], nextCursor: null };
  }

  async migrateItem(shop: any): Promise<string> {
    // Most shop settings are read-only via API (domain, email, etc.)
    // We can update some via GraphQL shopUpdate mutation
    const updateMutation = `
      mutation ShopUpdate($input: ShopUpdateInput!) {
        shopUpdate(input: $input) {
          shop { id }
          userErrors { field message }
        }
      }
    `;

    // Only migrate safe/overridable settings
    await this.destClient.graphql(updateMutation, {
      input: {
        name: shop.name || undefined,
      },
    }).catch(() => {}); // Best effort

    return 'settings-migrated';
  }
}

export class MetafieldDefinitionsMigrator extends BaseMigrator {
  resourceType() { return 'metafield-definitions'; }

  private ownerTypes = [
    'PRODUCT', 'PRODUCTVARIANT', 'COLLECTION', 'CUSTOMER',
    'ORDER', 'PAGE', 'BLOG', 'ARTICLE', 'SHOP',
  ];

  async fetchBatch(cursor: string | null) {
    // cursor: "ownerTypeIndex:graphqlCursor"
    const [ownerIdx, gqlCursor] = cursor ? cursor.split('|') : ['0', null];
    const idx = parseInt(ownerIdx);
    const ownerType = this.ownerTypes[idx];

    if (!ownerType) return { items: [], nextCursor: null };

    const query = `
      query($ownerType: MetafieldOwnerType!, $first: Int!, $after: String) {
        metafieldDefinitions(ownerType: $ownerType, first: $first, after: $after) {
          pageInfo { hasNextPage endCursor }
          edges { node { id name namespace key description type { name } ownerType visibleToStorefrontApi validations { name value } } }
        }
      }
    `;

    const data = await this.sourceClient.graphql<any>(query, {
      ownerType,
      first: 50,
      after: gqlCursor || null,
    });

    const { edges, pageInfo } = data.metafieldDefinitions;
    const items = edges.map((e: any) => e.node);

    let nextCursor: string | null = null;
    if (pageInfo.hasNextPage) {
      nextCursor = `${idx}|${pageInfo.endCursor}`;
    } else if (idx < this.ownerTypes.length - 1) {
      nextCursor = `${idx + 1}|`;
    }

    return { items, nextCursor };
  }

  async migrateItem(def: any): Promise<string> {
    const createMutation = `
      mutation MetafieldDefinitionCreate($definition: MetafieldDefinitionInput!) {
        metafieldDefinitionCreate(definition: $definition) {
          createdDefinition { id namespace key }
          userErrors { field message }
        }
      }
    `;

    const result = await this.destClient.graphql<any>(createMutation, {
      definition: {
        name: def.name,
        namespace: def.namespace,
        key: def.key,
        description: def.description,
        type: def.type.name,
        ownerType: def.ownerType,
        visibleToStorefrontApi: def.visibleToStorefrontApi,
        validations: def.validations,
      },
    });

    const errors = result.metafieldDefinitionCreate.userErrors;
    if (errors.length) {
      if (errors[0].message.includes('already exists')) return `skipped-${def.id}`;
      throw new Error(errors[0].message);
    }

    return result.metafieldDefinitionCreate.createdDefinition.id;
  }
}
