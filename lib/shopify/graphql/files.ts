export const FILES_QUERY = `
  query GetFiles($first: Int!, $after: String) {
    files(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          ... on MediaImage {
            id
            alt
            image { originalSrc }
          }
          ... on GenericFile {
            id
            alt
            url
          }
          ... on Video {
            id
            alt
            sources { url mimeType }
          }
        }
      }
    }
  }
`;

export const FILE_CREATE_MUTATION = `
  mutation FileCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files {
        ... on MediaImage { id }
        ... on GenericFile { id }
        ... on Video { id }
      }
      userErrors { field message }
    }
  }
`;
