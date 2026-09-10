'use client';

import { useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  addMonths, 
  subMonths,
  getDay
} from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CalendarDaySummary } from '@/lib/types';

interface CalendarGridProps {
  dailyData: Record<string, CalendarDaySummary>;
  onDateClick: (date: string) => void;
  currentDate: Date;
  onMonthChange: (date: Date) => void;
  selectedDate?: string | null;
}

export function getCalorieStatusColor(data?: CalendarDaySummary) {
  if (!data || (data.food === 0 && data.exercise === 0)) {
    return 'bg-slate-900/30 hover:bg-slate-850 border-white/5 text-slate-400';
  }
  
  const totalTarget = (data.target || 2000) + (data.exercise || 0);
  const deficit = totalTarget - data.food; // 正數為赤字/預算內，負數為超標
  
  if (deficit < -150) {
    // 超出較多 (Red / Rose)
    return 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.12)]';
  }
  if (deficit < 0) {
    // 輕微超標 (Amber / Orange)
    return 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.1)]';
  }
  if (deficit > 200) {
    // 大赤字 (Deep Emerald)
    return 'bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-100 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]';
  }
  // 達成目標 (Normal Emerald)
  return 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 border-emerald-500/30';
}

export default function CalendarGrid({
  dailyData,
  onDateClick,
  currentDate,
  onMonthChange,
  selectedDate,
}: CalendarGridProps) {
  const days = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const interval = eachDayOfInterval({ start, end });
    
    const startPadding = getDay(start);
    const paddingDays = [];
    for (let i = 0; i < startPadding; i++) {
      paddingDays.push(null);
    }
    
    return [...paddingDays, ...interval];
  }, [currentDate]);

  return (
    <div className="calendar-container glass-card w-full !p-3 sm:!p-5 rounded-2xl border border-white/10 bg-slate-900/40 flex flex-col">
      {/* Month Switcher Header */}
      <div className="flex justify-between items-center mb-4 sm:mb-6 px-1 w-full">
        <button 
          onClick={() => onMonthChange(subMonths(currentDate, 1))} 
          className="p-2 hover:bg-white/10 active:scale-95 rounded-xl transition text-slate-300"
          aria-label="上個月"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-extrabold text-white">
            {format(currentDate, 'yyyy年 MMMM', { locale: zhTW })}
          </h3>
          <button
            onClick={() => onMonthChange(new Date())}
            className="text-[11px] px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition"
          >
            本月
          </button>
        </div>
        <button 
          onClick={() => onMonthChange(addMonths(currentDate, 1))} 
          className="p-2 hover:bg-white/10 active:scale-95 rounded-xl transition text-slate-300"
          aria-label="下個月"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-[11px] sm:text-xs font-bold text-slate-400 uppercase">
        {['週日', '週一', '週二', '週三', '週四', '週五', '週六'].map(day => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((day, i) => {
          if (!day) {
            return (
              <div 
                key={`empty-${i}`} 
                className="aspect-square md:aspect-auto md:min-h-[75px] md:h-[85px] rounded-xl bg-slate-950/20 border border-transparent" 
              />
            );
          }
          
          const dateStr = format(day, 'yyyy-MM-dd');
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate === dateStr;
          const data = dailyData[dateStr];
          const hasFood = data && data.food > 0;
          const hasExercise = data && data.exercise > 0;
          const colorClass = getCalorieStatusColor(data);
          
          return (
            <button
              key={dateStr}
              onClick={() => onDateClick(dateStr)}
              className={`
                rounded-xl p-1.5 sm:p-2 border transition-all flex flex-col justify-between text-left cursor-pointer
                aspect-square md:aspect-auto md:min-h-[75px] md:h-[85px] overflow-hidden
                ${colorClass}
                ${isToday ? 'ring-2 ring-emerald-400/80 ring-offset-1 ring-offset-[#0b0f1a]' : ''}
                ${isSelected ? '!border-emerald-400 ring-2 ring-emerald-500/50 scale-[1.02]' : ''}
                hover:scale-[1.02] active:scale-[0.98]
              `}
            >
              {/* Top Row: Date Number & Today/Exercise indicators */}
              <div className="flex items-center justify-between w-full shrink-0">
                <span className={`text-[11px] sm:text-xs md:text-sm font-bold ${isToday ? 'text-emerald-400 bg-emerald-500/20 px-1 rounded' : 'text-slate-300'}`}>
                  {format(day, 'd')}
                </span>
                {hasExercise && (
                  <span className="text-[9px] sm:text-[10px] font-medium text-indigo-300 bg-indigo-500/20 px-1 rounded border border-indigo-500/30">
                    🏃 -{data.exercise}
                  </span>
                )}
                {isToday && !hasExercise && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                )}
              </div>

              {/* Center Calorie Display */}
              <div className="flex flex-col items-center justify-center flex-1 w-full text-center my-auto">
                {hasFood ? (
                  <div className="flex flex-col items-center justify-center">
                    <span className="font-black text-xs sm:text-sm md:text-base leading-tight tracking-tight text-white">
                      {data.food.toLocaleString()}
                    </span>
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] font-medium text-slate-400 leading-none mt-0.5">
                      kcal
                    </span>
                  </div>
                ) : hasExercise ? (
                  <div className="flex flex-col items-center justify-center text-[10px] sm:text-xs text-indigo-300 font-semibold leading-tight">
                    <span>-{data.exercise}</span>
                    <span className="text-[8px] sm:text-[9px] font-medium opacity-80">kcal</span>
                  </div>
                ) : (
                  <span className="text-[10px] sm:text-xs text-slate-600">-</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Color Legend */}
      <div className="mt-5 pt-3 border-t border-white/5 flex flex-wrap gap-4 sm:gap-6 justify-center text-[11px] font-medium text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/40 border border-emerald-500/50" />
          <span>大赤字 ({'>'}200)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/20 border border-emerald-500/30" />
          <span>達成目標</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-amber-500/25 border border-amber-500/40" />
          <span>輕微超標</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-rose-500/30 border border-rose-500/40" />
          <span>超標較多</span>
        </div>
      </div>
    </div>
  );
}
