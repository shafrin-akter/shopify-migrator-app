import { createBatchHandler } from '@/lib/batch-handler';
import { BlogsMigrator } from '@/lib/migrators/blogs';
export const POST = createBatchHandler((s, d, id, mapper) => new BlogsMigrator(s, d, id, mapper));
