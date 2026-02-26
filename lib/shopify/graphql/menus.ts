export const MENUS_QUERY = `
  query GetMenus {
    menus(first: 20) {
      edges {
        node {
          id
          title
          handle
          items {
            id
            title
            type
            url
            resourceId
            items {
              id
              title
              type
              url
              resourceId
            }
          }
        }
      }
    }
  }
`;

export const MENU_CREATE_MUTATION = `
  mutation MenuCreate($title: String!, $handle: String!, $items: [MenuItemCreateInput!]!) {
    menuCreate(title: $title, handle: $handle, items: $items) {
      menu { id handle }
      userErrors { field message }
    }
  }
`;
