import { createBatchHandler } from '@/lib/batch-handler';
import { ThemesMigrator } from '@/lib/migrators/themes';
export const POST = createBatchHandler((s, d, id, mapper) => new ThemesMigrator(s, d, id, mapper));
export const maxDuration = 60;
