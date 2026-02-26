import { createBatchHandler } from '@/lib/batch-handler';
import { MetaobjectsMigrator } from '@/lib/migrators/metafields';
export const POST = createBatchHandler((s, d, id, mapper) => new MetaobjectsMigrator(s, d, id, mapper));
