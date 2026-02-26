'use client';

import {
  BlockStack,
  Text,
  Button,
  InlineStack,
  Banner,
  Badge,
} from '@shopify/polaris';
import { useState, useEffect, useRef } from 'react';
import { MigrationProgress } from '../MigrationProgress';
import { MigrationLog } from '../MigrationLog';
import { MigrationConfig } from '@/types/migration';

interface Props {
  migrationId: string;
  config: MigrationConfig;
}

// Migration execution order (respects dependencies)
const MIGRATION_STEPS: Array<{ route: string; configKey: keyof MigrationConfig | null }> = [
  { route: 'settings', configKey: 'settings' },
  { route: 'metafield-definitions', configKey: 'metafieldDefinitions' },
  { route: 'metaobjects', configKey: 'metaobjects' },
  { route: 'inventory', configKey: 'inventory' },
  { route: 'files', configKey: 'files' },
  { route: 'products', configKey: 'products' },
  { route: 'collections', configKey: 'collections' },
  { route: 'collection-products', configKey: 'collections' }, // depends on products + collections
  { route: 'customers', configKey: 'customers' },
  { route: 'orders', configKey: 'orders' },
  { route: 'pages', configKey: 'pages' },
  { route: 'blogs', configKey: 'blogs' },
  { route: 'articles', configKey: 'blogs' },
  { route: 'themes', configKey: 'themes' },
  { route: 'menus', configKey: 'menus' },
  { route: 'redirects', configKey: 'redirects' },
  { route: 'discounts', configKey: 'discounts' },
];

export function StepMigrate({ migrationId, config }: Props) {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [progress, setProgress] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState('');
  const abortRef = useRef(false);

  // Poll for progress updates
  useEffect(() => {
    if (!running && !done) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/migration/${migrationId}`);
        const data = await res.json();
        setProgress(data.progress ?? []);
        setLogs(data.logs ?? []);
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, [running, done, migrationId]);

  async function runBatch(route: string, cursor: string | null): Promise<string | null> {
    const res = await fetch(`/api/batch/${route}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ migrationId, cursor }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.nextCursor ?? null;
  }

  async function startMigration() {
    setRunning(true);
    setDone(false);
    setError('');
    abortRef.current = false;

    const enabledSteps = MIGRATION_STEPS.filter(
      (step) => step.configKey === null || config[step.configKey]
    );

    for (const step of enabledSteps) {
      if (abortRef.current) break;
      setCurrentStep(step.route);

      let cursor: string | null = null;
      let attempts = 0;

      do {
        if (abortRef.current) break;
        try {
          cursor = await runBatch(step.route, cursor);
          attempts = 0;
        } catch (err: any) {
          attempts++;
          if (attempts >= 3) {
            console.error(`Failed step ${step.route}:`, err);
            cursor = null; // Skip to next step
            break;
          }
          await new Promise((r) => setTimeout(r, 2000 * attempts));
        }
      } while (cursor !== null);
    }

    // Final poll
    const res = await fetch(`/api/migration/${migrationId}`);
    const data = await res.json();
    setProgress(data.progress ?? []);
    setLogs(data.logs ?? []);

    setRunning(false);
    setDone(true);
    setCurrentStep('');
  }

  function stopMigration() {
    abortRef.current = true;
    setRunning(false);
    setCurrentStep('');
  }

  const totalMigrated = progress.reduce((acc, p) => acc + p.completed, 0);
  const totalFailed = progress.reduce((acc, p) => acc + p.failed, 0);

  return (
    <BlockStack gap="500">
      <BlockStack gap="200">
        <Text as="h1" variant="headingXl">Step 5: Migration</Text>
        <Text as="p" tone="subdued">
          Keep this tab open during migration. Progress is saved — you can resume if interrupted.
        </Text>
      </BlockStack>

      {done && (
        <Banner
          title="Migration Complete!"
          tone={totalFailed > 0 ? 'warning' : 'success'}
        >
          <p>
            {totalMigrated} items migrated successfully.
            {totalFailed > 0 && ` ${totalFailed} items failed — see log below.`}
          </p>
        </Banner>
      )}

      {error && (
        <Banner title="Migration Error" tone="critical">
          <p>{error}</p>
        </Banner>
      )}

      <InlineStack gap="300" align="start" blockAlign="center">
        {!running && !done && (
          <Button variant="primary" tone="critical" onClick={startMigration} size="large">
            Start Migration
          </Button>
        )}
        {running && (
          <>
            <Button onClick={stopMigration} tone="critical">Stop</Button>
            <InlineStack gap="200" blockAlign="center">
              <Badge tone="info">Running</Badge>
              {currentStep && (
                <Text as="span" tone="subdued">Processing: {currentStep}</Text>
              )}
            </InlineStack>
          </>
        )}
        {done && (
          <InlineStack gap="300">
            <Badge tone="success">Completed</Badge>
            <Text as="span" variant="bodyMd">{totalMigrated} migrated · {totalFailed} failed</Text>
          </InlineStack>
        )}
      </InlineStack>

      <MigrationProgress progress={progress} />
      <MigrationLog logs={logs} />
    </BlockStack>
  );
}
