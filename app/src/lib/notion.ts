import { Client } from '@notionhq/client';
import type { FoodRecord, MealType, Stats, UserProfile, BodyMetric, ExerciseRecord } from './types';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
console.log('Notion Client keys:', Object.keys(notion));
const databaseId = process.env.NOTION_DATABASE_ID!;
const userDatabaseId = process.env.NOTION_USER_DATABASE_ID!;
const metricsDatabaseId = process.env.NOTION_METRICS_DATABASE_ID!;
const exercisesDatabaseId = process.env.NOTION_EXERCISES_DATABASE_ID!;

const MEAL_MAP: Record<string, MealType> = {
  '早餐': 'breakfast',
  '午餐': 'lunch',
  '下午茶': 'afternoon_tea',
  '晚餐': 'dinner',
  '宵夜': 'late_night',
  '點心': 'snack',
};

const MEAL_REVERSE: Record<MealType, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  afternoon_tea: '下午茶',
  dinner: '晚餐',
  late_night: '宵夜',
  snack: '點心',
};

const ACTIVITY_MAP: Record<string, UserProfile['activityLevel']> = {
  '久坐 (幾乎不運動)': 'sedentary',
  '輕度 (每週運動 1-3 天)': 'light',
  '中度 (每週運動 3-5 天)': 'moderate',
  '重度 (每週運動 6-7 天)': 'active',
  '極重度 (勞力工作或運動員)': 'very_active',
};

const ACTIVITY_REVERSE: Record<UserProfile['activityLevel'], string> = {
  sedentary: '久坐 (幾乎不運動)',
  light: '輕度 (每週運動 1-3 天)',
  moderate: '中度 (每週運動 3-5 天)',
  active: '重度 (每週運動 6-7 天)',
  very_active: '極重度 (勞力工作或運動員)',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pageToFoodRecord(page: any): FoodRecord {
  const props = page.properties;
  return {
    id: page.id,
    name: props['品名']?.title?.[0]?.text?.content || '未知',
    calories: props['熱量']?.number || 0,
    protein: props['蛋白質']?.number || 0,
    carbs: props['碳水']?.number || 0,
    fat: props['脂肪 ']?.number || 0,
    price: props['價格']?.number || 0,
    mealType: MEAL_MAP[props['餐別']?.rich_text?.[0]?.text?.content || ''] || 'lunch',
    date: props['日期']?.date?.start || new Date().toISOString().split('T')[0],
    createdAt: page.created_time,
    userEmail: props['使用者 Email']?.rich_text?.[0]?.text?.content || '',
  };
}

export async function createFoodRecord(data: {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  price: number;
  mealType: MealType;
  date: string;
  userEmail: string;
}): Promise<string> {
  const response = await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      '品名': {
        title: [{ text: { content: data.name } }],
      },
      '熱量': { number: data.calories },
      '蛋白質': { number: data.protein },
      '碳水': { number: data.carbs },
      '脂肪 ': { number: data.fat },
      '價格': { number: data.price },
      '餐別': { rich_text: [{ text: { content: MEAL_REVERSE[data.mealType] } }] },
      '日期': { date: { start: data.date } },
      '使用者 Email': { rich_text: [{ text: { content: data.userEmail } }] },
    },
  });
  return response.id;
}

export async function queryRecords(
  startDate: string,
  endDate: string,
  userEmail?: string
): Promise<FoodRecord[]> {
  const records: FoodRecord[] = [];
  let hasMore = true;
  let startCursor: string | undefined;

  const filters: any[] = [
    {
      property: '日期',
      date: { on_or_after: startDate },
    },
    {
      property: '日期',
      date: { on_or_before: endDate },
    },
  ];

  if (userEmail) {
    filters.push({
      property: '使用者 Email',
      rich_text: { equals: userEmail },
    });
  }

  while (hasMore) {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: startCursor,
      filter: { and: filters },
      sorts: [{ property: '日期', direction: 'descending' }],
    });

    for (const page of response.results) {
      records.push(pageToFoodRecord(page));
    }

    hasMore = response.has_more;
    startCursor = response.next_cursor || undefined;
  }

  return records;
}

