'use client';

import { BlockStack, Text, Button, InlineStack } from '@shopify/polaris';
import { StoreCard } from '../StoreCard';

interface Props {
  onNext: (shop: string, token: string) => void;
}

export function StepConnectSource({ onNext }: Props) {
  let shop = '', token = '';

  return (
    <BlockStack gap="500">
      <BlockStack gap="200">
        <Text as="h1" variant="headingXl">Step 1: Connect Source Store</Text>
        <Text as="p" tone="subdued">
          This is the store you want to migrate data FROM. You need an Admin API access token
          with read access to all resource types.
        </Text>
      </BlockStack>

      <StoreCard
        label="Source Store"
        onValidated={(s, t, _info) => {
          shop = s;
          token = t;
        }}
      />

      <InlineStack align="end">
        <Button
          variant="primary"
          onClick={() => {
            if (shop && token) onNext(shop, token);
          }}
        >
          Next: Connect Destination →
        </Button>
      </InlineStack>
    </BlockStack>
  );
}
