import { createBatchHandler } from '@/lib/batch-handler';
import { CollectionsMigrator } from '@/lib/migrators/collections';
export const POST = createBatchHandler((s, d, id, mapper) => new CollectionsMigrator(s, d, id, mapper));
