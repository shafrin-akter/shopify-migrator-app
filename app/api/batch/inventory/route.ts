import { createBatchHandler } from '@/lib/batch-handler';
import { InventoryMigrator } from '@/lib/migrators/inventory';
export const POST = createBatchHandler((s, d, id, mapper) => new InventoryMigrator(s, d, id, mapper));
