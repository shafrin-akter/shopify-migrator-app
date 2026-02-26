import { createBatchHandler } from '@/lib/batch-handler';
import { MenusMigrator } from '@/lib/migrators/menus';
export const POST = createBatchHandler((s, d, id, mapper) => new MenusMigrator(s, d, id, mapper));
