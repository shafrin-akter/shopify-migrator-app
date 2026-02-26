import { NextRequest, NextResponse } from 'next/server';
import { getMigrationClients, updateProgress } from './migration-helpers';
import { BaseMigrator } from './migrators/base';

type MigratorFactory = (
  sourceClient: any,
  destClient: any,
  migrationId: string,
  idMapper: any
) => BaseMigrator;

export function createBatchHandler(factory: MigratorFactory) {
  return async function POST(req: NextRequest) {
    try {
      const { migrationId, cursor } = await req.json();
      if (!migrationId) {
        return NextResponse.json({ error: 'Missing migrationId' }, { status: 400 });
      }

      const { sourceClient, destClient, idMapper } = await getMigrationClients(migrationId);
      const migrator = factory(sourceClient, destClient, migrationId, idMapper);
      const result = await migrator.processBatch(cursor ?? null);

      await updateProgress(migrationId, migrator.resourceType(), result, result.nextCursor);

      return NextResponse.json(result);
    } catch (err: any) {
      console.error(err);
      return NextResponse.json({ error: err?.message }, { status: 500 });
    }
  };
}
