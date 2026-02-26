import { BaseMigrator } from './base';
import {
  METAOBJECT_DEFINITIONS_QUERY,
  METAOBJECT_DEFINITION_CREATE,
  METAOBJECTS_QUERY,
  METAOBJECT_CREATE,
} from '../shopify/graphql/metaobjects';

export class MetaobjectDefinitionsMigrator extends BaseMigrator {
  resourceType() { return 'metaobject-definitions'; }

  async fetchBatch(cursor: string | null) {
    const data = await this.sourceClient.graphql<any>(METAOBJECT_DEFINITIONS_QUERY, {
      first: 50,
      after: cursor,
    });
    const { edges, pageInfo } = data.metaobjectDefinitions;
    return {
      items: edges.map((e: any) => e.node),
      nextCursor: pageInfo.hasNextPage ? pageInfo.endCursor : null,
    };
  }

  async migrateItem(def: any): Promise<string> {
    const result = await this.destClient.graphql<any>(METAOBJECT_DEFINITION_CREATE, {
      definition: {
        type: def.type,
        name: def.name,
        description: def.description || undefined,
        displayNameKey: def.displayNameKey || undefined,
        fieldDefinitions: def.fieldDefinitions.map((f: any) => ({
          key: f.key,
          name: f.name,
          description: f.description || undefined,
          required: f.required,
          type: f.type.name,
        })),
      },
    });

    const errors = result.metaobjectDefinitionCreate.userErrors;
    if (errors.length) {
      if (errors[0].message.includes('already exists')) return `skipped-${def.id}`;
      throw new Error(errors[0].message);
    }

    return result.metaobjectDefinitionCreate.metaobjectDefinition.id;
  }
}

export class MetaobjectsMigrator extends BaseMigrator {
  resourceType() { return 'metaobjects'; }

  async fetchBatch(cursor: string | null) {
    // cursor: "typeIndex:graphqlCursor"
    // First get all types from definitions
    const defData = await this.sourceClient.graphql<any>(METAOBJECT_DEFINITIONS_QUERY, {
      first: 50,
      after: null,
    });
    const types = defData.metaobjectDefinitions.edges.map((e: any) => e.node.type);

    if (!types.length) return { items: [], nextCursor: null };

    const [typeIdx, gqlCursor] = cursor ? cursor.split('|') : ['0', null];
    const idx = parseInt(typeIdx);
    const type = types[idx];

    if (!type) return { items: [], nextCursor: null };

    const data = await this.sourceClient.graphql<any>(METAOBJECTS_QUERY, {
      type,
      first: 50,
      after: gqlCursor || null,
    });

    const { edges, pageInfo } = data.metaobjects;
    const items = edges.map((e: any) => e.node);

    let nextCursor: string | null = null;
    if (pageInfo.hasNextPage) {
      nextCursor = `${idx}|${pageInfo.endCursor}`;
    } else if (idx < types.length - 1) {
      nextCursor = `${idx + 1}|`;
    }

    return { items, nextCursor };
  }

  async migrateItem(obj: any): Promise<string> {
    const result = await this.destClient.graphql<any>(METAOBJECT_CREATE, {
      metaobject: {
        type: obj.type,
        handle: obj.handle,
        fields: obj.fields.map((f: any) => ({
          key: f.key,
          value: f.value,
        })),
      },
    });

    const errors = result.metaobjectCreate.userErrors;
    if (errors.length) {
      if (errors[0].message.includes('taken') || errors[0].message.includes('already exists')) {
        return `skipped-${obj.id}`;
      }
      throw new Error(errors[0].message);
    }

    return result.metaobjectCreate.metaobject.id;
  }
}
