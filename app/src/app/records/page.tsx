'use client';

import { useEffect, useState, useMemo } from 'react';
import type { FoodRecord, DayGroup } from '@/lib/types';
import RecordItem from '@/components/RecordItem';

export default function RecordsPage() {
  const [records, setRecords] = useState<FoodRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  useEffect(() => {
    async function fetchRecords() {
      setLoading(true);
      try {
        const res = await fetch(`/api/records?period=${period}`);
        const data = await res.json();
        if (data.records) {
          setRecords(data.records);
        }
      } catch (err) {
        console.error('Fetch records error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecords();
  }, [period]);

  const groupedRecords = useMemo(() => {
    const groups: Record<string, DayGroup> = {};

    records.forEach((record) => {
      const date = record.date;
      if (!groups[date]) {
        groups[date] = {
          date,
          records: [],
          totalCalories: 0,
          totalPrice: 0,
        };
      }
      groups[date].records.push(record);
      groups[date].totalCalories += record.calories;
      groups[date].totalPrice += record.price;
    });

    return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
  }, [records]);

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這筆紀錄嗎？')) return;

    try {
      const res = await fetch(`/api/records/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
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
                <div className="day-group-summary">
                  <span>🔥 {group.totalCalories} kcal</span>
                  <span>💰 ${group.totalPrice}</span>
                </div>
              </div>
              <div className="day-group-records">
                {group.records.map((record) => (
                  <RecordItem key={record.id} record={record} onDelete={handleDelete} />
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
