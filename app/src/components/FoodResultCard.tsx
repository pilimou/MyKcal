'use client';

import { useState } from 'react';
import type { FoodAnalysis, MealType } from '@/lib/types';
import { MEAL_LABELS } from '@/lib/types';

interface FoodResultCardProps {
  analysis: FoodAnalysis;
  imagePreview?: string;
  onSave: (data: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    price: number;
    mealType: MealType;
    date: string;
  }) => void;
  onRescan: () => void;
  saving?: boolean;
}

export default function FoodResultCard({
  analysis,
  imagePreview,
  onSave,
  onRescan,
  saving,
}: FoodResultCardProps) {
  const [name, setName] = useState(analysis.name);
  const [calories, setCalories] = useState(analysis.calories);
  const [protein, setProtein] = useState(analysis.protein);
  const [carbs, setCarbs] = useState(analysis.carbs);
  const [fat, setFat] = useState(analysis.fat);
  const [price, setPrice] = useState(analysis.estimatedPrice);
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSave = () => {
    onSave({ name, calories, protein, carbs, fat, price, mealType, date });
  };

  const confidenceColor =
    analysis.confidence === 'high'
      ? 'text-emerald-400'
      : analysis.confidence === 'medium'
        ? 'text-amber-400'
        : 'text-red-400';

  return (
    <div className="food-result-card animate-slide-up">
      {/* Header with preview */}
      {imagePreview && (
        <div className="food-result-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imagePreview} alt="食物照片" className="food-result-image" />
          <div className="food-result-overlay">
            <span className={`confidence-badge ${confidenceColor}`}>
              AI 信心度：{analysis.confidence === 'high' ? '高' : analysis.confidence === 'medium' ? '中' : '低'}
            </span>
          </div>
        </div>
      )}

      {/* Food name */}
      <div className="food-result-body">
        <div className="field-group">
          <label className="field-label">品名</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field-input text-lg font-bold"
            id="food-name-input"
          />
        </div>

        {/* Nutrition grid */}
        <div className="nutrition-grid">
          <div className="nutrition-item calories">
            <label className="field-label">熱量</label>
            <div className="nutrition-value-row">
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                className="field-input-sm"
                id="calories-input"
              />
              <span className="nutrition-unit">kcal</span>
            </div>
          </div>
          <div className="nutrition-item protein">
            <label className="field-label">蛋白質</label>
            <div className="nutrition-value-row">
              <input
                type="number"
                step="0.1"
                value={protein}
                onChange={(e) => setProtein(Number(e.target.value))}
                className="field-input-sm"
                id="protein-input"
              />
              <span className="nutrition-unit">g</span>
            </div>
          </div>
          <div className="nutrition-item carb">
            <label className="field-label">碳水</label>
            <div className="nutrition-value-row">
              <input
                type="number"
                step="0.1"
                value={carbs}
                onChange={(e) => setCarbs(Number(e.target.value))}
                className="field-input-sm"
                id="carbs-input"
              />
              <span className="nutrition-unit">g</span>
            </div>
          </div>
          <div className="nutrition-item fat-item">
            <label className="field-label">脂肪</label>
            <div className="nutrition-value-row">
              <input
                type="number"
                step="0.1"
                value={fat}
                onChange={(e) => setFat(Number(e.target.value))}
                className="field-input-sm"
                id="fat-input"
              />
              <span className="nutrition-unit">g</span>
            </div>
          </div>
        </div>

        <div className="field-group">
          <label className="field-label">價格</label>
          <div className="price-input-row">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="field-input"
              id="price-input"
              placeholder="0"
            />
          </div>
        </div>

        {/* Meal type */}
        <div className="field-group">
          <label className="field-label">餐別</label>
          <div className="meal-selector" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {(Object.entries(MEAL_LABELS) as [MealType, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setMealType(key)}
                className={`meal-chip ${mealType === key ? 'active' : ''}`}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: mealType === key ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: mealType === key ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  color: mealType === key ? '#10b981' : '#64748b',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
                id={`meal-${key}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div className="field-group">
          <label className="field-label">日期</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="field-input"
            id="date-input"
          />
        </div>

        {/* Actions */}
        <div className="food-result-actions">
          <button
            onClick={() => {
              if (!imagePreview) {
                // Manual mode: reset all fields
                setName('');
                setCalories(0);
                setProtein(0);
                setCarbs(0);
                setFat(0);
                setPrice(0);
              } else {
                // Scan mode: call onRescan
                onRescan();
              }
            }}
            className="btn-secondary"
            disabled={saving}
            id="rescan-button"
          >
            {imagePreview ? '重新掃描' : '重新填寫'}
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
            disabled={saving}
            id="save-button"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="spinner-sm" />
                儲存中...
              </span>
            ) : (
              '儲存至 Notion'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
