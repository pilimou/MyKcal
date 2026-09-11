export type MealType = 'breakfast' | 'lunch' | 'afternoon_tea' | 'dinner' | 'late_night' | 'snack';

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  afternoon_tea: '下午茶',
  dinner: '晚餐',
  late_night: '宵夜',
  snack: '點心',
};

export const MEAL_COLORS: Record<MealType, string> = {
  breakfast: '#f59e0b',
  lunch: '#10b981',
  afternoon_tea: '#facc15',
  dinner: '#6366f1',
  late_night: '#8b5cf6',
  snack: '#ec4899',
};

export const MEAL_ORDER: Record<MealType, number> = {
  breakfast: 1,
  lunch: 2,
  afternoon_tea: 3,
  dinner: 4,
  late_night: 5,
  snack: 6,
};

export function compareMealOrder(
  a: { mealType?: string; createdAt?: string },
  b: { mealType?: string; createdAt?: string }
): number {
  const orderA = MEAL_ORDER[a.mealType as MealType] ?? 99;
  const orderB = MEAL_ORDER[b.mealType as MealType] ?? 99;
  if (orderA !== orderB) return orderA - orderB;
  if (a.createdAt && b.createdAt) {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  }
  return 0;
}

export interface FoodAnalysis {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  estimatedPrice: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface FoodRecord {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  price: number;
  mealType: MealType;
  date: string; // ISO date string YYYY-MM-DD
  createdAt: string;
  userEmail: string;
}

export interface UserProfile {
  email: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  birthday: string;
  height: number;
  weight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  targetCalories: number;
  shareToken?: string;
}

export interface CalendarDaySummary {
  food: number;
  exercise: number;
  exerciseCount?: number;
  target: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface DayGroup {
  date: string;
  records: FoodRecord[];
  metrics: BodyMetric[];
  exercises: ExerciseRecord[];
  totalCalories: number;
  totalPrice: number;
}

export interface BodyMetric {
  id: string;
  date: string;
  weight: number;
  bodyFat?: number;
  waist?: number;
  skeletalMuscle?: number;
  userEmail: string;
}

export interface ExerciseRecord {
  id: string;
  date: string;
  type: string;
  amount: string;
  caloriesBurned: number;
  userEmail: string;
}

export interface Stats {
  totalCalories: number;
  totalSpending: number;
  avgDailyCalories: number;
  avgDailySpending: number;
  proteinTotal: number;
  carbsTotal: number;
  fatTotal: number;
  mealBreakdown: Record<MealType, number>;
  records: FoodRecord[];
  daysCount: number;
  userTarget?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
}
