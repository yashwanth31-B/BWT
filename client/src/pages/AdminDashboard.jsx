import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFood } from '../context/FoodContext';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import {
  Users,
  Utensils,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShieldX,
  Trash2,
  Building2,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { listings, requests, adminStats, adminUsers, toggleUserVerification } = useFood();
  const [adminTab, setAdminTab] = useState('users'); // 'users' | 'listings'
  const [actionSuccess, setActionSuccess] = useState('');

  const totalUsers = adminStats ? (adminStats.totalDonors + adminStats.totalNgos) : adminUsers.length;
  const totalDonations = adminStats?.totalListings ?? listings.length;
  const activeListings = adminStats?.activeListings ?? listings.filter((l) => l.status === 'available').length;
  const completedDonations = adminStats?.completedListings ?? requests.filter((r) => r.status === 'completed').length;

  const handleToggle = async (userId) => {
    try {
      const updatedUser = await toggleUserVerification(userId);
      setActionSuccess(`Status for ${updatedUser.organizationName} updated.`);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update user');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Platform Administration</h1>
            <p className="dashboard-subtitle">
              Platform-wide moderation, user verification, and food donation analytics.
            </p>
          </div>
          <span className="badge" style={{ backgroundColor: '#f3e8ff', color: '#7e22ce', fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
            Admin Mode Active
          </span>
        </div>

        {/* 4 Stats Cards */}
        <div className="stats-grid">
          <StatCard
            label="Total Registered Users"
            value={totalUsers}
            icon={Users}
            color="#2563eb"
          />
          <StatCard
            label="Total Donations Posted"
            value={totalDonations}
            icon={Utensils}
            color="#16a34a"
          />
          <StatCard
            label="Active Surplus Listings"
            value={activeListings}
            icon={AlertCircle}
            color="#d97706"
          />
          <StatCard
            label="Completed Handover Claims"
            value={completedDonations}
            icon={CheckCircle2}
            color="#059669"
          />
        </div>

        {actionSuccess && (
          <div style={{
            backgroundColor: '#dcfce7',
            border: '1px solid #86efac',
            color: '#15803d',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontWeight: 600,
          }}>
            {actionSuccess}
          </div>
        )}

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid var(--border)',
          marginBottom: '1.5rem',
        }}>
          <button
            onClick={() => setAdminTab('users')}
            style={{
              padding: '0.75rem 0.5rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              background: 'none',
              border: 'none',
              borderBottom: adminTab === 'users' ? '2px solid var(--primary)' : '2px solid transparent',
              color: adminTab === 'users' ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            User Management ({adminUsers.length})
          </button>

          <button
            onClick={() => setAdminTab('listings')}
            style={{
              padding: '0.75rem 0.5rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              background: 'none',
              border: 'none',
              borderBottom: adminTab === 'listings' ? '2px solid var(--primary)' : '2px solid transparent',
              color: adminTab === 'listings' ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            All Food Listings ({listings.length})
          </button>
        </div>

        {/* Tab 1: User Management */}
        {adminTab === 'users' && (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Organization & Representative</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>City</th>
                  <th>Verification Status</th>
                  <th>Moderate</th>
                </tr>
              </thead>
              <tbody>
                {adminUsers.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{u.organizationName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rep: {u.name}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{u.email}</td>
                    <td>
                      <span className="badge" style={{
                        backgroundColor: u.role === 'donor' ? '#e0f2fe' : '#f0fdf4',
                        color: u.role === 'donor' ? '#0369a1' : '#15803d',
                      }}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{u.address?.city || u.city || 'Bangalore'}</td>
                    <td>
                      {u.isVerified ? (
                        <span style={{ color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                          <ShieldCheck size={16} /> Verified
                        </span>
                      ) : (
                        <span style={{ color: '#b45309', fontWeight: 600, fontSize: '0.85rem' }}>
                          Unverified
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggle(u._id)}
                        className={`btn btn-sm ${u.isVerified ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                      >
                        {u.isVerified ? 'Revoke Verification' : 'Verify Organization'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Listing Management */}
        {adminTab === 'listings' && (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Food Title</th>
                  <th>Category</th>
                  <th>Provider / Donor</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Best Before</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => (
                  <tr key={l._id}>
                    <td style={{ fontWeight: 700 }}>{l.title}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                        {l.foodType}
                      </span>
                    </td>
                    <td>{l.donor?.organizationName || 'Grand Palace Hotel'}</td>
                    <td style={{ fontWeight: 600 }}>{l.quantity?.value} {l.quantity?.unit}</td>
                    <td>
                      <StatusBadge status={l.status} />
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {new Date(l.bestBefore).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
