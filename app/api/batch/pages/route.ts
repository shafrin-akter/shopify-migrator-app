import { createBatchHandler } from '@/lib/batch-handler';
import { PagesMigrator } from '@/lib/migrators/pages';
export const POST = createBatchHandler((s, d, id, mapper) => new PagesMigrator(s, d, id, mapper));
