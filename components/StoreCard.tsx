'use client';

import {
  Card,
  TextField,
  Button,
  Badge,
  BlockStack,
  Text,
  InlineStack,
} from '@shopify/polaris';
import { useState } from 'react';

interface StoreCardProps {
  label: string;
  onValidated: (shop: string, token: string, info: { name: string; domain: string; plan?: string }) => void;
}

export function StoreCard({ label, onValidated }: StoreCardProps) {
  const [shop, setShop] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validated, setValidated] = useState<{ name: string; domain: string; plan?: string } | null>(null);

  async function handleValidate() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/migration/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop, token }),
      });
      const data = await res.json();
      if (data.valid) {
        setValidated(data.shop);
        onValidated(shop, token, data.shop);
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h2" variant="headingMd">{label}</Text>
          {validated && <Badge tone="success">Connected</Badge>}
        </InlineStack>

        {validated ? (
          <BlockStack gap="200">
            <Text as="p" variant="bodyMd" tone="subdued">
              {validated.name} ({validated.domain})
            </Text>
            {validated.plan && (
              <Text as="p" variant="bodySm" tone="subdued">Plan: {validated.plan}</Text>
            )}
            <Button onClick={() => { setValidated(null); onValidated('', '', { name: '', domain: '' }); }}>
              Disconnect
            </Button>
          </BlockStack>
        ) : (
          <BlockStack gap="300">
            <TextField
              label="Shop URL"
              placeholder="my-store.myshopify.com"
              value={shop}
              onChange={setShop}
              autoComplete="off"
              helpText="e.g. my-store.myshopify.com"
            />
            <TextField
              label="Admin API Access Token"
              placeholder="shpat_..."
              value={token}
              onChange={setToken}
              type="password"
              autoComplete="off"
              helpText="Found in Shopify Admin → Apps → Custom apps → Your app"
            />
            {error && <Text as="p" tone="critical">{error}</Text>}
            <Button
              variant="primary"
              onClick={handleValidate}
              loading={loading}
              disabled={!shop || !token}
            >
              Validate & Connect
            </Button>
          </BlockStack>
        )}
      </BlockStack>
    </Card>
  );
}
