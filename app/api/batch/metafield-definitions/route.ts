import { createBatchHandler } from '@/lib/batch-handler';
import { MetafieldDefinitionsMigrator } from '@/lib/migrators/settings';
export const POST = createBatchHandler((s, d, id, mapper) => new MetafieldDefinitionsMigrator(s, d, id, mapper));