export async function getStats(
  startDate: string,
  endDate: string,
  userEmail?: string
): Promise<Stats & { userTarget?: number }> {
  try {
    const records = await queryRecords(startDate, endDate, userEmail);
    let userTarget = 2000;
    
    if (userEmail) {
      const profile = await getUserProfile(userEmail);
      if (profile) userTarget = profile.targetCalories;
    }

    // Calculate macro targets based on userTarget
    // Protein: 20%, Carbs: 55%, Fat: 25%
    const targetProtein = Math.round((userTarget * 0.20) / 4);
    const targetCarbs = Math.round((userTarget * 0.55) / 4);
    const targetFat = Math.round((userTarget * 0.25) / 9);

    if (records.length === 0) {
      return {
        totalCalories: 0,
        totalSpending: 0,
        avgDailyCalories: 0,
        avgDailySpending: 0,
        proteinTotal: 0,
        carbsTotal: 0,
        fatTotal: 0,
        mealBreakdown: { breakfast: 0, lunch: 0, afternoon_tea: 0, dinner: 0, late_night: 0, snack: 0 },
        records: [],
        daysCount: 0,
        userTarget,
      };
    }

    const totalCalories = records.reduce((s, r) => s + r.calories, 0);
    const totalSpending = records.reduce((s, r) => s + r.price, 0);
    const proteinTotal = records.reduce((s, r) => s + r.protein, 0);
    const carbsTotal = records.reduce((s, r) => s + r.carbs, 0);
    const fatTotal = records.reduce((s, r) => s + r.fat, 0);

    const uniqueDays = new Set(records.map((r) => r.date));
    const daysCount = uniqueDays.size || 1;

    const mealBreakdown: Record<MealType, number> = {
      breakfast: 0,
      lunch: 0,
      afternoon_tea: 0,
      dinner: 0,
      late_night: 0,
      snack: 0,
    };
    for (const r of records) {
      mealBreakdown[r.mealType] += r.calories;
    }

    return {
      totalCalories,
      totalSpending,
      avgDailyCalories: Math.round(totalCalories / daysCount),
      avgDailySpending: Math.round(totalSpending / daysCount),
      proteinTotal: Math.round(proteinTotal * 10) / 10,
      carbsTotal: Math.round(carbsTotal * 10) / 10,
      fatTotal: Math.round(fatTotal * 10) / 10,
      mealBreakdown,
      records,
      daysCount,
      userTarget,
      targetProtein,
      targetCarbs,
      targetFat,
    };
  } catch (error: any) {
    console.error('getStats internal error:', error);
    throw error;
  }
}

// User Profile Functions
export async function findUserByCredentials(email: string, name: string) {
  const response = await notion.databases.query({
    database_id: userDatabaseId,
    filter: {
      and: [
        {
          property: '使用者 Email',
          title: { equals: email },
        },
        {
          property: '名字',
          rich_text: { equals: name },
        },
      ],
    },
  });

  if (response.results.length === 0) return null;

  const page = response.results[0] as any;
  return {
    id: page.id,
    email: page.properties['使用者 Email']?.title?.[0]?.text?.content || '',
    name: page.properties['名字']?.rich_text?.[0]?.text?.content || '',
  };
}

export async function getUserProfile(email: string): Promise<UserProfile | null> {
  const response = await notion.databases.query({
    database_id: userDatabaseId,
    filter: {
      property: '使用者 Email',
      title: { equals: email },
    },
  });

  if (response.results.length === 0) return null;

  const page = response.results[0] as any;
  const props = page.properties;

  const genderStr = props['性別']?.rich_text?.[0]?.text?.content || '';
  const activityStr = props['活動等級']?.rich_text?.[0]?.text?.content || '';

  return {
    email: props['使用者 Email']?.title?.[0]?.text?.content || '',
    name: props['名字']?.rich_text?.[0]?.text?.content || '',
    gender: (genderStr === '男' ? 'male' : genderStr === '女' ? 'female' : 'other') as any,
    birthday: props['出生日期 (Date)']?.date?.start || '',
    height: props['身高']?.number || 0,
    weight: props['體重']?.number || 0,
    activityLevel: ACTIVITY_MAP[activityStr] || 'sedentary',
    targetCalories: props['目標熱量']?.number || 2000,
  };
}

export async function updateUserProfile(email: string, data: Partial<UserProfile>) {
  const user = await findUserByCredentials(email, data.name || '');
  let targetId = '';
  
  if (!user) {
    const response = await notion.databases.query({
      database_id: userDatabaseId,
      filter: { property: '使用者 Email', title: { equals: email } },
    });
    if (response.results.length === 0) throw new Error('User not found');
    targetId = response.results[0].id;
  } else {
    targetId = user.id;
  }

  const properties: any = {};
  if (data.name) properties['名字'] = { rich_text: [{ text: { content: data.name } }] };
  if (data.gender) properties['性別'] = { rich_text: [{ text: { content: data.gender === 'male' ? '男' : data.gender === 'female' ? '女' : '其他' } }] };
  if (data.birthday) properties['出生日期 (Date)'] = { date: { start: data.birthday } };
  if (data.height) properties['身高'] = { number: data.height };
  if (data.weight) properties['體重'] = { number: data.weight };
  if (data.activityLevel) properties['活動等級'] = { rich_text: [{ text: { content: ACTIVITY_REVERSE[data.activityLevel] } }] };
  if (data.targetCalories) properties['目標熱量'] = { number: data.targetCalories };

  await notion.pages.update({
    page_id: targetId,
    properties,
  });
}

