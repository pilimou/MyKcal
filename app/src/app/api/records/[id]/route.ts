import { NextRequest, NextResponse } from 'next/server';
import { deleteFoodRecord } from '@/lib/notion';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

  const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing record ID' }, { status: 400 });
    }

    await deleteFoodRecord(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete record error:', error);
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
  }
}
