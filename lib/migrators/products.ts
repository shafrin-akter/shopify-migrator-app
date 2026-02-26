import { BaseMigrator, BatchResult } from './base';
import { PRODUCTS_QUERY, PRODUCT_CREATE_MUTATION } from '../shopify/graphql/products';

interface ProductNode {
  id: string;
  title: string;
  handle: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  tags: string[];
  status: string;
  templateSuffix: string | null;
  seo: { title: string; description: string };
  options: Array<{ name: string; values: string[] }>;
  variants: { edges: Array<{ node: any }> };
  images: { edges: Array<{ node: { id: string; src: string; altText: string; position: number } }> };
  metafields: { edges: Array<{ node: { namespace: string; key: string; value: string; type: string } }> };
}

export class ProductsMigrator extends BaseMigrator {
  resourceType() { return 'products'; }

  async fetchBatch(cursor: string | null) {
    const data = await this.sourceClient.graphql<any>(PRODUCTS_QUERY, {
      first: 50,
      after: cursor,
    });
    const { edges, pageInfo } = data.products;
    return {
      items: edges.map((e: any) => e.node) as ProductNode[],
      nextCursor: pageInfo.hasNextPage ? pageInfo.endCursor : null,
    };
  }

  async migrateItem(product: ProductNode): Promise<string> {
    const images = product.images.edges.map((e) => ({
      src: e.node.src,
      altText: e.node.altText,
    }));

    const variants = product.variants.edges.map((e) => {
      const v = e.node;
      return {
        sku: v.sku || undefined,
        barcode: v.barcode || undefined,
        price: v.price,
        compareAtPrice: v.compareAtPrice || undefined,
        weight: v.weight || undefined,
        weightUnit: v.weightUnit || undefined,
        requiresShipping: v.requiresShipping,
        taxable: v.taxable,
        inventoryPolicy: v.inventoryPolicy,
        options: v.selectedOptions.map((o: any) => o.value),
      };
    });

    const metafields = product.metafields.edges.map((e) => ({
      namespace: e.node.namespace,
      key: e.node.key,
      value: e.node.value,
      type: e.node.type,
    }));

    const input = {
      title: product.title,
      descriptionHtml: product.descriptionHtml,
      vendor: product.vendor,
      productType: product.productType,
      tags: product.tags,
      status: product.status,
      handle: product.handle,
      templateSuffix: product.templateSuffix || undefined,
      seo: product.seo,
      options: product.options.map((o) => o.name),
      images,
      variants,
      metafields,
    };

    const result = await this.destClient.graphql<any>(PRODUCT_CREATE_MUTATION, { input });
    const errors = result.productCreate.userErrors;
    if (errors.length) throw new Error(errors[0].message);

    const destProduct = result.productCreate.product;

    // Save variant ID mappings
    const sourceVariants = product.variants.edges;
    const destVariants = destProduct.variants.edges;
    for (let i = 0; i < sourceVariants.length; i++) {
      if (destVariants[i]) {
        await this.idMapper.save(
          'variants',
          sourceVariants[i].node.id,
          destVariants[i].node.id
        );
      }
    }

    return destProduct.id;
  }
}
