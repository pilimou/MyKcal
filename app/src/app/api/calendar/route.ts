import { NextRequest, NextResponse } from 'next/server';
import { queryRecords, queryExercises, getUserProfile } from '@/lib/notion';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month'); // YYYY-MM
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user.email;
    const now = new Date();
    const currentMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Calculate start and end date of the month
    const [year, mon] = currentMonth.split('-').map(Number);
    const startDate = `${currentMonth}-01`;
    const lastDay = new Date(year, mon, 0).getDate();
    const endDate = `${currentMonth}-${String(lastDay).padStart(2, '0')}`;

    const [foodRecords, exerciseRecords, profile] = await Promise.all([
      queryRecords(startDate, endDate, email),
      queryExercises(email, startDate, endDate),
      getUserProfile(email),
    ]);

    const targetCalories = profile?.targetCalories || 2000;

    // Group by date
    const dailyData: Record<string, { food: number; exercise: number; target: number }> = {};

    // Initialize all days of the month
    for (let i = 1; i <= lastDay; i++) {
      const date = `${currentMonth}-${String(i).padStart(2, '0')}`;
      dailyData[date] = { food: 0, exercise: 0, target: targetCalories };
    }

    foodRecords.forEach(r => {
      if (dailyData[r.date]) dailyData[r.date].food += r.calories;
    });

    exerciseRecords.forEach(r => {
      if (dailyData[r.date]) dailyData[r.date].exercise += r.caloriesBurned;
    });

    return NextResponse.json({ dailyData, targetCalories });
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json({ error: '獲取月曆資料失敗' }, { status: 500 });
  }
}
