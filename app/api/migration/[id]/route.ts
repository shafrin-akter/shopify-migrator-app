import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const migration = await prisma.migration.findUniqueOrThrow({
      where: { id },
      include: {
        progress: true,
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
      },
    });

    return NextResponse.json({
      id: migration.id,
      sourceStore: migration.sourceStore,
      destStore: migration.destStore,
      status: migration.status,
      config: migration.config,
      progress: migration.progress,
      logs: migration.logs,
      createdAt: migration.createdAt,
      updatedAt: migration.updatedAt,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 404 });
  }
}
