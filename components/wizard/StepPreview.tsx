'use client';

import {
  BlockStack,
  Text,
  Button,
  InlineStack,
  Card,
  DataTable,
  Badge,
  Spinner,
} from '@shopify/polaris';
import { useState, useEffect } from 'react';
import { MigrationConfig } from '@/types/migration';

interface Props {
  migrationId: string;
  config: MigrationConfig;
  onNext: () => void;
  onBack: () => void;
}

interface CountRow {
  resource: string;
  count: number | 'loading' | 'error';
}

const RESOURCE_LABELS: Record<string, string> = {
  settings: 'Store Settings',
  metafieldDefinitions: 'Metafield Definitions',
  metaobjects: 'Metaobjects',
  files: 'Files & Media',
  products: 'Products',
  collections: 'Collections',
  customers: 'Customers',
  orders: 'Orders',
  pages: 'Pages',
  blogs: 'Blogs & Articles',
  themes: 'Themes',
  menus: 'Navigation Menus',
  redirects: 'URL Redirects',
  discounts: 'Discounts',
  inventory: 'Inventory Locations',
};

export function StepPreview({ migrationId, config, onNext, onBack }: Props) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/migration/${migrationId}/start`, { method: 'POST' })
      .then((r) => r.json())
      .then((data) => {
        setCounts(data.counts ?? {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [migrationId]);

  const rows = Object.entries(config)
    .filter(([, enabled]) => enabled)
    .map(([key]) => [
      RESOURCE_LABELS[key] ?? key,
      loading ? (
        <Spinner size="small" />
      ) : counts[key] !== undefined ? (
        String(counts[key])
      ) : (
        <Badge>N/A</Badge>
      ),
    ]);

  return (
    <BlockStack gap="500">
      <BlockStack gap="200">
        <Text as="h1" variant="headingXl">Step 4: Preview</Text>
        <Text as="p" tone="subdued">
          Review what will be migrated. Counts shown where available.
        </Text>
      </BlockStack>

      <Card>
        <BlockStack gap="300">
          <Text as="h2" variant="headingMd">Resources to Migrate</Text>
          <DataTable
            columnContentTypes={['text', 'numeric']}
            headings={['Resource Type', 'Items in Source']}
            rows={rows}
          />
        </BlockStack>
      </Card>

      <InlineStack align="space-between">
        <Button onClick={onBack}>← Back</Button>
        <Button
          variant="primary"
          onClick={onNext}
          disabled={loading}
          tone="critical"
        >
          Start Migration →
        </Button>
      </InlineStack>
    </BlockStack>
  );
}
