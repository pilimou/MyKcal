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
}

export interface DayGroup {
  date: string;
  records: FoodRecord[];
  totalCalories: number;
  totalPrice: number;
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
