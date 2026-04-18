import type { FoodRecord } from '@/lib/types';
import { MEAL_LABELS, MEAL_COLORS } from '@/lib/types';

interface RecordItemProps {
  record: FoodRecord;
  onDelete?: (id: string) => void;
}

export default function RecordItem({ record, onDelete }: RecordItemProps) {
  return (
    <div className="record-item group" id={`record-${record.id}`}>
      <div
        className="record-item-indicator"
        style={{ background: MEAL_COLORS[record.mealType] }}
      />
      <div className="record-item-body">
        <div className="record-item-header">
          <span className="record-item-name">{record.name}</span>
          <span
            className="record-item-meal-badge"
            style={{
              background: `${MEAL_COLORS[record.mealType]}20`,
              color: MEAL_COLORS[record.mealType],
            }}
          >
            {MEAL_LABELS[record.mealType]}
          </span>
        </div>
        <div className="record-item-details">
          <span className="record-item-cal">🔥 {record.calories} kcal</span>
          <span className="record-item-nutrients">
            蛋白質 {record.protein}g · 碳水 {record.carbs}g · 脂肪 {record.fat}g
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="record-item-price">
          <span className="record-item-price-value">NT${record.price}</span>
        </div>
        {onDelete && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(record.id);
            }}
            className="delete-btn p-1.5 text-red-400/60 hover:text-red-500 hover:bg-red-400/10 rounded-lg transition-colors"
            title="刪除紀錄"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        )}
      </div>
    </div>
  );
}
