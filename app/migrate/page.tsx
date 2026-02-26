'use client';

import { useState } from 'react';
import { Page, Layout, Card } from '@shopify/polaris';
import { StepConnectSource } from '@/components/wizard/StepConnectSource';
import { StepConnectDest } from '@/components/wizard/StepConnectDest';
import { StepConfigure } from '@/components/wizard/StepConfigure';
import { StepPreview } from '@/components/wizard/StepPreview';
import { StepMigrate } from '@/components/wizard/StepMigrate';
import { MigrationConfig } from '@/types/migration';

type Step = 1 | 2 | 3 | 4 | 5;

export default function MigratePage() {
  const [step, setStep] = useState<Step>(1);
  const [sourceShop, setSourceShop] = useState('');
  const [sourceToken, setSourceToken] = useState('');
  const [destShop, setDestShop] = useState('');
  const [destToken, setDestToken] = useState('');
  const [config, setConfig] = useState<MigrationConfig | null>(null);
  const [migrationId, setMigrationId] = useState<string | null>(null);

  async function createMigration(cfg: MigrationConfig) {
    const res = await fetch('/api/migration/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceShop,
        sourceToken,
        destShop,
        destToken,
        config: cfg,
      }),
    });
    const data = await res.json();
    return data.id as string;
  }

  return (
    <div style={{ minHeight: '100vh', padding: '20px 0' }}>
      <Page
        title="Shopify Store Migrator"
        subtitle="Transfer all data from one store to another"
        narrowWidth
      >
        <Layout>
          <Layout.Section>
            <Card>
              <div style={{ padding: '8px 0 16px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div
                      key={s}
                      style={{
                        flex: 1,
                        height: '4px',
                        borderRadius: '2px',
                        background: s <= step ? '#008060' : '#e4e5e7',
                        transition: 'background 0.3s',
                      }}
                    />
                  ))}
                </div>
              </div>
            </Card>
          </Layout.Section>

          <Layout.Section>
            {step === 1 && (
              <StepConnectSource
                onNext={(shop, token) => {
                  setSourceShop(shop);
                  setSourceToken(token);
                  setStep(2);
                }}
              />
            )}

            {step === 2 && (
              <StepConnectDest
                onNext={(shop, token) => {
                  setDestShop(shop);
                  setDestToken(token);
                  setStep(3);
                }}
                onBack={() => setStep(1)}
              />
            )}

            {step === 3 && (
              <StepConfigure
                onNext={async (cfg) => {
                  setConfig(cfg);
                  // Create migration job now so preview can call /start
                  const id = await createMigration(cfg);
                  setMigrationId(id);
                  setStep(4);
                }}
                onBack={() => setStep(2)}
              />
            )}

            {step === 4 && config && migrationId && (
              <StepPreview
                migrationId={migrationId}
                config={config}
                onNext={() => setStep(5)}
                onBack={() => setStep(3)}
              />
            )}

            {step === 5 && config && migrationId && (
              <StepMigrate migrationId={migrationId} config={config} />
            )}
          </Layout.Section>
        </Layout>
      </Page>
    </div>
  );
}
