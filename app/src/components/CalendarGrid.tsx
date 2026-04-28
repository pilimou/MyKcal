'use client';

import { useState, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  getDay
} from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface CalendarGridProps {
  dailyData: Record<string, { food: number; exercise: number; target: number }>;
  onDateClick: (date: string) => void;
  currentDate: Date;
  onMonthChange: (date: Date) => void;
}

export default function CalendarGrid({ dailyData, onDateClick, currentDate, onMonthChange }: CalendarGridProps) {
  const days = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const interval = eachDayOfInterval({ start, end });
    
    // Add padding days for the start of the week
    const startPadding = getDay(start);
    const paddingDays = [];
    for (let i = 0; i < startPadding; i++) {
      paddingDays.push(null);
    }
    
    return [...paddingDays, ...interval];
  }, [currentDate]);

  const getDeficitColor = (dateStr: string) => {
    const data = dailyData[dateStr];
    if (!data || (data.food === 0 && data.exercise === 0)) return 'bg-slate-800/20 border-transparent';
    
    const totalTarget = data.target + data.exercise;
    const deficit = totalTarget - data.food;
    
    if (deficit > 200) return 'bg-emerald-500/40 text-emerald-100 border-emerald-500/30';
    if (deficit >= 0) return 'bg-emerald-500/20 text-emerald-200 border-emerald-500/20';
    if (deficit > -200) return 'bg-amber-500/20 text-amber-200 border-amber-500/20';
    return 'bg-rose-500/30 text-rose-100 border-rose-500/30';
  };

  return (
    <div className="calendar-container glass-card w-full !p-4 min-h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-6 px-2 w-full">
        <button onClick={() => onMonthChange(subMonths(currentDate, 1))} className="p-2 hover:bg-white/5 rounded-full">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h3 className="text-lg font-bold">
          {format(currentDate, 'yyyy年 MMMM', { locale: zhTW })}
        </h3>
        <button onClick={() => onMonthChange(addMonths(currentDate, 1))} className="p-2 hover:bg-white/5 rounded-full">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
          <div key={day} className="text-center text-[10px] font-bold text-slate-500 py-1 uppercase">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} className="aspect-square" />;
          
          const dateStr = format(day, 'yyyy-MM-dd');
          const isToday = isSameDay(day, new Date());
          const hasData = dailyData[dateStr] && (dailyData[dateStr].food > 0 || dailyData[dateStr].exercise > 0);
          
          return (
            <button
              key={dateStr}
              onClick={() => onDateClick(dateStr)}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center text-xs border transition-all
                ${getDeficitColor(dateStr)}
                ${isToday ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-[#0b0f1a]' : ''}
                hover:scale-105 active:scale-95
              `}
            >
              <span className={isToday ? 'font-bold' : ''}>{format(day, 'd')}</span>
              {hasData && (
                <div className="w-1 h-1 rounded-full bg-current mt-0.5 opacity-60" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 justify-center text-[10px] font-medium text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/40" />
          <span>大赤字 ({'>'}200)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/20" />
          <span>達成目標</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-amber-500/20" />
          <span>輕微超標</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-rose-500/30" />
          <span>超出較多</span>
        </div>
      </div>
    </div>
  );
}
