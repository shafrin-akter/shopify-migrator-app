import { ShopifyClient } from '../client';

export interface ShopifyBlog {
  id: number;
  title: string;
  handle: string;
  commentable: string;
  template_suffix: string | null;
}

export interface ShopifyArticle {
  id: number;
  blog_id: number;
  title: string;
  author: string;
  handle: string;
  body_html: string;
  summary_html: string | null;
  tags: string;
  image?: { src: string; alt: string } | null;
  published: boolean;
  published_at: string | null;
  template_suffix: string | null;
  metafields?: Array<{ namespace: string; key: string; value: string; type: string }>;
}

export async function listBlogs(client: ShopifyClient): Promise<ShopifyBlog[]> {
  const data = await client.rest.get('/blogs.json');
  return data.blogs;
}

export async function createBlog(
  client: ShopifyClient,
  blog: Partial<ShopifyBlog>
): Promise<ShopifyBlog> {
  const data = await client.rest.post('/blogs.json', { blog });
  return data.blog;
}

export async function listArticles(
  client: ShopifyClient,
  blogId: number,
  limit = 50,
  sinceId?: number
): Promise<ShopifyArticle[]> {
  const params: Record<string, string> = { limit: String(limit) };
  if (sinceId) params.since_id = String(sinceId);
  const data = await client.rest.get(`/blogs/${blogId}/articles.json`, params);
  return data.articles;
}

export async function createArticle(
  client: ShopifyClient,
  blogId: number,
  article: Partial<ShopifyArticle>
): Promise<ShopifyArticle> {
  const data = await client.rest.post(`/blogs/${blogId}/articles.json`, { article });
  return data.article;
}
