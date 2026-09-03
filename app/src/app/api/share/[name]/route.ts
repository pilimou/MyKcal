import { NextRequest, NextResponse } from 'next/server';
import { findUserByShareToken, queryRecords, queryExercises } from '@/lib/notion';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  try {
    const { name: token } = await context.params;
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month'); // YYYY-MM

    if (!token) {
      return NextResponse.json({ error: '請提供分享代碼' }, { status: 400 });
    }

    const decodedToken = decodeURIComponent(token).trim();
    const user = await findUserByShareToken(decodedToken);

    if (!user) {
      return NextResponse.json({ error: '此分享連結已失效或不存在' }, { status: 404 });
    }

    const now = new Date();
    const currentMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [year, mon] = currentMonth.split('-').map(Number);
    const startDate = `${currentMonth}-01`;
    const lastDay = new Date(year, mon, 0).getDate();
    const endDate = `${currentMonth}-${String(lastDay).padStart(2, '0')}`;

    const [foodRecords, exerciseRecords] = await Promise.all([
      queryRecords(startDate, endDate, user.email),
      queryExercises(user.email, startDate, endDate),
    ]);

    // Build day map
    const dailyData: Record<
      string,
      {
        date: string;
        foods: Array<{
          id: string;
          name: string;
          mealType: string;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
        }>;
        exercises: Array<{
          id: string;
          type: string;
          amount: string;
          caloriesBurned: number;
        }>;
      }
    > = {};

    for (let i = 1; i <= lastDay; i++) {
      const date = `${currentMonth}-${String(i).padStart(2, '0')}`;
      dailyData[date] = {
        date,
        foods: [],
        exercises: [],
      };
    }

    foodRecords.forEach((r) => {
      if (dailyData[r.date]) {
        dailyData[r.date].foods.push({
          id: r.id,
          name: r.name,
          mealType: r.mealType,
          calories: Number(r.calories) || 0,
          protein: Number(r.protein) || 0,
          carbs: Number(r.carbs) || 0,
          fat: Number(r.fat) || 0,
        });
      }
    });

    exerciseRecords.forEach((ex) => {
      if (dailyData[ex.date]) {
        dailyData[ex.date].exercises.push({
          id: ex.id,
          type: ex.type,
          amount: ex.amount,
          caloriesBurned: Number(ex.caloriesBurned) || 0,
        });
      }
    });

    return NextResponse.json({
      success: true,
      userName: user.name,
      month: currentMonth,
      days: dailyData,
    });
  } catch (error) {
    console.error('Share Calendar API error:', error);
    return NextResponse.json({ error: '獲取公開月曆失敗' }, { status: 500 });
  }
}
