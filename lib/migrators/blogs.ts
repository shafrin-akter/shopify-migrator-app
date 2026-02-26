import { BaseMigrator, BatchResult } from './base';
import {
  listBlogs,
  createBlog,
  listArticles,
  createArticle,
} from '../shopify/rest/blogs';
import { prisma } from '../db';

export class BlogsMigrator extends BaseMigrator {
  resourceType() { return 'blogs'; }

  async fetchBatch(cursor: string | null) {
    if (cursor) return { items: [], nextCursor: null };
    const blogs = await listBlogs(this.sourceClient);
    return { items: blogs, nextCursor: null };
  }

  async migrateItem(blog: any): Promise<string> {
    const result = await createBlog(this.destClient, {
      title: blog.title,
      handle: blog.handle,
      commentable: blog.commentable,
      template_suffix: blog.template_suffix,
    });
    return `gid://shopify/Blog/${result.id}`;
  }
}

export class ArticlesMigrator extends BaseMigrator {
  resourceType() { return 'articles'; }

  async fetchBatch(cursor: string | null) {
    // cursor format: "blogSourceId:sinceId"
    const [blogSourceId, sinceId] = cursor ? cursor.split(':') : [null, null];

    const allBlogMappings = await this.idMapper.getAll('blogs');
    const blogIds = Array.from(allBlogMappings.keys()).map((id) =>
      id.split('/').pop()!
    );

    if (!blogIds.length) return { items: [], nextCursor: null };

    const currentBlogId = blogSourceId
      ? parseInt(blogSourceId)
      : parseInt(blogIds[0]);

    const articles = await listArticles(
      this.sourceClient,
      currentBlogId,
      50,
      sinceId ? parseInt(sinceId) : undefined
    );

    let nextCursor: string | null = null;
    if (articles.length === 50) {
      nextCursor = `${currentBlogId}:${articles[articles.length - 1].id}`;
    } else {
      const idx = blogIds.indexOf(String(currentBlogId));
      if (idx < blogIds.length - 1) {
        nextCursor = `${blogIds[idx + 1]}:`;
      }
    }

    const items = articles.map((a) => ({ ...a, _sourceBlogId: currentBlogId }));
    return { items, nextCursor };
  }

  async migrateItem(article: any): Promise<string> {
    const sourceBlogGid = `gid://shopify/Blog/${article._sourceBlogId}`;
    const destBlogGid = await this.idMapper.get('blogs', sourceBlogGid);
    if (!destBlogGid) throw new Error(`No dest blog for ${sourceBlogGid}`);

    const destBlogId = parseInt(destBlogGid.split('/').pop()!);
    const result = await createArticle(this.destClient, destBlogId, {
      title: article.title,
      author: article.author,
      handle: article.handle,
      body_html: article.body_html,
      summary_html: article.summary_html,
      tags: article.tags,
      image: article.image || undefined,
      published: article.published,
      published_at: article.published_at,
      template_suffix: article.template_suffix,
    });

    return `gid://shopify/Article/${result.id}`;
  }
}
