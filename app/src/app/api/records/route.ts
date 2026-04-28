import { NextRequest, NextResponse } from 'next/server';
import { createFoodRecord, queryRecords } from '@/lib/notion';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, calories, protein, carbs, fat, price, mealType, date } = body;

    if (!name || calories === undefined) {
      return NextResponse.json({ error: '缺少必要欄位' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = await createFoodRecord({
      name,
      calories: Number(calories),
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      price: Number(price) || 0,
      mealType: mealType || 'lunch',
      date: date || new Date().toISOString().split('T')[0],
      userEmail: session.user.email,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Create record error:', error);
    return NextResponse.json({ error: '儲存失敗，請重試' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'today';

    const now = new Date();
    let startDate: string;
    let endDate = now.toISOString().split('T')[0];

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
      case 'custom': {
        const date = searchParams.get('date');
        startDate = date || endDate;
        endDate = date || endDate;
        break;
      }
      default:
        startDate = endDate;
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const records = await queryRecords(startDate, endDate, session.user.email);
    return NextResponse.json({ records });
  } catch (error) {
    console.error('Query records error:', error);
    return NextResponse.json({ error: '查詢失敗' }, { status: 500 });
  }
}
