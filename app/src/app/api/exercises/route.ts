import { NextRequest, NextResponse } from 'next/server';
import { createExerciseRecord, queryExercises } from '@/lib/notion';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, type, amount, caloriesBurned } = body;

    if (!type || !amount) {
      return NextResponse.json({ error: '缺少必要欄位' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = await createExerciseRecord({
      date: date || new Date().toISOString().split('T')[0],
      type,
      amount,
      caloriesBurned: Number(caloriesBurned) || 0,
      userEmail: session.user.email,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Create exercise error:', error);
    return NextResponse.json({ error: '儲存失敗' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let startDate: string;
    let endDate: string;

    if (date) {
      startDate = date;
      endDate = date;
    } else {
      const now = new Date();
      endDate = now.toISOString().split('T')[0];
      const monthAgo = new Date(now);
      monthAgo.setDate(monthAgo.getDate() - 30);
      startDate = monthAgo.toISOString().split('T')[0];
    }

    const exercises = await queryExercises(session.user.email, startDate, endDate);
    return NextResponse.json({ exercises });
  } catch (error) {
    console.error('Query exercises error:', error);
    return NextResponse.json({ error: '查詢失敗' }, { status: 500 });
  }
}
