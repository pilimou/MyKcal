'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import type { FoodRecord, DayGroup } from '@/lib/types';
import RecordItem from '@/components/RecordItem';

export default function RecordsPage() {
  const [foodRecords, setFoodRecords] = useState<FoodRecord[]>([]);
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [exercises, setExercises] = useState<ExerciseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const range = period === 'week' ? '7d' : '1m';
      const [foodRes, metricsRes, exercisesRes] = await Promise.all([
        fetch(`/api/records?period=${period}`),
        fetch(`/api/metrics?range=${range}`),
        fetch(`/api/exercises`), // Exercises API returns last 30 days by default
      ]);

      const foodData = await foodRes.json();
      const metricsData = await metricsRes.json();
      const exercisesData = await exercisesRes.json();

      if (foodData.records) setFoodRecords(foodData.records);
      if (metricsData.metrics) setMetrics(metricsData.metrics);
      if (exercisesData.exercises) setExercises(exercisesData.exercises);
    } catch (err) {
      console.error('Fetch data error:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const groupedRecords = useMemo(() => {
    const groups: Record<string, DayGroup> = {};

    foodRecords.forEach((record) => {
      const date = record.date;
      if (!groups[date]) {
        groups[date] = { date, records: [], metrics: [], exercises: [], totalCalories: 0, totalPrice: 0 };
      }
      groups[date].records.push(record);
      groups[date].totalCalories += record.calories;
      groups[date].totalPrice += record.price;
    });

    metrics.forEach((metric) => {
      const date = metric.date;
      if (!groups[date]) {
        groups[date] = { date, records: [], metrics: [], exercises: [], totalCalories: 0, totalPrice: 0 };
      }
      groups[date].metrics.push(metric);
    });

    exercises.forEach((ex) => {
      const date = ex.date;
      if (!groups[date]) {
        groups[date] = { date, records: [], metrics: [], exercises: [], totalCalories: 0, totalPrice: 0 };
      }
      groups[date].exercises.push(ex);
    });

    return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
  }, [foodRecords, metrics, exercises]);

  const handleDelete = async (id: string, type: 'food' | 'metric' | 'exercise') => {
    if (!confirm('確定要刪除這筆紀錄嗎？')) return;

    try {
      const endpoint = type === 'food' ? `/api/records/${id}` : type === 'metric' ? `/api/metrics/${id}` : `/api/exercises/${id}`;
      const res = await fetch(endpoint, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (type === 'food') setFoodRecords(prev => prev.filter(r => r.id !== id));
        else if (type === 'metric') setMetrics(prev => prev.filter(r => r.id !== id));
        else if (type === 'exercise') setExercises(prev => prev.filter(r => r.id !== id));
      } else {
        alert('刪除失敗，請稍後再試');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('發生錯誤');
    }
  };

  return (
    <main className="page animate-fade-in">
      <h1 className="page-title">紀錄歷史</h1>

      <div className="period-tabs">
        <button
          className={`period-tab ${period === 'week' ? 'active' : ''}`}
          onClick={() => setPeriod('week')}
        >
          最近 7 天
        </button>
        <button
          className={`period-tab ${period === 'month' ? 'active' : ''}`}
          onClick={() => setPeriod('month')}
        >
          最近 30 天
        </button>
      </div>

      {loading ? (
        <div className="space-y-8 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="flex justify-between">
                <div className="skeleton h-5 w-24" />
                <div className="skeleton h-5 w-32" />
              </div>
              <div className="skeleton h-20 w-full" />
              <div className="skeleton h-20 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {groupedRecords.map((group) => (
            <div key={group.date} className="day-group animate-slide-up">
              <div className="day-group-header">
                <span className="day-group-date">
                  {new Date(group.date).toLocaleDateString('zh-TW', {
                    month: 'short',
                    day: 'numeric',
                    weekday: 'short',
                  })}
                </span>
                <div className="day-group-summary text-[10px] sm:text-xs">
                  <span className="bg-emerald-500/10 px-2 py-0.5 rounded text-emerald-400">🔥 {group.totalCalories} kcal</span>
                  <span className="bg-blue-500/10 px-2 py-0.5 rounded text-blue-400">💰 ${group.totalPrice}</span>
                </div>
              </div>
              <div className="day-group-records space-y-2">
                {group.records.map((record) => (
                  <RecordItem key={record.id} record={record} onDelete={(id) => handleDelete(id, 'food')} />
                ))}
                
                {group.exercises.map((ex) => (
                  <div key={ex.id} className="record-item group">
                    <div className="record-item-indicator bg-indigo-500" />
                    <div className="record-item-body">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="record-item-name">{ex.type}</h3>
                          <p className="text-xs text-slate-500">{ex.amount}</p>
                        </div>
                        <div className="text-right">
                          <span className="block text-sm font-bold text-indigo-400">-{ex.caloriesBurned} kcal</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(ex.id, 'exercise')}
                      className="delete-btn p-1.5 text-red-400/60 hover:text-red-500 hover:bg-red-400/10 rounded-lg transition-colors ml-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </div>
                ))}

                {group.metrics.map((m) => (
                  <div key={m.id} className="record-item group">
                    <div className="record-item-indicator bg-amber-500" />
                    <div className="record-item-body">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-4">
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold">體重</p>
                            <span className="text-sm font-bold text-emerald-400">{m.weight}kg</span>
                          </div>
                          {m.bodyFat && (
                            <div>
                              <p className="text-[10px] text-slate-500 uppercase font-bold">體脂</p>
                              <span className="text-sm font-bold text-rose-400">{m.bodyFat}%</span>
                            </div>
                          )}
                          {m.waist && (
                            <div>
                              <p className="text-[10px] text-slate-500 uppercase font-bold">腰圍</p>
                              <span className="text-sm font-bold text-amber-400">{m.waist}cm</span>
                            </div>
                          )}
                          {m.skeletalMuscle && (
                            <div>
                              <p className="text-[10px] text-slate-500 uppercase font-bold">肌肉</p>
                              <span className="text-sm font-bold text-indigo-400">{m.skeletalMuscle}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(m.id, 'metric')}
                      className="delete-btn p-1.5 text-red-400/60 hover:text-red-500 hover:bg-red-400/10 rounded-lg transition-colors ml-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {groupedRecords.length === 0 && (
            <div className="empty-state glass-card">
              <span className="empty-state-icon">📄</span>
              <p className="empty-state-text">這段期間還沒有紀錄喔</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
