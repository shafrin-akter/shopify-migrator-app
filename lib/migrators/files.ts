import { BaseMigrator } from './base';
import { FILES_QUERY, FILE_CREATE_MUTATION } from '../shopify/graphql/files';

export class FilesMigrator extends BaseMigrator {
  resourceType() { return 'files'; }

  async fetchBatch(cursor: string | null) {
    const data = await this.sourceClient.graphql<any>(FILES_QUERY, {
      first: 20,
      after: cursor,
    });
    const { edges, pageInfo } = data.files;
    return {
      items: edges.map((e: any) => e.node),
      nextCursor: pageInfo.hasNextPage ? pageInfo.endCursor : null,
    };
  }

  async migrateItem(file: any): Promise<string> {
    let originalSource: string | null = null;
    let contentType: string | undefined;

    if (file.image?.originalSrc) {
      originalSource = file.image.originalSrc;
    } else if (file.url) {
      originalSource = file.url;
    } else if (file.sources?.[0]?.url) {
      originalSource = file.sources[0].url;
      contentType = file.sources[0].mimeType;
    }

    if (!originalSource) {
      throw new Error('No source URL for file');
    }

    const fileInput: any = {
      originalSource,
      alt: file.alt || undefined,
    };
    if (contentType) fileInput.contentType = contentType;

    const result = await this.destClient.graphql<any>(FILE_CREATE_MUTATION, {
      files: [fileInput],
    });

    const errors = result.fileCreate.userErrors;
    if (errors.length) throw new Error(errors[0].message);

    const created = result.fileCreate.files[0];
    return created?.id ?? 'file-created';
  }
}
