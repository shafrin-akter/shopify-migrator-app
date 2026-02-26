'use client';

import { Card, DataTable, Text, Badge, BlockStack, InlineStack } from '@shopify/polaris';

interface LogItem {
  id: string;
  resourceType: string;
  sourceId: string | null;
  destId: string | null;
  status: string;
  message: string | null;
  createdAt: string;
}

export function MigrationLog({ logs }: { logs: LogItem[] }) {
  const rows = logs.map((log) => [
    log.resourceType,
    log.sourceId ?? '—',
    <Badge
      tone={
        log.status === 'SUCCESS' ? 'success'
        : log.status === 'ERROR' ? 'critical'
        : 'warning'
      }
    >
      {log.status}
    </Badge>,
    <Text as="span" variant="bodySm" tone={log.status === 'ERROR' ? 'critical' : undefined}>
      {log.message ?? ''}
    </Text>,
    new Date(log.createdAt).toLocaleTimeString(),
  ]);

  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between">
          <Text as="h2" variant="headingMd">Migration Log</Text>
          <Text as="span" variant="bodySm" tone="subdued">(last 100 entries)</Text>
        </InlineStack>
        {logs.length > 0 ? (
          <DataTable
            columnContentTypes={['text', 'text', 'text', 'text', 'text']}
            headings={['Resource', 'Source ID', 'Status', 'Message', 'Time']}
            rows={rows}
            truncate
          />
        ) : (
          <Text as="p" tone="subdued">No log entries yet</Text>
        )}
      </BlockStack>
    </Card>
  );
}
