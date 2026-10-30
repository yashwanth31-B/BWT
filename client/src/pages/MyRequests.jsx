import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFood } from '../context/FoodContext';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import {
  ClipboardList,
  KeyRound,
  Building2,
  MapPin,
  Clock,
  Phone,
  Search,
  CheckCircle2,
} from 'lucide-react';

const MyRequests = () => {
  const { user } = useAuth();
  const { requests } = useFood();
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'pending' | 'accepted' | 'completed' | 'rejected'

  // NGO's requests
  const myRequests = requests.filter(
    (r) => r.ngo?._id === user?._id || r.ngo === user?._id || !r.ngo?._id
  );

  const filtered = myRequests.filter((r) => {
    if (filterTab === 'all') return true;
    return r.status === filterTab;
  });

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">My Donation Claims & Requests</h1>
            <p className="dashboard-subtitle">
              Track the approval status of requested food and retrieve your secure 4-digit pickup codes.
            </p>
          </div>
          <Link to="/available-food" className="btn btn-primary">
            <Search size={18} /> Browse More Food
          </Link>
        </div>

        {/* Tab Filters */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border)',
          marginBottom: '1.75rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem',
        }}>
          {['all', 'pending', 'accepted', 'completed', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              style={{
                padding: '0.6rem 1rem',
                fontWeight: 700,
                fontSize: '0.9rem',
                textTransform: 'capitalize',
                background: 'none',
                border: 'none',
                borderBottom: filterTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                color: filterTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab === 'all' ? `All Requests (${myRequests.length})` : `${tab} (${myRequests.filter((r) => r.status === tab).length})`}
            </button>
          ))}
        </div>

        {/* List of Requests */}
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ClipboardList size={40} color="var(--text-light)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
              No requests under "{filterTab}" status
            </h3>
            <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Check other tabs or browse available food to submit a new claim.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filtered.map((req) => (
              <div key={req._id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  borderBottom: '1px solid var(--border-light)',
                  paddingBottom: '1rem',
                  marginBottom: '1rem',
                }}>
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span className="badge badge-veg">● {req.listing?.dietaryType || 'Veg'}</span>
                      <StatusBadge status={req.status} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {req.listing?.title || 'Buffet Surplus'}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--primary-hover)', fontWeight: 700, marginTop: '0.2rem' }}>
                      Quantity: {req.listing?.quantity?.value} {req.listing?.quantity?.unit || 'servings'}
                    </p>
                  </div>

                  {/* 4-Digit Pickup Code Callout (if accepted) */}
                  {req.status === 'accepted' && req.pickupOtp && (
                    <div style={{
                      backgroundColor: '#ecfdf5',
                      border: '2px dashed #059669',
                      padding: '0.75rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Pickup Verification Code
                      </div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#065f46', letterSpacing: '0.25rem', margin: '0.2rem 0' }}>
                        {req.pickupOtp}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#047857' }}>
                        Present to Donor at handover
                      </div>
                    </div>
                  )}

                  {req.status === 'completed' && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'var(--primary)',
                      backgroundColor: 'var(--primary-light)',
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                    }}>
                      <CheckCircle2 size={18} /> Pickup Completed
                    </div>
                  )}
                </div>

                {/* Info row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building2 size={16} />
                    <span>Donor: <strong style={{ color: 'var(--text-main)' }}>{req.donor?.organizationName || 'Grand Palace Hotel'}</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={16} />
                    <span>Contact: {req.donor?.phone || '+91 9811122233'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} />
                    <span>Location: {req.listing?.pickupAddress?.city || 'Bangalore'} {req.listing?.pickupAddress?.street ? `(${req.listing.pickupAddress.street})` : ''}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} />
                    <span>Requested: {new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {req.notes && (
                  <div style={{
                    marginTop: '1rem',
                    backgroundColor: 'var(--bg-subtle)',
                    padding: '0.6rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                  }}>
                    <strong>My Claim Note:</strong> {req.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyRequests;
