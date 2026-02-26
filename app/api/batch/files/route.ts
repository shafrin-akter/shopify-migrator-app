import { createBatchHandler } from '@/lib/batch-handler';
import { FilesMigrator } from '@/lib/migrators/files';
export const POST = createBatchHandler((s, d, id, mapper) => new FilesMigrator(s, d, id, mapper));
