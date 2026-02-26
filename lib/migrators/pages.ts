import { BaseMigrator } from './base';
import { listPages, createPage } from '../shopify/rest/pages';

export class PagesMigrator extends BaseMigrator {
  resourceType() { return 'pages'; }

  async fetchBatch(cursor: string | null) {
    const sinceId = cursor ? parseInt(cursor) : undefined;
    const pages = await listPages(this.sourceClient, 50, sinceId);
    const nextCursor =
      pages.length === 50 ? String(pages[pages.length - 1].id) : null;
    return { items: pages, nextCursor };
  }

  async migrateItem(page: any): Promise<string> {
    const result = await createPage(this.destClient, {
      title: page.title,
      handle: page.handle,
      body_html: page.body_html,
      template_suffix: page.template_suffix || null,
      published: page.published,
    });
    return `gid://shopify/OnlineStorePage/${result.id}`;
  }
}
