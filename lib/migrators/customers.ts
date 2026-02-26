import { BaseMigrator } from './base';
import { CUSTOMERS_QUERY, CUSTOMER_CREATE_MUTATION } from '../shopify/graphql/customers';

export class CustomersMigrator extends BaseMigrator {
  resourceType() { return 'customers'; }

  async fetchBatch(cursor: string | null) {
    const data = await this.sourceClient.graphql<any>(CUSTOMERS_QUERY, {
      first: 50,
      after: cursor,
    });
    const { edges, pageInfo } = data.customers;
    return {
      items: edges.map((e: any) => e.node),
      nextCursor: pageInfo.hasNextPage ? pageInfo.endCursor : null,
    };
  }

  async migrateItem(customer: any): Promise<string> {
    const input: any = {
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone || undefined,
      note: customer.note || undefined,
      tags: customer.tags,
      taxExempt: customer.taxExempt,
      addresses: customer.addresses.map((a: any) => ({
        address1: a.address1,
        address2: a.address2,
        city: a.city,
        company: a.company,
        country: a.country,
        countryCode: a.countryCodeV2,
        firstName: a.firstName,
        lastName: a.lastName,
        phone: a.phone,
        province: a.province,
        provinceCode: a.provinceCode,
        zip: a.zip,
      })),
      metafields: customer.metafields.edges.map((e: any) => ({
        namespace: e.node.namespace,
        key: e.node.key,
        value: e.node.value,
        type: e.node.type,
      })),
    };

    const result = await this.destClient.graphql<any>(CUSTOMER_CREATE_MUTATION, { input });
    const errors = result.customerCreate.userErrors;
    if (errors.length) {
      // Skip duplicate email errors
      if (errors[0].message.includes('email') && errors[0].message.includes('taken')) {
        return `skipped-${customer.id}`;
      }
      throw new Error(errors[0].message);
    }

    return result.customerCreate.customer.id;
  }
}
