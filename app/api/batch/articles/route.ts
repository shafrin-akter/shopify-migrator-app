import { createBatchHandler } from '@/lib/batch-handler';
import { ArticlesMigrator } from '@/lib/migrators/blogs';
export const POST = createBatchHandler((s, d, id, mapper) => new ArticlesMigrator(s, d, id, mapper));
