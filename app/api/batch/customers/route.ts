import { createBatchHandler } from '@/lib/batch-handler';
import { CustomersMigrator } from '@/lib/migrators/customers';
export const POST = createBatchHandler((s, d, id, mapper) => new CustomersMigrator(s, d, id, mapper));