export async function deleteFoodRecord(pageId: string) {
  await notion.pages.update({
    page_id: pageId,
    archived: true,
  });
}

// Body Metrics Functions
export async function createBodyMetric(data: {
  date: string;
  weight: number;
  bodyFat?: number;
  waist?: number;
  skeletalMuscle?: number;
  userEmail: string;
}): Promise<string> {
  const properties: any = {
    '日期': { title: [{ text: { content: data.date } }] },
    '體重': { number: data.weight },
    '使用者 email': { rich_text: [{ text: { content: data.userEmail } }] },
  };
  if (data.bodyFat !== undefined) properties['體脂'] = { number: data.bodyFat };
  if (data.waist !== undefined) properties['腰圍'] = { number: data.waist };
  if (data.skeletalMuscle !== undefined) properties['骨骼肌量'] = { number: data.skeletalMuscle };

  const response = await notion.pages.create({
    parent: { database_id: metricsDatabaseId },
    properties,
  });
  return response.id;
}

export async function queryMetrics(userEmail: string, startDate: string, endDate: string): Promise<BodyMetric[]> {
  const response = await notion.databases.query({
    database_id: metricsDatabaseId,
    filter: {
      property: '使用者 email',
      rich_text: { equals: userEmail },
    },
    sorts: [{ property: '日期', direction: 'ascending' }],
  });

  const allMetrics = response.results.map((page: any) => ({
    id: page.id,
    date: page.properties['日期']?.title?.[0]?.text?.content || '',
    weight: page.properties['體重']?.number || 0,
    bodyFat: page.properties['體脂']?.number || undefined,
    waist: page.properties['腰圍']?.number || undefined,
    skeletalMuscle: page.properties['骨骼肌量']?.number || undefined,
    userEmail: page.properties['使用者 email']?.rich_text?.[0]?.text?.content || '',
  }));

  // Filter by date in memory because Title property doesn't support date range filters
  return allMetrics.filter(m => m.date >= startDate && m.date <= endDate);
}

// Exercise Functions
export async function createExerciseRecord(data: {
  date: string;
  type: string;
  amount: string;
  caloriesBurned: number;
  userEmail: string;
}): Promise<string> {
  const response = await notion.pages.create({
    parent: { database_id: exercisesDatabaseId },
    properties: {
      '日期': { title: [{ text: { content: data.date } }] },
      '運動種類': { rich_text: [{ text: { content: data.type } }] },
      '運動量': { rich_text: [{ text: { content: data.amount } }] },
      '消耗熱量': { number: data.caloriesBurned },
      '使用者 Email': { rich_text: [{ text: { content: data.userEmail } }] },
    },
  });
  return response.id;
}

export async function queryExercises(userEmail: string, startDate: string, endDate: string): Promise<ExerciseRecord[]> {
  const response = await notion.databases.query({
    database_id: exercisesDatabaseId,
    filter: {
      property: '使用者 Email',
      rich_text: { equals: userEmail },
    },
    sorts: [{ property: '日期', direction: 'descending' }],
  });

  const allExercises = response.results.map((page: any) => ({
    id: page.id,
    date: page.properties['日期']?.title?.[0]?.text?.content || '',
    type: page.properties['運動種類']?.rich_text?.[0]?.text?.content || '',
    amount: page.properties['運動量']?.rich_text?.[0]?.text?.content || '',
    caloriesBurned: page.properties['消耗熱量']?.number || 0,
    userEmail: page.properties['使用者 Email']?.rich_text?.[0]?.text?.content || '',
  }));

  // Filter by date in memory
  return allExercises.filter(ex => ex.date >= startDate && ex.date <= endDate);
}

export async function deleteBodyMetric(pageId: string) {
  await notion.pages.update({
    page_id: pageId,
    archived: true,
  });
}

export async function deleteExerciseRecord(pageId: string) {
  await notion.pages.update({
    page_id: pageId,
    archived: true,
  });
}
