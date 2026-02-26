'use client';

import {
  BlockStack,
  Text,
  Button,
  InlineStack,
  Card,
  Checkbox,
  Divider,
} from '@shopify/polaris';
import { useState } from 'react';
import { MigrationConfig } from '@/types/migration';

interface Props {
  onNext: (config: MigrationConfig) => void;
  onBack: () => void;
}

const ALL_RESOURCES: Array<{ key: keyof MigrationConfig; label: string; description: string }> = [
  { key: 'settings', label: 'Store Settings', description: 'Shop name and basic settings' },
  { key: 'metafieldDefinitions', label: 'Metafield Definitions', description: 'Custom field schemas' },
  { key: 'metaobjects', label: 'Metaobjects', description: 'Custom structured content' },
  { key: 'files', label: 'Files & Media', description: 'Images, videos, documents' },
  { key: 'products', label: 'Products', description: 'Products with variants, images, metafields' },
  { key: 'collections', label: 'Collections', description: 'Product collections (manual + smart)' },
  { key: 'customers', label: 'Customers', description: 'Customer accounts and addresses' },
  { key: 'orders', label: 'Orders', description: 'Order history (requires write_orders scope)' },
  { key: 'pages', label: 'Pages', description: 'Store pages' },
  { key: 'blogs', label: 'Blogs & Articles', description: 'Blog posts and articles' },
  { key: 'themes', label: 'Themes', description: 'All themes and their assets' },
  { key: 'menus', label: 'Navigation Menus', description: 'Header, footer, and custom menus' },
  { key: 'redirects', label: 'URL Redirects', description: 'HTTP redirects' },
  { key: 'discounts', label: 'Discounts', description: 'Discount codes and price rules' },
  { key: 'inventory', label: 'Inventory Locations', description: 'Store locations' },
];

export function StepConfigure({ onNext, onBack }: Props) {
  const [config, setConfig] = useState<MigrationConfig>(() =>
    Object.fromEntries(ALL_RESOURCES.map((r) => [r.key, true])) as unknown as MigrationConfig
  );

  function toggle(key: keyof MigrationConfig) {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function selectAll() {
    setConfig(Object.fromEntries(ALL_RESOURCES.map((r) => [r.key, true])) as unknown as MigrationConfig);
  }

  function selectNone() {
    setConfig(Object.fromEntries(ALL_RESOURCES.map((r) => [r.key, false])) as unknown as MigrationConfig);
  }

  const selectedCount = Object.values(config).filter(Boolean).length;

  return (
    <BlockStack gap="500">
      <BlockStack gap="200">
        <Text as="h1" variant="headingXl">Step 3: Configure Migration</Text>
        <Text as="p" tone="subdued">
          Select which data types to migrate. All are enabled by default.
        </Text>
      </BlockStack>

      <Card>
        <BlockStack gap="400">
          <InlineStack align="space-between" blockAlign="center">
            <Text as="span" variant="bodyMd">{selectedCount} of {ALL_RESOURCES.length} selected</Text>
            <InlineStack gap="200">
              <Button size="slim" onClick={selectAll}>Select All</Button>
              <Button size="slim" onClick={selectNone}>Clear All</Button>
            </InlineStack>
          </InlineStack>
          <Divider />
          <BlockStack gap="300">
            {ALL_RESOURCES.map((resource) => (
              <Checkbox
                key={resource.key}
                label={
                  <InlineStack gap="200">
                    <Text as="span" variant="bodyMd" fontWeight="semibold">{resource.label}</Text>
                    <Text as="span" tone="subdued" variant="bodySm">— {resource.description}</Text>
                  </InlineStack>
                }
                checked={config[resource.key]}
                onChange={() => toggle(resource.key)}
              />
            ))}
          </BlockStack>
        </BlockStack>
      </Card>

      <InlineStack align="space-between">
        <Button onClick={onBack}>← Back</Button>
        <Button
          variant="primary"
          onClick={() => onNext(config)}
          disabled={selectedCount === 0}
        >
          Next: Preview →
        </Button>
      </InlineStack>
    </BlockStack>
  );
}
