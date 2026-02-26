import { createBatchHandler } from '@/lib/batch-handler';
import { OrdersMigrator } from '@/lib/migrators/orders';
export const POST = createBatchHandler((s, d, id, mapper) => new OrdersMigrator(s, d, id, mapper));
