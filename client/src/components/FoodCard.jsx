import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Building2, CheckCircle2, Utensils } from 'lucide-react';
import StatusBadge from './StatusBadge';

const FoodCard = ({ listing, onRequest }) => {
  const isAvailable = listing.status === 'available';

  // Calculate relative expiration string
  const formatExpiry = (isoDate) => {
    try {
      const diffMs = new Date(isoDate) - new Date();
      const diffHours = Math.round(diffMs / (1000 * 60 * 60));
      if (diffHours < 0) return 'Expired';
      if (diffHours <= 1) return 'Expires within 1 hour';
      if (diffHours < 24) return `Expires in ~${diffHours} hrs`;
      return `Expires in ${Math.round(diffHours / 24)} days`;
    } catch {
      return 'Expiring soon';
    }
  };

  const getDietaryBadgeClass = (type) => {
    if (type === 'Veg') return 'badge-veg';
    if (type === 'Non-Veg') return 'badge-nonveg';
    return 'badge-vegan';
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Top Meta row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span className={`badge ${getDietaryBadgeClass(listing.dietaryType)}`}>
          ● {listing.dietaryType} • {listing.foodType}
        </span>
        <StatusBadge status={listing.status} />
      </div>

      {/* Title */}
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
        {listing.title}
      </h3>

      {/* Quantity Banner */}
      <div style={{
        backgroundColor: 'var(--bg-subtle)',
        padding: '0.6rem 0.9rem',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
        fontSize: '0.925rem',
        fontWeight: 700,
        color: 'var(--primary-hover)',
      }}>
        <Utensils size={18} color="var(--primary)" />
        <span>Quantity: {listing.quantity?.value} {listing.quantity?.unit || 'servings'}</span>
      </div>

      {/* Details List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={16} />
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
            {listing.donor?.organizationName || 'Verified Donor'}
          </span>
          {listing.donor?.isVerified && (
            <CheckCircle2 size={15} color="var(--primary)" title="Verified Provider" />
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={16} />
          <span>{listing.pickupAddress?.city || 'Bangalore'} {listing.pickupAddress?.street ? `• ${listing.pickupAddress.street}` : ''}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309', fontWeight: 500 }}>
          <Clock size={16} />
          <span>{formatExpiry(listing.bestBefore)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: 'auto' }}>
        <Link to={`/listings/${listing._id}`} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
          View Details
        </Link>
        {onRequest && isAvailable ? (
          <button onClick={() => onRequest(listing)} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
            Claim Food
          </button>
        ) : (
          <Link to={`/listings/${listing._id}`} className="btn btn-outline btn-sm" style={{ width: '100%' }}>
            {isAvailable ? 'Check Status' : 'Reserved'}
          </Link>
        )}
      </div>
    </div>
  );
};

export default FoodCard;
