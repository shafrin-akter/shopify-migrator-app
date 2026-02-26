import { withRetry, sleep } from './rate-limiter';

export interface ShopifyClient {
  graphql<T = any>(query: string, variables?: Record<string, unknown>): Promise<T>;
  rest: {
    get(path: string, params?: Record<string, unknown>): Promise<any>;
    post(path: string, body: Record<string, unknown>): Promise<any>;
    put(path: string, body: Record<string, unknown>): Promise<any>;
    delete(path: string): Promise<void>;
  };
  shop: string;
  token: string;
}

const API_VERSION = '2024-01';

export function createShopifyClient(shop: string, token: string): ShopifyClient {
  const base = `https://${shop}/admin/api/${API_VERSION}`;
  const headers = {
    'X-Shopify-Access-Token': token,
    'Content-Type': 'application/json',
  };

  async function graphql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    return withRetry(async () => {
      const res = await fetch(`${base}/graphql.json`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables }),
      });
      if (!res.ok) {
        const err: any = new Error(`GraphQL HTTP ${res.status}`);
        err.status = res.status;
        err.response = res;
        throw err;
      }
      const json = await res.json();
      if (json.errors?.length) {
        throw new Error(json.errors[0].message);
      }
      return json.data as T;
    });
  }

  async function restRequest(method: string, path: string, body?: unknown): Promise<any> {
    return withRetry(async () => {
      await sleep(500); // conservative REST rate limiting (~2 req/s)
      const res = await fetch(`${base}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const err: any = new Error(`REST ${method} ${path} → HTTP ${res.status}`);
        err.status = res.status;
        err.response = res;
        throw err;
      }
      if (res.status === 204) return null;
      return res.json();
    });
  }

  return {
    shop,
    token,
    graphql,
    rest: {
      get: (path, params) => {
        const url = params
          ? `${path}?${new URLSearchParams(params as Record<string, string>).toString()}`
          : path;
        return restRequest('GET', url);
      },
      post: (path, body) => restRequest('POST', path, body),
      put: (path, body) => restRequest('PUT', path, body),
      delete: (path) => restRequest('DELETE', path),
    },
  };
}
