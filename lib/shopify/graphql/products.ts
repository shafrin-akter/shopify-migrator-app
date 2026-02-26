export const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          title
          handle
          descriptionHtml
          vendor
          productType
          tags
          status
          templateSuffix
          seo { title description }
          options { name values }
          variants(first: 100) {
            edges {
              node {
                id
                title
                sku
                barcode
                price
                compareAtPrice
                weight
                weightUnit
                inventoryPolicy
                fulfillmentService
                inventoryManagement
                requiresShipping
                taxable
                taxCode
                position
                selectedOptions { name value }
                inventoryQuantity
              }
            }
          }
          images(first: 50) {
            edges {
              node { id src altText position }
            }
          }
          metafields(first: 50) {
            edges {
              node { namespace key value type }
            }
          }
        }
      }
    }
  }
`;

export const PRODUCT_CREATE_MUTATION = `
  mutation ProductCreate($input: ProductInput!) {
    productCreate(input: $input) {
      product { id variants(first: 100) { edges { node { id sku } } } }
      userErrors { field message }
    }
  }
`;

export const PRODUCT_COUNT_QUERY = `
  query { productsCount { count } }
`;
