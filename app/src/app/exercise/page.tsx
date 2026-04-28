'use client';

import { useState, useEffect, useCallback } from 'react';
import ExerciseInput from '@/components/ExerciseInput';
import type { ExerciseRecord } from '@/lib/types';

export default function ExercisePage() {
  const [exercises, setExercises] = useState<ExerciseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/exercises');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setExercises(data.exercises);
    } catch (err: any) {
      console.error('Fetch exercises error:', err);
      setError('獲取紀錄失敗');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const handleSave = async (data: { type: string; amount: string; caloriesBurned: number; date: string }) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      
      await fetchExercises();
    } catch (err: any) {
      console.error('Save exercise error:', err);
      setError('儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="page animate-fade-in pb-24">
      <h1 className="page-title">運動紀錄</h1>

      {error && (
        <div className="toast toast-error mb-4 relative top-0 left-0 transform-none w-full">
          ⚠️ {error}
        </div>
      )}

      <ExerciseInput onSave={handleSave} loading={saving} />

      <div className="mt-8">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">最近運動</h2>
        <div className="space-y-3">
          {exercises.map(ex => (
            <div key={ex.id} className="record-item !mb-0">
              <div className="record-item-indicator bg-indigo-500" />
              <div className="record-item-body">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="record-item-name">{ex.type}</h3>
                    <p className="text-xs text-slate-500">{ex.amount}</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-bold text-indigo-400">-{ex.caloriesBurned} <small className="text-[10px] uppercase">kcal</small></span>
                    <span className="text-[10px] text-slate-500">{ex.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {exercises.length === 0 && !loading && (
            <div className="text-center py-12 glass-card">
              <span className="text-3xl block mb-2">🏃‍♂️</span>
              <p className="text-sm text-slate-500">還沒開始運動嗎？動起來吧！</p>
            </div>
          )}
          {loading && (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
