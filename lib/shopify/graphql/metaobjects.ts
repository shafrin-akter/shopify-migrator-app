export const METAOBJECT_DEFINITIONS_QUERY = `
  query GetMetaobjectDefinitions($first: Int!, $after: String) {
    metaobjectDefinitions(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          type
          name
          description
          displayNameKey
          fieldDefinitions {
            key
            name
            description
            required
            type { name }
          }
        }
      }
    }
  }
`;

export const METAOBJECT_DEFINITION_CREATE = `
  mutation MetaobjectDefinitionCreate($definition: MetaobjectDefinitionCreateInput!) {
    metaobjectDefinitionCreate(definition: $definition) {
      metaobjectDefinition { id type }
      userErrors { field message }
    }
  }
`;

export const METAOBJECTS_QUERY = `
  query GetMetaobjects($type: String!, $first: Int!, $after: String) {
    metaobjects(type: $type, first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          handle
          type
          displayName
          fields { key value jsonValue type }
        }
      }
    }
  }
`;

export const METAOBJECT_CREATE = `
  mutation MetaobjectCreate($metaobject: MetaobjectCreateInput!) {
    metaobjectCreate(metaobject: $metaobject) {
      metaobject { id handle }
      userErrors { field message }
    }
  }
`;
