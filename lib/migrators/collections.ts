import { BaseMigrator } from './base';
import {
  COLLECTIONS_QUERY,
  COLLECTION_CREATE_MUTATION,
  COLLECTION_PRODUCTS_QUERY,
  COLLECTION_ADD_PRODUCTS_MUTATION,
} from '../shopify/graphql/collections';

export class CollectionsMigrator extends BaseMigrator {
  resourceType() { return 'collections'; }

  async fetchBatch(cursor: string | null) {
    const data = await this.sourceClient.graphql<any>(COLLECTIONS_QUERY, {
      first: 50,
      after: cursor,
    });
    const { edges, pageInfo } = data.collections;
    return {
      items: edges.map((e: any) => e.node),
      nextCursor: pageInfo.hasNextPage ? pageInfo.endCursor : null,
    };
  }

  async migrateItem(collection: any): Promise<string> {
    const input: any = {
      title: collection.title,
      handle: collection.handle,
      descriptionHtml: collection.descriptionHtml,
      templateSuffix: collection.templateSuffix || undefined,
      sortOrder: collection.sortOrder,
      seo: collection.seo,
      metafields: collection.metafields.edges.map((e: any) => ({
        namespace: e.node.namespace,
        key: e.node.key,
        value: e.node.value,
        type: e.node.type,
      })),
    };

    if (collection.image?.src) {
      input.image = { src: collection.image.src, altText: collection.image.altText };
    }

    if (collection.ruleSet) {
      input.ruleSet = {
        appliedDisjunctively: collection.ruleSet.appliedDisjunctively,
        rules: collection.ruleSet.rules,
      };
    }

    const result = await this.destClient.graphql<any>(COLLECTION_CREATE_MUTATION, { input });
    const errors = result.collectionCreate.userErrors;
    if (errors.length) throw new Error(errors[0].message);

    return result.collectionCreate.collection.id;
  }
}

export class CollectionProductsMigrator extends BaseMigrator {
  resourceType() { return 'collection-products'; }

  async fetchBatch(cursor: string | null) {
    // cursor format: "collectionId:productCursor"
    const [collSourceId, productCursor] = cursor ? cursor.split('|') : [null, null];

    // Get all collection source IDs
    const allMappings = await this.idMapper.getAll('collections');
    const collIds = Array.from(allMappings.keys());

    if (!collIds.length) return { items: [], nextCursor: null };

    const currentCollId = collSourceId || collIds[0];

    const data = await this.sourceClient.graphql<any>(COLLECTION_PRODUCTS_QUERY, {
      id: currentCollId,
      first: 50,
      after: productCursor || null,
    });

    if (!data.collection) return { items: [], nextCursor: null };

    const { edges, pageInfo } = data.collection.products;
    const products = edges.map((e: any) => e.node.id);

    let nextCursor: string | null = null;
    if (pageInfo.hasNextPage) {
      nextCursor = `${currentCollId}|${pageInfo.endCursor}`;
    } else {
      // Move to next collection
      const idx = collIds.indexOf(currentCollId);
      if (idx < collIds.length - 1) {
        nextCursor = `${collIds[idx + 1]}|`;
      }
    }

    return {
      items: [{ collectionSourceId: currentCollId, productIds: products }],
      nextCursor,
    };
  }

  async migrateItem(item: { collectionSourceId: string; productIds: string[] }): Promise<string> {
    const destCollId = await this.idMapper.get('collections', item.collectionSourceId);
    if (!destCollId) throw new Error(`No dest collection for ${item.collectionSourceId}`);

    // Map product IDs
    const destProductIds: string[] = [];
    for (const srcId of item.productIds) {
      const destId = await this.idMapper.get('products', srcId);
      if (destId) destProductIds.push(destId);
    }

    if (!destProductIds.length) return destCollId;

    const result = await this.destClient.graphql<any>(COLLECTION_ADD_PRODUCTS_MUTATION, {
      id: destCollId,
      productIds: destProductIds,
    });

    const errors = result.collectionAddProducts.userErrors;
    if (errors.length) throw new Error(errors[0].message);

    return destCollId;
  }
}
