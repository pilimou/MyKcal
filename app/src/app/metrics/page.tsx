'use client';

import { useState, useEffect, useCallback } from 'react';
import MetricInput from '@/components/MetricInput';
import MetricChart from '@/components/MetricChart';
import type { BodyMetric } from '@/lib/types';

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [range, setRange] = useState<'7d' | '1m' | '6m'>('7d');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/metrics?range=${range}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMetrics(data.metrics);
    } catch (err: any) {
      console.error('Fetch metrics error:', err);
      setError('獲取數據失敗');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const handleSave = async (data: { weight: number; bodyFat?: number; waist?: number; date: string }) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      
      // Refresh data
      await fetchMetrics();
    } catch (err: any) {
      console.error('Save metric error:', err);
      setError('儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="page animate-fade-in pb-24">
      <h1 className="page-title">體態追蹤</h1>

      {error && (
        <div className="toast toast-error mb-4 relative top-0 left-0 transform-none w-full">
          ⚠️ {error}
        </div>
      )}

      <MetricInput onSave={handleSave} loading={saving} />

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">變化趨勢</h2>
          <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
            {(['7d', '1m', '6m'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  range === r ? 'bg-emerald-500 text-slate-900' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r === '7d' ? '7天' : r === '1m' ? '1月' : '半年'}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card !p-2 min-h-[340px] flex flex-col justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-sm text-slate-500">載入圖表中...</p>
            </div>
          ) : (
            <MetricChart data={metrics} />
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">最近紀錄</h2>
        <div className="space-y-3">
          {metrics.slice().reverse().slice(0, 5).map(m => (
            <div key={m.id} className="glass-card flex justify-between items-center py-3">
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-medium">{m.date}</span>
                <span className="text-lg font-bold text-emerald-400">{m.weight} <small className="text-[10px] text-slate-500 uppercase">kg</small></span>
              </div>
              <div className="flex gap-4">
                {m.bodyFat && (
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-500 uppercase font-bold">體脂</span>
                    <span className="text-sm font-bold text-rose-400">{m.bodyFat}%</span>
                  </div>
                )}
                {m.waist && (
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-500 uppercase font-bold">腰圍</span>
                    <span className="text-sm font-bold text-amber-400">{m.waist}cm</span>
                  </div>
                )}
                {m.skeletalMuscle && (
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-500 uppercase font-bold">肌肉</span>
                    <span className="text-sm font-bold text-indigo-400">{m.skeletalMuscle}%</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {metrics.length === 0 && !loading && (
            <div className="text-center py-12 glass-card">
              <span className="text-3xl block mb-2">📉</span>
              <p className="text-sm text-slate-500">開始紀錄你的第一筆數據吧</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
