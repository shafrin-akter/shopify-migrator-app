import { createBatchHandler } from '@/lib/batch-handler';
import { SettingsMigrator } from '@/lib/migrators/settings';
export const POST = createBatchHandler((s, d, id, mapper) => new SettingsMigrator(s, d, id, mapper));
