import { createBatchHandler } from '@/lib/batch-handler';
import { RedirectsMigrator } from '@/lib/migrators/redirects';
export const POST = createBatchHandler((s, d, id, mapper) => new RedirectsMigrator(s, d, id, mapper));
