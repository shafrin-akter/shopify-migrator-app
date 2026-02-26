import { BaseMigrator } from './base';
import { listRedirects } from '../shopify/rest/redirects';

export class RedirectsMigrator extends BaseMigrator {
  resourceType() { return 'redirects'; }

  async fetchBatch(cursor: string | null) {
    const sinceId = cursor ? parseInt(cursor) : undefined;
    const redirects = await listRedirects(this.sourceClient, 250, sinceId);
    const nextCursor =
      redirects.length === 250 ? String(redirects[redirects.length - 1].id) : null;
    return { items: redirects, nextCursor };
  }

  async migrateItem(redirect: any): Promise<string> {
    try {
      const result = await this.destClient.rest.post('/redirects.json', {
        redirect: { path: redirect.path, target: redirect.target },
      });
      return `redirect-${result.redirect.id}`;
    } catch (err: any) {
      if (err?.status === 422) {
        return `skipped-redirect-${redirect.id}`;
      }
      throw err;
    }
  }
}
