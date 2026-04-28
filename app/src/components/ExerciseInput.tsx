'use client';

import { useState } from 'react';

interface ExerciseInputProps {
  onSave: (data: { type: string; amount: string; caloriesBurned: number; date: string }) => Promise<void>;
  loading: boolean;
}

export default function ExerciseInput({ onSave, loading }: ExerciseInputProps) {
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !amount) return;
    
    await onSave({
      type,
      amount,
      caloriesBurned: Number(caloriesBurned) || 0,
      date,
    });
    
    setType('');
    setAmount('');
    setCaloriesBurned('');
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card flex flex-col gap-4 animate-slide-up">
      <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">新增運動</h3>
      
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
        <label className="field-label">運動種類</label>
        <input 
          type="text" 
          value={type} 
          onChange={e => setType(e.target.value)}
          className="field-input"
          placeholder="例如：慢跑、深蹲、游泳"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="field-group">
          <label className="field-label">運動量 / 強度</label>
          <input 
            type="text" 
            value={amount} 
            onChange={e => setAmount(e.target.value)}
            className="field-input"
            placeholder="例如：30分鐘、5組"
            required
          />
        </div>
        <div className="field-group">
          <label className="field-label">預估消耗 (kcal)</label>
          <input 
            type="number" 
            value={caloriesBurned} 
            onChange={e => setCaloriesBurned(e.target.value)}
            className="field-input"
            placeholder="例如：300"
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
        ) : '紀錄運動'}
      </button>
    </form>
  );
}
