import { NextRequest, NextResponse } from 'next/server';
import { getStats } from '@/lib/notion';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'today';

    const now = new Date();
    let startDate: string;
    const endDate = now.toISOString().split('T')[0];

    switch (period) {
      case 'week': {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 6);
        startDate = weekAgo.toISOString().split('T')[0];
        break;
      }
      case 'month': {
        const monthAgo = new Date(now);
        monthAgo.setDate(monthAgo.getDate() - 29);
        startDate = monthAgo.toISOString().split('T')[0];
        break;
      }
      default:
        startDate = endDate;
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getStats(startDate, endDate, session.user.email);
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Stats error full object:', JSON.stringify(error, null, 2));
    return NextResponse.json({ 
      error: '取得統計資料失敗',
      details: error?.message || '未知錯誤',
      code: error?.code
    }, { status: 500 });
  }
}
