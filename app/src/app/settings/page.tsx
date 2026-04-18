'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import type { UserProfile } from '@/lib/types';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (session?.user?.email) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateBMR = (p: UserProfile) => {
    if (!p.weight || !p.height || !p.birthday) return 0;
    const age = new Date().getFullYear() - new Date(p.birthday).getFullYear();
    if (p.gender === 'male') {
      return 10 * p.weight + 6.25 * p.height - 5 * age + 5;
    } else {
      return 10 * p.weight + 6.25 * p.height - 5 * age - 161;
    }
  };

  const calculateTDEE = (bmr: number, activity: UserProfile['activityLevel']) => {
    const factors = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    return Math.round(bmr * factors[activity]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setSaving(true);
    setMessage('');

    // Auto-calculate target if height/weight changed
    const bmr = calculateBMR(profile);
    const tdee = calculateTDEE(bmr, profile.activityLevel);
    const updatedProfile = { ...profile, targetCalories: tdee };

    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile),
      });
      
      if (res.ok) {
        setProfile(updatedProfile);
        setMessage('設定已儲存！目標熱量已更新。');
      }
    } catch (err) {
      setMessage('儲存失敗，請稍後再試。');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="page flex items-center justify-center min-h-[60vh]">
      <div className="analyzing-spinner" />
    </div>
  );

  if (!profile) return <div className="page">找不到使用者資料</div>;

  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, profile.activityLevel);

  return (
    <div className="page animate-fade-in">
      <h1 className="page-title">個人設定</h1>

      <div className="glass-card mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-2xl">
            {profile.name[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <p className="text-sm text-slate-400">{profile.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="field-group">
              <label className="field-label">性別</label>
              <select 
                className="field-input"
                value={profile.gender}
                onChange={e => setProfile({...profile, gender: e.target.value as any})}
              >
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>
            <div className="field-group">
              <label className="field-label">生日</label>
              <input 
                type="date" 
                className="field-input"
                value={profile.birthday}
                onChange={e => setProfile({...profile, birthday: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="field-group">
              <label className="field-label">身高 (cm)</label>
              <input 
                type="number" 
                className="field-input"
                value={profile.height}
                onChange={e => setProfile({...profile, height: Number(e.target.value)})}
              />
            </div>
            <div className="field-group">
              <label className="field-label">體重 (kg)</label>
              <input 
                type="number" 
                className="field-input"
                value={profile.weight}
                onChange={e => setProfile({...profile, weight: Number(e.target.value)})}
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">活動等級</label>
            <select 
              className="field-input"
              value={profile.activityLevel}
              onChange={e => setProfile({...profile, activityLevel: e.target.value as any})}
            >
              <option value="sedentary">久坐 (幾乎不運動)</option>
              <option value="light">輕度 (每週運動 1-3 天)</option>
              <option value="moderate">中度 (每週運動 3-5 天)</option>
              <option value="active">重度 (每週運動 6-7 天)</option>
              <option value="very_active">極重度 (勞力工作或運動員)</option>
            </select>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">基礎代謝率 (BMR)</span>
              <span className="font-bold text-emerald-400">{bmr} kcal</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">總熱量消耗 (TDEE)</span>
              <span className="font-bold text-emerald-400">{tdee} kcal</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 italic">
              * 系統將自動以 TDEE 作為你的每日攝取目標
            </p>
          </div>

          {message && <p className="text-center text-sm text-emerald-400">{message}</p>}

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? '儲存中...' : '儲存設定'}
          </button>
        </form>
      </div>

      <button 
        onClick={() => signOut()}
        className="w-full py-4 text-red-400 font-bold border border-red-400/20 rounded-xl hover:bg-red-400/5 transition-colors"
      >
        登出系統
      </button>
    </div>
  );
}
