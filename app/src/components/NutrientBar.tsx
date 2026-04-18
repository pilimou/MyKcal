'use client';

import { useEffect, useState } from 'react';

interface NutrientBarProps {
  protein: number;
  carbs: number;
  fat: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
}

function Bar({ label, value, color, targetValue, delay }: {
  label: string;
  value: number;
  color: string;
  targetValue: number;
  delay: number;
}) {
  const [animatedWidth, setAnimatedWidth] = useState(0);
  const percent = targetValue > 0 ? Math.min((value / targetValue) * 100, 100) : 0;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedWidth(percent), 100 + delay);
    return () => clearTimeout(timer);
  }, [percent, delay]);

  return (
    <div className="nutrient-bar-row">
      <div className="nutrient-bar-header">
        <div className="flex items-center gap-2">
          <span className="nutrient-bar-dot" style={{ background: color }} />
          <span className="nutrient-bar-label">{label}</span>
        </div>
        <span className="nutrient-bar-value">
          <span className="font-bold">{value}g</span>
          <span className="text-muted ml-1">/ {targetValue}g</span>
        </span>
      </div>
      <div className="nutrient-bar-track">
        <div
          className="nutrient-bar-fill"
          style={{
            width: `${animatedWidth}%`,
            background: `linear-gradient(90deg, ${color}, ${color}aa)`,
            boxShadow: `0 0 12px ${color}40`,
          }}
        />
      </div>
    </div>
  );
}

export default function NutrientBar({ 
  protein, carbs, fat, 
  targetProtein = 0, targetCarbs = 0, targetFat = 0 
}: NutrientBarProps) {
  return (
    <div className="nutrient-bars" id="nutrient-bars">
      <Bar label="蛋白質" value={protein} color="#60a5fa" targetValue={targetProtein} delay={0} />
      <Bar label="碳水" value={carbs} color="#fbbf24" targetValue={targetCarbs} delay={100} />
      <Bar label="脂肪" value={fat} color="#f87171" targetValue={targetFat} delay={200} />
    </div>
  );
}
