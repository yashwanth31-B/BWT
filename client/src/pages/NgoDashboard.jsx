import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFood } from '../context/FoodContext';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import {
  Utensils,
  Clock,
  CheckCircle2,
  Search,
  KeyRound,
  Building2,
  Calendar,
  AlertCircle,
} from 'lucide-react';

const NgoDashboard = () => {
  const { user } = useAuth();
  const { listings, requests } = useFood();
  const navigate = useNavigate();

  // NGO's requests
  const myRequests = requests.filter(
    (r) => r.ngo?._id === user?._id || r.ngo === user?._id || !r.ngo?._id
  );

  const availableFoodCount = listings.filter((l) => l.status === 'available').length;
  const myRequestsCount = myRequests.length;
  const acceptedCount = myRequests.filter((r) => r.status === 'accepted').length;
  const completedCount = myRequests.filter((r) => r.status === 'completed').length;

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">NGO Dashboard</h1>
            <p className="dashboard-subtitle">
              Welcome, <strong>{user?.organizationName}</strong>. Discover and claim available food for distribution.
            </p>
          </div>
          <Link to="/available-food" className="btn btn-primary">
            <Search size={18} /> Find Available Food
          </Link>
        </div>

        {/* 4 Stat Cards */}
        <div className="stats-grid">
          <StatCard
            label="Available Food Listings"
            value={availableFoodCount}
            icon={Utensils}
            color="#16a34a"
          />
          <StatCard
            label="My Total Claims"
            value={myRequestsCount}
            icon={Clock}
            color="#2563eb"
          />
          <StatCard
            label="Ready for Pickup"
            value={acceptedCount}
            icon={KeyRound}
            color="#059669"
            trend={acceptedCount > 0 ? `${acceptedCount} OTP ready` : undefined}
          />
          <StatCard
            label="Completed Pickups"
            value={completedCount}
            icon={CheckCircle2}
            color="#7e22ce"
          />
        </div>

        {/* Urgent Pickup Notice if any accepted requests */}
        {acceptedCount > 0 && (
          <div style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#10b981', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <KeyRound size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#065f46' }}>
                  You have {acceptedCount} accepted donation(s) ready for pickup!
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#047857' }}>
                  Please view your pickup codes and dispatch volunteers to collect the food before expiry.
                </p>
              </div>
            </div>
            <Link to="/my-requests" className="btn btn-primary btn-sm">
              View Pickup Codes
            </Link>
          </div>
        )}

        {/* Active Claims Table */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Recent Claims & Pickup Status
          </h2>
          <Link to="/my-requests" style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700 }}>
            View Full Request History →
          </Link>
        </div>

        <div className="table-container">
          {myRequests.length === 0 ? (
            <div style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Utensils size={40} color="var(--text-light)" style={{ margin: '0 auto 1rem auto' }} />
              <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                No active food requests yet
              </p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Browse the food feed to claim surplus meals for your shelter or community kitchen.
              </p>
              <Link to="/available-food" className="btn btn-primary btn-sm" style={{ marginTop: '1.25rem' }}>
                Find Food to Claim
              </Link>
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Food Listing</th>
                  <th>Food Donor / Provider</th>
                  <th>Pickup Location</th>
                  <th>Status</th>
                  <th>Pickup Code (OTP)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {myRequests.slice(0, 5).map((req) => (
                  <tr key={req._id}>
                    <td style={{ fontWeight: 700 }}>
                      {req.listing?.title || 'Lunch Buffet Surplus'}
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {req.listing?.quantity?.value} {req.listing?.quantity?.unit || 'servings'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{req.donor?.organizationName || 'Grand Palace Hotel'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Contact: {req.donor?.phone || '+91 9811122233'}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {req.listing?.pickupAddress?.city || 'Bangalore'}
                    </td>
                    <td>
                      <StatusBadge status={req.status} />
                    </td>
                    <td>
                      {req.status === 'accepted' && req.pickupOtp ? (
                        <div style={{
                          display: 'inline-block',
                          backgroundColor: '#ecfdf5',
                          border: '2px dashed #059669',
                          color: '#065f46',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '1rem',
                          fontWeight: 800,
                          letterSpacing: '0.15em',
                        }}>
                          {req.pickupOtp}
                        </div>
                      ) : req.status === 'completed' ? (
                        <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                          Handover Verified
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                          Available upon acceptance
                        </span>
                      )}
                    </td>
                    <td>
                      <Link to={`/listings/${req.listing?._id || req.listing}`} className="btn btn-secondary btn-sm">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default NgoDashboard;
