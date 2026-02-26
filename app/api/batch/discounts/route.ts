import { createBatchHandler } from '@/lib/batch-handler';
import { DiscountsMigrator } from '@/lib/migrators/discounts';
export const POST = createBatchHandler((s, d, id, mapper) => new DiscountsMigrator(s, d, id, mapper));
