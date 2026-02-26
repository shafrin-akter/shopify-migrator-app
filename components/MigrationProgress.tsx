'use client';

import { Card, BlockStack, Text, ProgressBar, Badge, InlineStack } from '@shopify/polaris';

interface ProgressItem {
  resourceType: string;
  status: string;
  total: number;
  completed: number;
  failed: number;
}

const RESOURCE_LABELS: Record<string, string> = {
  settings: 'Store Settings',
  'metafield-definitions': 'Metafield Definitions',
  metaobjects: 'Metaobjects',
  files: 'Files & Media',
  products: 'Products',
  collections: 'Collections',
  'collection-products': 'Collection ↔ Product Links',
  customers: 'Customers',
  orders: 'Orders',
  pages: 'Pages',
  blogs: 'Blogs',
  articles: 'Articles',
  themes: 'Themes',
  menus: 'Navigation Menus',
  redirects: 'URL Redirects',
  discounts: 'Discounts',
  inventory: 'Inventory Locations',
};

function statusTone(status: string): 'info' | 'success' | 'critical' | 'warning' | undefined {
  switch (status) {
    case 'RUNNING': return 'info';
    case 'COMPLETED': return 'success';
    case 'FAILED': return 'critical';
    default: return undefined;
  }
}

export function MigrationProgress({ progress }: { progress: ProgressItem[] }) {
  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">Migration Progress</Text>
        {progress.map((item) => {
          const pct = item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0;
          const label = RESOURCE_LABELS[item.resourceType] ?? item.resourceType;
          return (
            <BlockStack key={item.resourceType} gap="200">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="span" variant="bodyMd">{label}</Text>
                <InlineStack gap="200" blockAlign="center">
                  {item.failed > 0 && (
                    <Text as="span" tone="critical" variant="bodySm">{item.failed} failed</Text>
                  )}
                  <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                </InlineStack>
              </InlineStack>
              <ProgressBar
                progress={item.status === 'PENDING' ? 0 : item.status === 'COMPLETED' && item.total === 0 ? 100 : pct}
                size="small"
                tone={item.failed > 0 ? 'critical' : 'highlight'}
              />
              {item.total > 0 && (
                <Text as="p" variant="bodySm" tone="subdued">
                  {item.completed} / {item.total} ({pct}%)
                </Text>
              )}
            </BlockStack>
          );
        })}
        {progress.length === 0 && (
          <Text as="p" tone="subdued">No progress data yet</Text>
        )}
      </BlockStack>
    </Card>
  );
}
