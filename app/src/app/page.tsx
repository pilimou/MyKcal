'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Stats } from '@/lib/types';
import { useSession } from 'next-auth/react';
import CalorieRing from '@/components/CalorieRing';
import NutrientBar from '@/components/NutrientBar';
import StatCard from '@/components/StatCard';
import RecordItem from '@/components/RecordItem';

export default function Dashboard() {
  const { data: session } = useSession();
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stats?period=${period}`);
      const data = await res.json();
      if (data.error) {
        console.error('API Error Details:', data.details, 'Code:', data.code);
        throw new Error(data.error);
      }
      setStats(data);
    } catch (err: any) {
      console.error('Fetch stats error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <main className="page animate-fade-in">
      <header className="flex justify-between items-center mb-6">
        <h1 className="page-title !mb-0">My Kcal</h1>
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold overflow-hidden">
          {session?.user?.name ? session.user.name[0] : 'U'}
        </div>
      </header>

      {/* Period Switcher */}
      <div className="period-tabs">
        <button
          className={`period-tab ${period === 'today' ? 'active' : ''}`}
          onClick={() => setPeriod('today')}
        >
          今日
        </button>
        <button
          className={`period-tab ${period === 'week' ? 'active' : ''}`}
          onClick={() => setPeriod('week')}
        >
          本週
        </button>
        <button
          className={`period-tab ${period === 'month' ? 'active' : ''}`}
          onClick={() => setPeriod('month')}
        >
          本月
        </button>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          {/* Calorie Overview */}
          <section className="dashboard-section glass-card flex flex-col items-center">
            <h2 className="section-title w-full">熱量攝取</h2>
            <CalorieRing 
              current={stats?.totalCalories || 0} 
              target={(stats?.userTarget || 2000) * (period === 'today' ? 1 : period === 'week' ? 7 : 30)} 
            />
            <div className="mt-6 w-full">
              <NutrientBar 
                protein={stats?.proteinTotal || 0} 
                carbs={stats?.carbsTotal || 0} 
                fat={stats?.fatTotal || 0} 
                targetProtein={(stats?.targetProtein || 0) * (period === 'today' ? 1 : period === 'week' ? 7 : 30)}
                targetCarbs={(stats?.targetCarbs || 0) * (period === 'today' ? 1 : period === 'week' ? 7 : 30)}
                targetFat={(stats?.targetFat || 0) * (period === 'today' ? 1 : period === 'week' ? 7 : 30)}
              />
            </div>
          </section>

          {/* Stats Grid */}
          <section className="stat-grid">
            <StatCard
              label="總花費"
              value={`$${(stats?.totalSpending || 0).toLocaleString()}`}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              }
              accent="#fbbf24"
              sub={period !== 'today' ? `日均 $${stats?.avgDailySpending || 0}` : undefined}
            />
            <StatCard
              label="紀錄筆數"
              value={stats?.records.length || 0}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              }
              accent="#60a5fa"
              sub={period !== 'today' ? `共 ${stats?.daysCount || 0} 天` : undefined}
            />
          </section>

          {/* Recent Records */}
          <section className="dashboard-section">
            <div className="flex justify-between items-center mb-3">
              <h2 className="section-title !mb-0">最近紀錄</h2>
              <button className="text-xs text-emerald-400 font-semibold" onClick={() => window.location.href='/records'}>
                查看全部
              </button>
            </div>
            <div className="recent-list">
              {stats?.records.slice(0, 5).map((record) => (
                <RecordItem key={record.id} record={record} />
              ))}
              {stats?.records.length === 0 && (
                <div className="empty-state glass-card">
                  <span className="empty-state-icon">🍽️</span>
                  <p className="empty-state-text">尚無紀錄，開始掃描你的第一餐吧！</p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="glass-card h-64 flex flex-col items-center">
        <div className="skeleton skeleton-ring mb-6" />
        <div className="w-full space-y-3">
          <div className="skeleton skeleton-bar w-full" />
          <div className="skeleton skeleton-bar w-5/6" />
          <div className="skeleton skeleton-bar w-4/6" />
        </div>
      </div>
      <div className="stat-grid">
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-card" />
      </div>
      <div className="space-y-2">
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-card" />
      </div>
    </div>
  );
}
