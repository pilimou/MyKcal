'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CameraCapture from '@/components/CameraCapture';
import FoodResultCard from '@/components/FoodResultCard';
import type { FoodAnalysis, MealType } from '@/lib/types';

export default function ScanPage() {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCapture = async (base64: string, mimeType: string) => {
    setAnalyzing(true);
    setPreview(base64);
    setError(null);
    setAnalysis(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mimeType }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setAnalysis(data);
    } catch (err) {
      console.error('Analyze capture error:', err);
      setError(err instanceof Error ? err.message : '分析失敗，請重試');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async (formData: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    price: number;
    mealType: MealType;
    date: string;
  }) => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err) {
      console.error('Save record error:', err);
      setError('儲存失敗，請重試');
      setSaving(false);
    }
  };

  const handleRescan = () => {
    setAnalysis(null);
    setPreview(null);
    setError(null);
  };

  return (
    <main className="page min-h-screen flex flex-col">
      <h1 className="page-title">掃描食物</h1>

      {success && (
        <div className="toast toast-success">
          ✨ 儲存成功！正在回首頁...
        </div>
      )}

      {error && (
        <div className="toast toast-error">
          ⚠️ {error}
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center">
        {!analysis && !analyzing && (
          <div className="animate-scale-in flex flex-col items-center">
            <div className="text-center mb-8">
              <p className="text-lg font-semibold text-emerald-400 mb-2">準備好你的下一餐了嗎？</p>
              <p className="text-sm text-slate-400">拍一張照片，AI 會幫你計算熱量</p>
            </div>
            
            <CameraCapture onCapture={handleCapture} />

            <button 
              onClick={() => {
                setAnalysis({
                  name: '',
                  calories: 0,
                  protein: 0,
                  carbs: 0,
                  fat: 0,
                  estimatedPrice: 0,
                  confidence: 'high'
                });
                setPreview(null);
              }}
              className="mt-8 text-emerald-400 font-semibold flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              手動輸入資料
            </button>

            <div className="mt-12 grid grid-cols-2 gap-4 w-full px-4">
              <div className="glass-card p-4 text-center">
                <span className="text-2xl mb-2 block">🥗</span>
                <span className="text-xs font-medium text-slate-400">辨識超過 1000 種食物</span>
              </div>
              <div className="glass-card p-4 text-center">
                <span className="text-2xl mb-2 block">💰</span>
                <span className="text-xs font-medium text-slate-400">自動估算餐點價格</span>
              </div>
            </div>
          </div>
        )}

        {analyzing && (
          <div className="analyzing-loader">
            <div className="analyzing-spinner" />
            <p className="analyzing-text">AI 正在努力分析中...</p>
            <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden mt-4">
              <div className="h-full bg-emerald-500 animate-[shimmer_2s_infinite] w-full origin-left" />
            </div>
          </div>
        )}

        {analysis && (
          <div className="pb-8">
            <FoodResultCard
              analysis={analysis}
              imagePreview={preview || undefined}
              onSave={handleSave}
              onRescan={handleRescan}
              saving={saving}
            />
          </div>
        )}
      </div>
    </main>
  );
}
