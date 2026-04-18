'use client';

import { useEffect, useState } from 'react';

interface CalorieRingProps {
  current: number;
  target?: number;
  size?: number;
  strokeWidth?: number;
}

export default function CalorieRing({
  current,
  target = 2000,
  size = 180,
  strokeWidth = 12,
}: CalorieRingProps) {
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const percent = Math.min((current / target) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedPercent / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPercent(percent), 100);
    return () => clearTimeout(timer);
  }, [percent]);

  // Color shifts: green → yellow → red
  const getColor = (pct: number) => {
    if (pct <= 60) return '#10b981';
    if (pct <= 85) return '#f59e0b';
    return '#ef4444';
  };

  const color = getColor(percent);

  return (
    <div className="calorie-ring" id="calorie-ring">
      <svg width={size} height={size} className="calorie-ring-svg">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="calorie-ring-progress"
          style={{
            filter: `drop-shadow(0 0 8px ${color}60)`,
          }}
        />
      </svg>
      <div className="calorie-ring-text">
        <span className="calorie-ring-value">{current.toLocaleString()}</span>
        <span className="calorie-ring-unit">kcal</span>
        <span className="calorie-ring-target">/ {target.toLocaleString()}</span>
      </div>
    </div>
  );
}
