import { createBatchHandler } from '@/lib/batch-handler';
import { CollectionProductsMigrator } from '@/lib/migrators/collections';
export const POST = createBatchHandler((s, d, id, mapper) => new CollectionProductsMigrator(s, d, id, mapper));
