export type MigrationStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PARTIAL';
export type ResourceStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
export type LogStatus = 'SUCCESS' | 'ERROR' | 'SKIPPED';

export type ResourceType =
  | 'settings'
  | 'metafield-definitions'
  | 'metaobjects'
  | 'files'
  | 'products'
  | 'collections'
  | 'collection-products'
  | 'customers'
  | 'orders'
  | 'pages'
  | 'blogs'
  | 'articles'
  | 'themes'
  | 'menus'
  | 'redirects'
  | 'discounts'
  | 'inventory';

export interface MigrationConfig {
  settings: boolean;
  metafieldDefinitions: boolean;
  metaobjects: boolean;
  files: boolean;
  products: boolean;
  collections: boolean;
  customers: boolean;
  orders: boolean;
  pages: boolean;
  blogs: boolean;
  themes: boolean;
  menus: boolean;
  redirects: boolean;
  discounts: boolean;
  inventory: boolean;
}

export interface MigrationProgressItem {
  resourceType: ResourceType;
  status: ResourceStatus;
  total: number;
  completed: number;
  failed: number;
  cursor: string | null;
}

export interface MigrationLogItem {
  id: string;
  resourceType: string;
  sourceId: string | null;
  destId: string | null;
  status: LogStatus;
  message: string | null;
  createdAt: string;
}

export interface MigrationDetail {
  id: string;
  sourceStore: string;
  destStore: string;
  status: MigrationStatus;
  config: MigrationConfig;
  progress: MigrationProgressItem[];
  logs: MigrationLogItem[];
  createdAt: string;
  updatedAt: string;
}

export interface BatchResult {
  migrated: number;
  failed: number;
  nextCursor: string | null;
  errors: Array<{ id: string; message: string }>;
}

export interface StoreConnection {
  shop: string;
  token: string;
}
