export const METAFIELD_DEFINITIONS_QUERY = `
  query GetMetafieldDefinitions($ownerType: MetafieldOwnerType!, $first: Int!, $after: String) {
    metafieldDefinitions(ownerType: $ownerType, first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          name
          namespace
          key
          description
          type { name }
          ownerType
          visibleToStorefrontApi
          validations { name value }
        }
      }
    }
  }
`;

export const METAFIELD_DEFINITION_CREATE = `
  mutation MetafieldDefinitionCreate($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition { id namespace key }
      userErrors { field message }
    }
  }
`;

export const OWNER_TYPES = [
  'PRODUCT',
  'PRODUCTVARIANT',
  'COLLECTION',
  'CUSTOMER',
  'ORDER',
  'PAGE',
  'BLOG',
  'ARTICLE',
  'SHOP',
  'LOCATION',
] as const;
