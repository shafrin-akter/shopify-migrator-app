export const DISCOUNT_CODES_QUERY = `
  query GetDiscountCodes($first: Int!, $after: String) {
    codeDiscountNodes(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          codeDiscount {
            ... on DiscountCodeBasic {
              title
              startsAt
              endsAt
              status
              usageLimit
              appliesOncePerCustomer
              codes(first: 50) { edges { node { code } } }
              customerGets {
                value {
                  ... on DiscountPercentage { percentage }
                  ... on DiscountAmount { amount { amount currencyCode } appliesToEachItem }
                }
                items {
                  ... on AllDiscountItems { allItems }
                  ... on DiscountProducts {
                    products(first: 10) { edges { node { id } } }
                  }
                  ... on DiscountCollections {
                    collections(first: 10) { edges { node { id } } }
                  }
                }
              }
              minimumRequirement {
                ... on DiscountMinimumQuantity { greaterThanOrEqualToQuantity }
                ... on DiscountMinimumSubtotal { greaterThanOrEqualToSubtotal { amount currencyCode } }
              }
            }
            ... on DiscountCodeFreeShipping {
              title
              startsAt
              endsAt
              status
              usageLimit
              appliesOncePerCustomer
              codes(first: 50) { edges { node { code } } }
            }
            ... on DiscountCodeBxgy {
              title
              startsAt
              endsAt
              status
              codes(first: 50) { edges { node { code } } }
            }
          }
        }
      }
    }
  }
`;

export const DISCOUNT_CODE_BASIC_CREATE = `
  mutation DiscountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
    discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
      codeDiscountNode { id }
      userErrors { field message }
    }
  }
`;

export const AUTOMATIC_DISCOUNTS_QUERY = `
  query GetAutomaticDiscounts($first: Int!, $after: String) {
    automaticDiscountNodes(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          automaticDiscount {
            ... on DiscountAutomaticBasic {
              title
              startsAt
              endsAt
              status
              customerGets {
                value {
                  ... on DiscountPercentage { percentage }
                  ... on DiscountAmount { amount { amount currencyCode } }
                }
                items {
                  ... on AllDiscountItems { allItems }
                }
              }
            }
          }
        }
      }
    }
  }
`;
