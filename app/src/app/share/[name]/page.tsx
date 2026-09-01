'use client';

import { useState, useEffect, useCallback, useMemo, use } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { MEAL_LABELS, type MealType } from '@/lib/types';
import { 
  Calendar as CalendarIcon, 
  List as ListIcon, 
  ChevronLeft, 
  ChevronRight, 
  X
} from 'lucide-react';

interface DayFood {
  id: string;
  name: string;
  mealType: MealType;
}

interface DayExercise {
  id: string;
  type: string;
  amount: string;
  caloriesBurned?: number;
}

interface DayData {
  date: string;
  foods: DayFood[];
  exercises: DayExercise[];
}

export default function ShareCalendarPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const resolvedParams = use(params);
  const rawName = resolvedParams.name;
  const decodedName = decodeURIComponent(rawName || '');

  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyData, setDailyData] = useState<Record<string, DayData>>({});
  const [userName, setUserName] = useState<string>(decodedName);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [onlyRecordedDays, setOnlyRecordedDays] = useState(true);

  const fetchShareData = useCallback(async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const monthStr = format(date, 'yyyy-MM');
      const res = await fetch(`/api/share/${encodeURIComponent(decodedName)}?month=${monthStr}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || '無法載入月曆資料');
      }

      setDailyData(data.days || {});
      if (data.userName) setUserName(data.userName);
    } catch (err: any) {
      console.error('Fetch share calendar error:', err);
      setError(err.message || '載入失敗');
    } finally {
      setLoading(false);
    }
  }, [decodedName]);

  useEffect(() => {
    fetchShareData(currentDate);
  }, [currentDate, fetchShareData]);

  // Generate calendar grid days (including padding)
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const interval = eachDayOfInterval({ start, end });
    const startPadding = getDay(start);
    const padding = Array(startPadding).fill(null);
    return [...padding, ...interval];
  }, [currentDate]);

  // List view days
  const listDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const interval = eachDayOfInterval({ start, end });

    return interval
      .map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        return (
          dailyData[dateStr] || {
            date: dateStr,
            foods: [],
            exercises: [],
          }
        );
      })
      .filter((day) => {
        if (!onlyRecordedDays) return true;
        return day.foods.length > 0 || day.exercises.length > 0;
      });
  }, [currentDate, dailyData, onlyRecordedDays]);

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-[#e8ecf4] px-3 sm:px-6 py-6 pb-20 max-w-6xl w-full mx-auto animate-fade-in">
      {/* Top Header Card */}
      <header className="glass-card mb-6 p-4 sm:p-5 flex items-center justify-between border border-white/10 rounded-2xl bg-white/[0.03] backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              公開月曆
            </span>
            <span className="text-xs text-slate-400">唯讀檢視</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <span>{userName} 的健康日誌</span>
          </h1>
        </div>
      </header>

      {/* Control Bar: Month Switcher & View Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        {/* Month Navigation */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 shadow-inner w-full sm:w-auto justify-between">
          <button
            onClick={() => setCurrentDate((d) => subMonths(d, 1))}
            className="p-2 rounded-xl hover:bg-white/10 active:scale-95 transition text-slate-300"
            aria-label="上個月"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center px-4 font-bold text-base sm:text-lg text-white">
            {format(currentDate, 'yyyy年 MMMM', { locale: zhTW })}
          </div>

          <button
            onClick={() => setCurrentDate((d) => addMonths(d, 1))}
            className="p-2 rounded-xl hover:bg-white/10 active:scale-95 transition text-slate-300"
            aria-label="下個月"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 ml-1 transition"
          >
            本月
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="bg-slate-900/80 p-1 rounded-xl border border-white/10 flex items-center w-full sm:w-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>月曆網格</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>整月清單</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="glass-card text-center py-12 p-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 my-6">
          <div className="text-3xl mb-2">🔒</div>
          <h2 className="text-lg font-bold text-rose-400 mb-1">此分享連結已失效或不存在</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {error}。該使用者可能已重設分享代碼、更換連結或停止公開分享。
          </p>
        </div>
      )}

      {/* Loading state */}
      {loading && !error && (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-10 h-10 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-400 tracking-wider">載入整月紀錄中...</p>
        </div>
      )}

      {/* Main Content Area */}
      {!loading && !error && (
        <>
          {/* ================= Mode 1: Calendar Grid View ================= */}
          {viewMode === 'grid' && (
            <div className="glass-card !p-3 sm:!p-5 rounded-2xl border border-white/10 bg-slate-900/40">
              {/* Day-of-week header */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-[11px] sm:text-xs font-bold text-slate-400 uppercase">
                {['週日', '週一', '週二', '週三', '週四', '週五', '週六'].map((day) => (
                  <div key={day} className="py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid cells */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {calendarDays.map((day, idx) => {
                  if (!day) {
                    return (
                      <div
                        key={`empty-${idx}`}
                        className="aspect-square md:aspect-auto md:min-h-[135px] md:h-[145px] rounded-xl bg-slate-950/20 border border-transparent"
                      />
                    );
                  }

                  const dateStr = format(day, 'yyyy-MM-dd');
                  const dayData = dailyData[dateStr] || { date: dateStr, foods: [], exercises: [] };
                  const today = isToday(day);
                  const hasFoods = dayData.foods.length > 0;
                  const hasExercises = dayData.exercises.length > 0;
                  const hasAny = hasFoods || hasExercises;

                  return (
                    <div
                      key={dateStr}
                      onClick={() => setSelectedDay(dayData)}
                      className={`
                        group relative rounded-xl border p-1.5 md:p-2.5 transition-all cursor-pointer flex flex-col justify-between
                        aspect-square md:aspect-auto md:min-h-[135px] md:h-[145px] overflow-hidden
                        ${
                          today
                            ? 'bg-emerald-500/[0.08] border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30'
                            : hasAny
                            ? 'bg-slate-800/40 hover:bg-slate-800/70 border-white/10 hover:border-white/20'
                            : 'bg-slate-900/30 hover:bg-slate-900/60 border-white/5'
                        }
                        hover:scale-[1.01] active:scale-[0.99]
                      `}
                    >
                      {/* Top Date Header */}
                      <div className="flex items-center justify-between mb-1 shrink-0">
                        <span
                          className={`text-xs sm:text-sm font-bold ${
                            today
                              ? 'text-emerald-400 bg-emerald-500/20 px-1.5 py-0.2 rounded-md'
                              : 'text-slate-300'
                          }`}
                        >
                          {format(day, 'd')}
                        </span>
                        {today && (
                          <span className="hidden md:inline-block text-[10px] text-emerald-400 font-semibold">
                            今天
                          </span>
                        )}
                      </div>

                      {/* Content: Direct Item Listing on PC / Tablets (md & above) */}
                      <div className="hidden md:flex flex-col gap-1 overflow-y-auto pr-0.5 text-[11px] leading-tight flex-1">
                        {/* Food List */}
                        {dayData.foods.map((food, fIdx) => (
                          <div
                            key={food.id || fIdx}
                            className="flex items-center gap-1 text-emerald-200/90 bg-emerald-500/10 hover:bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/20 truncate"
                            title={`${MEAL_LABELS[food.mealType] || '飲食'}：${food.name}`}
                          >
                            <span className="font-bold text-emerald-400 shrink-0">
                              [{MEAL_LABELS[food.mealType] || '飲食'}]
                            </span>
                            <span className="truncate">{food.name}</span>
                          </div>
                        ))}

                        {/* Exercise List */}
                        {dayData.exercises.map((ex, eIdx) => (
                          <div
                            key={ex.id || eIdx}
                            className="flex items-center gap-1 text-indigo-200/90 bg-indigo-500/10 hover:bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-500/20 truncate"
                            title={`運動：${ex.type} (${ex.amount})`}
                          >
                            <span className="truncate font-medium">
                              {ex.type} {ex.amount ? `(${ex.amount})` : ''}
                            </span>
                          </div>
                        ))}

                        {/* Empty placeholder on PC */}
                        {!hasAny && (
                          <div className="h-full flex items-center justify-center text-[10px] text-slate-600 italic">
                            -
                          </div>
                        )}
                      </div>

                      {/* Content: Mobile Compact View (Dots & count badge on small screens) */}
                      <div className="md:hidden flex flex-col items-center justify-center gap-0.5 flex-1">
                        {hasFoods && (
                          <div className="flex items-center gap-1 text-[10px] text-emerald-300 font-medium bg-emerald-500/15 px-1 rounded">
                            <span className="w-1 h-1 rounded-full bg-emerald-400" />
                            <span>{dayData.foods.length}餐</span>
                          </div>
                        )}
                        {hasExercises && (
                          <div className="flex items-center gap-1 text-[10px] text-indigo-300 font-medium bg-indigo-500/15 px-1 rounded">
                            <span className="w-1 h-1 rounded-full bg-indigo-400" />
                            <span>{dayData.exercises.length}項</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Grid Legend */}
              <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>飲食項目</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  <span>運動項目</span>
                </div>
                <span className="text-slate-500 text-[11px]">
                  💡 點擊任一日期方格可查看完整大字卡片
                </span>
              </div>
            </div>
          )}

          {/* ================= Mode 2: List / Agenda View (Mobile Friendly) ================= */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="flex items-center justify-between px-1">
                <p className="text-xs text-slate-400">
                  共 {listDays.length} 天紀錄
                </p>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyRecordedDays}
                    onChange={(e) => setOnlyRecordedDays(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
                  />
                  <span>僅顯示有紀錄的日子</span>
                </label>
              </div>

              {/* List of days */}
              {listDays.map((day) => {
                const dateObj = new Date(`${day.date}T00:00:00`);
                const today = isToday(dateObj);
                const hasFoods = day.foods.length > 0;
                const hasExercises = day.exercises.length > 0;

                return (
                  <div
                    key={day.date}
                    className={`glass-card p-4 sm:p-5 rounded-2xl border transition-all ${
                      today
                        ? 'border-emerald-500/40 bg-emerald-500/[0.04] shadow-[0_0_20px_rgba(16,185,129,0.08)]'
                        : 'border-white/10 bg-slate-900/40'
                    }`}
                  >
                    {/* Date Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg font-bold text-white">
                          {format(dateObj, 'M月d日 (EEEE)', { locale: zhTW })}
                        </span>
                        {today && (
                          <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            今天
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">{day.date}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Foods Column */}
                      <div className="bg-slate-950/30 rounded-xl p-3.5 border border-white/5">
                        <div className="mb-2.5 text-xs font-bold text-emerald-400">
                          <span>飲食紀錄</span>
                          <span className="text-[10px] text-slate-500 font-normal ml-1.5">
                            ({day.foods.length})
                          </span>
                        </div>

                        {hasFoods ? (
                          <ul className="space-y-1.5">
                            {day.foods.map((food, fIdx) => (
                              <li
                                key={food.id || fIdx}
                                className="flex items-center text-xs py-1.5 px-2.5 rounded-lg bg-white/[0.02] border border-white/5"
                              >
                                <span className="text-emerald-400 font-bold mr-2 shrink-0">
                                  [{MEAL_LABELS[food.mealType] || '飲食'}]
                                </span>
                                <span className="font-medium text-slate-200">{food.name}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-600 italic py-1">無飲食紀錄</p>
                        )}
                      </div>

                      {/* Exercises Column */}
                      <div className="bg-slate-950/30 rounded-xl p-3.5 border border-white/5">
                        <div className="mb-2.5 text-xs font-bold text-indigo-400">
                          <span>運動紀錄</span>
                          <span className="text-[10px] text-slate-500 font-normal ml-1.5">
                            ({day.exercises.length})
                          </span>
                        </div>

                        {hasExercises ? (
                          <ul className="space-y-1.5">
                            {day.exercises.map((ex, eIdx) => (
                              <li
                                key={ex.id || eIdx}
                                className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-white/[0.02] border border-white/5"
                              >
                                <span className="font-medium text-slate-200">{ex.type}</span>
                                <span className="text-[11px] text-indigo-300 font-mono">
                                  {ex.amount}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-600 italic py-1">無運動紀錄</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {listDays.length === 0 && (
                <div className="glass-card text-center py-16 p-6 rounded-2xl border border-white/10">
                  <p className="text-sm text-slate-400">這個月目前尚無任何飲食或運動紀錄</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Day Details Modal (Opens when clicked from Calendar Grid) */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card max-w-lg w-full p-5 sm:p-6 rounded-2xl border border-white/15 bg-slate-900 shadow-2xl relative animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {format(new Date(`${selectedDay.date}T00:00:00`), 'yyyy年 M月d日 (EEEE)', {
                    locale: zhTW,
                  })}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">當日紀錄清單</p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
              {/* Foods */}
              <div>
                <h4 className="text-xs font-bold text-emerald-400 mb-2.5">
                  <span>吃了什麼 ({selectedDay.foods.length})</span>
                </h4>
                {selectedDay.foods.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDay.foods.map((food, fIdx) => (
                      <div
                        key={food.id || fIdx}
                        className="flex items-center p-2.5 rounded-xl bg-slate-800/60 border border-emerald-500/20"
                      >
                        <span className="text-xs font-bold text-emerald-400 mr-2 shrink-0">
                          [{MEAL_LABELS[food.mealType] || '飲食'}]
                        </span>
                        <span className="text-sm font-medium text-slate-100">{food.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic bg-slate-950/30 p-3 rounded-xl">
                    當日無飲食紀錄
                  </p>
                )}
              </div>

              {/* Exercises */}
              <div>
                <h4 className="text-xs font-bold text-indigo-400 mb-2.5">
                  <span>做了哪些運動 ({selectedDay.exercises.length})</span>
                </h4>
                {selectedDay.exercises.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDay.exercises.map((ex, eIdx) => (
                      <div
                        key={ex.id || eIdx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-indigo-500/20"
                      >
                        <span className="text-sm font-medium text-slate-100">{ex.type}</span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono">
                          {ex.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic bg-slate-950/30 p-3 rounded-xl">
                    當日無運動紀錄
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedDay(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
