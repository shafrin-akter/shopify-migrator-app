import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { resourceType } = await req.json();

    if (resourceType) {
      await prisma.migrationProgress.updateMany({
        where: { migrationId: id, resourceType },
        data: { status: 'PENDING', cursor: null, completed: 0, failed: 0 },
      });
    } else {
      await prisma.migration.update({
        where: { id },
        data: { status: 'PENDING' },
      });
      await prisma.migrationProgress.updateMany({
        where: { migrationId: id },
        data: { status: 'PENDING', cursor: null, completed: 0, failed: 0 },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
