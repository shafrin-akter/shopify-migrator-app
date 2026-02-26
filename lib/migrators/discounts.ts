import { BaseMigrator } from './base';
import {
  DISCOUNT_CODES_QUERY,
  DISCOUNT_CODE_BASIC_CREATE,
} from '../shopify/graphql/discounts';

export class DiscountsMigrator extends BaseMigrator {
  resourceType() { return 'discounts'; }

  async fetchBatch(cursor: string | null) {
    const data = await this.sourceClient.graphql<any>(DISCOUNT_CODES_QUERY, {
      first: 50,
      after: cursor,
    });
    const { edges, pageInfo } = data.codeDiscountNodes;
    return {
      items: edges.map((e: any) => e.node),
      nextCursor: pageInfo.hasNextPage ? pageInfo.endCursor : null,
    };
  }

  async migrateItem(node: any): Promise<string> {
    const discount = node.codeDiscount;
    if (!discount) return 'skipped';

    const codes = discount.codes?.edges?.map((e: any) => e.node.code) ?? [];
    if (!codes.length) return 'skipped-no-codes';

    try {
      // Build basic discount input
      const input: any = {
        title: discount.title,
        startsAt: discount.startsAt,
        endsAt: discount.endsAt || undefined,
        usageLimit: discount.usageLimit || undefined,
        appliesOncePerCustomer: discount.appliesOncePerCustomer || false,
        code: codes[0],
      };

      if (discount.customerGets?.value) {
        const val = discount.customerGets.value;
        if ('percentage' in val) {
          input.customerGets = {
            value: { percentage: val.percentage },
            items: { all: true },
          };
        } else if ('amount' in val) {
          input.customerGets = {
            value: { discountAmount: { amount: val.amount.amount, appliesOnEachItem: val.appliesToEachItem ?? false } },
            items: { all: true },
          };
        }
      }

      if (discount.minimumRequirement) {
        const req = discount.minimumRequirement;
        if ('greaterThanOrEqualToQuantity' in req) {
          input.minimumRequirement = { quantity: { greaterThanOrEqualToQuantity: req.greaterThanOrEqualToQuantity } };
        } else if ('greaterThanOrEqualToSubtotal' in req) {
          input.minimumRequirement = { subtotal: { greaterThanOrEqualToSubtotal: req.greaterThanOrEqualToSubtotal.amount } };
        }
      }

      const result = await this.destClient.graphql<any>(DISCOUNT_CODE_BASIC_CREATE, {
        basicCodeDiscount: input,
      });

      const errors = result.discountCodeBasicCreate.userErrors;
      if (errors.length) throw new Error(errors[0].message);

      return result.discountCodeBasicCreate.codeDiscountNode.id;
    } catch {
      return 'skipped-complex-discount';
    }
  }
}
