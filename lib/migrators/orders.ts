import { BaseMigrator } from './base';

export class OrdersMigrator extends BaseMigrator {
  resourceType() { return 'orders'; }

  async fetchBatch(cursor: string | null) {
    const params: Record<string, string> = {
      status: 'any',
      limit: '50',
    };
    if (cursor) {
      // cursor is the last order id for since_id pagination
      params.since_id = cursor;
    }

    const data = await this.sourceClient.rest.get('/orders.json', params);
    const orders = data.orders ?? [];
    const nextCursor =
      orders.length === 50 ? String(orders[orders.length - 1].id) : null;

    return { items: orders, nextCursor };
  }

  async migrateItem(order: any): Promise<string> {
    // Map customer ID
    let customerId: string | undefined;
    if (order.customer?.id) {
      const destCustomerId = await this.idMapper.get('customers', `gid://shopify/Customer/${order.customer.id}`);
      if (destCustomerId && !destCustomerId.startsWith('skipped-')) {
        customerId = destCustomerId.split('/').pop();
      }
    }

    // Map line items
    const lineItems = await Promise.all(
      (order.line_items ?? []).map(async (item: any) => {
        const mapped: any = {
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          requires_shipping: item.requires_shipping,
          taxable: item.taxable,
          grams: item.grams,
          fulfillment_status: item.fulfillment_status,
        };

        if (item.variant_id) {
          const destVariantId = await this.idMapper.get(
            'variants',
            `gid://shopify/ProductVariant/${item.variant_id}`
          );
          if (destVariantId) {
            mapped.variant_id = destVariantId.split('/').pop();
          }
        }

        return mapped;
      })
    );

    const orderPayload: any = {
      line_items: lineItems,
      financial_status: order.financial_status,
      fulfillment_status: order.fulfillment_status || null,
      email: order.email,
      tags: order.tags,
      note: order.note,
      currency: order.currency,
      total_price: order.total_price,
      send_receipt: false,
      send_fulfillment_receipt: false,
    };

    if (customerId) orderPayload.customer = { id: customerId };

    if (order.billing_address) {
      orderPayload.billing_address = order.billing_address;
    }
    if (order.shipping_address) {
      orderPayload.shipping_address = order.shipping_address;
    }

    const result = await this.destClient.rest.post('/orders.json', { order: orderPayload });
    if (!result.order) throw new Error('Failed to create order');

    return `gid://shopify/Order/${result.order.id}`;
  }
}
