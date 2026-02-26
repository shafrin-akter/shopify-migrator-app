'use client';

import { BlockStack, Text, Button, InlineStack, Banner } from '@shopify/polaris';
import { StoreCard } from '../StoreCard';

interface Props {
  onNext: (shop: string, token: string) => void;
  onBack: () => void;
}

export function StepConnectDest({ onNext, onBack }: Props) {
  let shop = '', token = '';

  return (
    <BlockStack gap="500">
      <BlockStack gap="200">
        <Text as="h1" variant="headingXl">Step 2: Connect Destination Store</Text>
        <Text as="p" tone="subdued">
          This is the store you want to migrate data TO. The token needs write access to all
          resource types (products, orders, customers, themes, etc.).
        </Text>
      </BlockStack>

      <Banner tone="warning">
        <p>
          <strong>Warning:</strong> Migration will create new data in the destination store.
          Existing data will NOT be deleted. Consider starting with a fresh store to avoid duplicates.
        </p>
      </Banner>

      <StoreCard
        label="Destination Store"
        onValidated={(s, t, _info) => {
          shop = s;
          token = t;
        }}
      />

      <InlineStack align="space-between">
        <Button onClick={onBack}>← Back</Button>
        <Button
          variant="primary"
          onClick={() => {
            if (shop && token) onNext(shop, token);
          }}
        >
          Next: Configure Migration →
        </Button>
      </InlineStack>
    </BlockStack>
  );
}
