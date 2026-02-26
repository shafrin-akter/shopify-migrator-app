export const CUSTOMERS_QUERY = `
  query GetCustomers($first: Int!, $after: String) {
    customers(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          firstName
          lastName
          email
          phone
          note
          tags
          taxExempt
          taxExemptions
          addresses {
            address1
            address2
            city
            company
            country
            countryCodeV2
            firstName
            lastName
            phone
            province
            provinceCode
            zip
          }
          defaultAddress {
            address1
            address2
            city
            company
            country
            firstName
            lastName
            phone
            province
            zip
          }
          metafields(first: 20) {
            edges { node { namespace key value type } }
          }
        }
      }
    }
  }
`;

export const CUSTOMER_CREATE_MUTATION = `
  mutation CustomerCreate($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer { id email }
      userErrors { field message }
    }
  }
`;
