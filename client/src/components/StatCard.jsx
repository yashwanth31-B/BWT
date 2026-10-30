import React from 'react';

const StatCard = ({ label, value, icon: Icon, color = 'var(--primary)', trend }) => {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <p className="stat-label">{label}</p>
        <h3 className="stat-value">{value}</h3>
        {trend && (
          <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
            {trend}
          </span>
        )}
      </div>
      <div className="stat-icon" style={{ backgroundColor: `${color}15`, color }}>
        {Icon && <Icon size={24} />}
      </div>
    </div>
  );
};

export default StatCard;
