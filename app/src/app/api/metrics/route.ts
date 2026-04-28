import { NextRequest, NextResponse } from 'next/server';
import { createBodyMetric, queryMetrics } from '@/lib/notion';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, weight, bodyFat, waist, skeletalMuscle } = body;

    if (weight === undefined) {
      return NextResponse.json({ error: '缺少體重欄位' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = await createBodyMetric({
      date: date || new Date().toISOString().split('T')[0],
      weight: Number(weight),
      bodyFat: bodyFat !== undefined ? Number(bodyFat) : undefined,
      waist: waist !== undefined ? Number(waist) : undefined,
      skeletalMuscle: skeletalMuscle !== undefined ? Number(skeletalMuscle) : undefined,
      userEmail: session.user.email,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Create metric error:', error);
    return NextResponse.json({ error: '儲存失敗' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '7d';

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    let startDate: string;
    const endDate = now.toISOString().split('T')[0];

    switch (range) {
      case '1m': {
        const d = new Date(now);
        d.setMonth(d.getMonth() - 1);
        startDate = d.toISOString().split('T')[0];
        break;
      }
      case '6m': {
        const d = new Date(now);
        d.setMonth(d.getMonth() - 6);
        startDate = d.toISOString().split('T')[0];
        break;
      }
      default: {
        const d = new Date(now);
        d.setDate(d.getDate() - 6);
        startDate = d.toISOString().split('T')[0];
        break;
      }
    }

    const metrics = await queryMetrics(session.user.email, startDate, endDate);
    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('Query metrics error:', error);
    return NextResponse.json({ error: '查詢失敗' }, { status: 500 });
  }
}
