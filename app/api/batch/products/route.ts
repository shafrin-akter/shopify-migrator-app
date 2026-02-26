import { createBatchHandler } from '@/lib/batch-handler';
import { ProductsMigrator } from '@/lib/migrators/products';
export const POST = createBatchHandler((s, d, id, mapper) => new ProductsMigrator(s, d, id, mapper));
