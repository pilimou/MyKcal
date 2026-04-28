'use client';

import { useState } from 'react';

interface MetricInputProps {
  onSave: (data: { weight: number; bodyFat?: number; waist?: number; skeletalMuscle?: number; date: string }) => Promise<void>;
  loading: boolean;
}

export default function MetricInput({ onSave, loading }: MetricInputProps) {
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [waist, setWaist] = useState('');
  const [skeletalMuscle, setSkeletalMuscle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;
    
    await onSave({
      weight: Number(weight),
      bodyFat: bodyFat ? Number(bodyFat) : undefined,
      waist: waist ? Number(waist) : undefined,
      skeletalMuscle: skeletalMuscle ? Number(skeletalMuscle) : undefined,
      date,
    });
    
    setWeight('');
    setBodyFat('');
    setWaist('');
    setSkeletalMuscle('');
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card flex flex-col gap-4 animate-slide-up">
      <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">新增數據</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="field-group">
          <label className="field-label">日期</label>
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)}
            className="field-input"
            required
          />
        </div>
        <div className="field-group">
          <label className="field-label">體重 (kg)</label>
          <input 
            type="number" 
            step="0.1"
            value={weight} 
            onChange={e => setWeight(e.target.value)}
            className="field-input"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="field-group">
          <label className="field-label">體脂 (%)</label>
          <input 
            type="number" 
            step="0.1"
            value={bodyFat} 
            onChange={e => setBodyFat(e.target.value)}
            className="field-input"
          />
        </div>
        <div className="field-group">
          <label className="field-label">腰圍 (cm)</label>
          <input 
            type="number" 
            step="0.1"
            value={waist} 
            onChange={e => setWaist(e.target.value)}
            className="field-input"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="field-group">
          <label className="field-label">骨骼肌量 (%)</label>
          <input 
            type="number" 
            step="0.1"
            value={skeletalMuscle} 
            onChange={e => setSkeletalMuscle(e.target.value)}
            className="field-input"
          />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="btn-primary mt-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
        ) : '儲存紀錄'}
      </button>
    </form>
  );
}
