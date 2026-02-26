import { prisma } from './db';

export class IdMapper {
  constructor(private migrationId: string) {}

  async save(resourceType: string, sourceId: string, destId: string): Promise<void> {
    await prisma.idMapping.upsert({
      where: {
        migrationId_resourceType_sourceId: {
          migrationId: this.migrationId,
          resourceType,
          sourceId,
        },
      },
      update: { destId },
      create: {
        migrationId: this.migrationId,
        resourceType,
        sourceId,
        destId,
      },
    });
  }

  async get(resourceType: string, sourceId: string): Promise<string | null> {
    const mapping = await prisma.idMapping.findUnique({
      where: {
        migrationId_resourceType_sourceId: {
          migrationId: this.migrationId,
          resourceType,
          sourceId,
        },
      },
    });
    return mapping?.destId ?? null;
  }

  async getAll(resourceType: string): Promise<Map<string, string>> {
    const mappings = await prisma.idMapping.findMany({
      where: { migrationId: this.migrationId, resourceType },
    });
    return new Map(mappings.map((m) => [m.sourceId, m.destId]));
  }
}
