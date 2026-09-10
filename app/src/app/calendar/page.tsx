'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import CalendarGrid from '@/components/CalendarGrid';
import RecordItem from '@/components/RecordItem';
import { type FoodRecord, type ExerciseRecord, type CalendarDaySummary, compareMealOrder } from '@/lib/types';
import { format } from 'date-fns';

export default function CalendarPage() {
  const { data: session } = useSession();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyData, setDailyData] = useState<Record<string, CalendarDaySummary>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<{ food: FoodRecord[]; exercise: ExerciseRecord[] }>({ food: [], exercise: [] });
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyShareLink = async () => {
    try {
      const res = await fetch('/api/user/share-token');
      const data = await res.json();
      const token = data.shareToken || (session?.user?.name ? encodeURIComponent(session.user.name) : '');
      if (!token) return;
      const shareUrl = `${window.location.origin}/share/${token}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy share link:', err);
    }
  };

  const fetchCalendarData = useCallback(async (date: Date) => {
    setLoading(true);
    try {
      const monthStr = format(date, 'yyyy-MM');
      const res = await fetch(`/api/calendar?month=${monthStr}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDailyData(data.dailyData);
    } catch (err) {
      console.error('Fetch calendar error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendarData(currentDate);
  }, [currentDate, fetchCalendarData]);

  const handleDateClick = async (dateStr: string) => {
    setSelectedDate(dateStr);
    setDetailsLoading(true);
    try {
      // Fetch food records and exercises for this date
      const [foodRes, exRes] = await Promise.all([
        fetch(`/api/records?period=custom&date=${dateStr}`), // Need to support date param in records API
        fetch(`/api/exercises?date=${dateStr}`),
      ]);
      
      const foodData = await foodRes.json();
      const exData = await exRes.json();
      
      const foodList = (foodData.records || []).slice().sort(compareMealOrder);
      
      setSelectedRecords({
        food: foodList,
        exercise: exData.exercises || [],
      });
    } catch (err) {
      console.error('Fetch day details error:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <main className="page animate-fade-in pb-24 w-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-title !mb-0">熱量月曆</h1>
        {session?.user?.name && (
          <button
            onClick={handleCopyShareLink}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 transition"
            title="複製免登入公開分享連結"
          >
            {copied ? (
              <span className="text-emerald-400">已複製分享連結！</span>
            ) : (
              <span>複製分享連結</span>
            )}
          </button>
        )}
      </div>

      <CalendarGrid 
        dailyData={dailyData} 
        onDateClick={handleDateClick} 
        currentDate={currentDate}
        onMonthChange={setCurrentDate}
        selectedDate={selectedDate}
      />

      {selectedDate && (
        <div className="mt-8 animate-slide-up">
          <div className="flex justify-between items-baseline mb-4">
            <h2 className="text-lg font-bold">{selectedDate} <span className="text-xs font-normal text-slate-500 ml-1">細節</span></h2>
            {dailyData[selectedDate] && (
              <div className="text-right">
                <span className={`text-sm font-bold ${
                  (dailyData[selectedDate].target + dailyData[selectedDate].exercise - dailyData[selectedDate].food) >= 0 
                  ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  赤字: {dailyData[selectedDate].target + dailyData[selectedDate].exercise - dailyData[selectedDate].food} kcal
                </span>
              </div>
            )}
          </div>

          {detailsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Food Section */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  飲食紀錄
                </h3>
                <div className="space-y-2">
                  {selectedRecords.food.map(r => (
                    <RecordItem key={r.id} record={r} />
                  ))}
                  {selectedRecords.food.length === 0 && (
                    <p className="text-xs text-slate-600 italic py-2">無飲食紀錄</p>
                  )}
                </div>
              </div>

              {/* Exercise Section */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  運動紀錄
                </h3>
                <div className="space-y-2">
                  {selectedRecords.exercise.map(ex => (
                    <div key={ex.id} className="record-item !mb-0">
                      <div className="record-item-indicator bg-indigo-500" />
                      <div className="record-item-body">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="record-item-name">{ex.type}</h3>
                            <p className="text-[10px] text-slate-500">{ex.amount}</p>
                          </div>
                          <span className="text-sm font-bold text-indigo-400">-{ex.caloriesBurned} kcal</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {selectedRecords.exercise.length === 0 && (
                    <p className="text-xs text-slate-600 italic py-2">無運動紀錄</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
