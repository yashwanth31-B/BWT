import React from 'react';

const StatusBadge = ({ status }) => {
  const normalized = (status || 'available').toLowerCase();

  const labels = {
    available: 'Available',
    reserved: 'Reserved',
    pending: 'Pending Approval',
    accepted: 'Accepted / Ready',
    completed: 'Completed',
    rejected: 'Declined',
    cancelled: 'Cancelled',
  };

  return (
    <span className={`badge badge-${normalized}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor', display: 'inline-block' }}></span>
      {labels[normalized] || status}
    </span>
  );
};

export default StatusBadge;
