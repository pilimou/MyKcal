interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}

export default function StatCard({ icon, label, value, sub, accent = '#10b981' }: StatCardProps) {
  return (
    <div className="stat-card" id={`stat-${label}`}>
      <div className="stat-card-icon" style={{ color: accent, background: `${accent}15` }}>
        {icon}
      </div>
      <div className="stat-card-content">
        <div className="stat-card-main">
          <span className="stat-card-value">{value}</span>
          <span className="stat-card-label">{label}</span>
        </div>
        {sub && <span className="stat-card-sub">{sub}</span>}
      </div>
    </div>
  );
}
