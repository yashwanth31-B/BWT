import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFood } from '../context/FoodContext';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import OtpModal from '../components/OtpModal';
import {
  PlusCircle,
  Utensils,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldCheck,
  Check,
  X,
  Phone,
} from 'lucide-react';

const DonorDashboard = () => {
  const { user } = useAuth();
  const {
    listings,
    donorListings: backendDonorListings,
    requests,
    acceptRequest,
    rejectRequest,
    verifyPickupOtp,
    actionLoading,
    loadingRequests,
  } = useFood();

  const [selectedReqForOtp, setSelectedReqForOtp] = useState(null);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'listings'
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Source of truth: backend donorListings
  const donorListings = backendDonorListings.length > 0
    ? backendDonorListings
    : listings.filter((l) => l.donor?._id === user?._id || l.donor === user?._id);

  const donorRequests = requests.filter(
    (r) => r.donor?._id === user?._id || r.donor === user?._id || !r.donor?._id
  );

  // Compute metrics
  const totalDonations = donorListings.length;
  const activeListingsCount = donorListings.filter((l) => l.status === 'available').length;
  const pendingRequestsCount = donorRequests.filter((r) => r.status === 'pending').length;
  const completedDonationsCount = donorRequests.filter((r) => r.status === 'completed').length;

  const handleAccept = async (reqId) => {
    try {
      setFeedbackMsg('');
      setErrorMsg('');
      await acceptRequest(reqId);
      setFeedbackMsg('Request accepted! The listing is now reserved and the NGO has been issued their pickup code.');
      setTimeout(() => setFeedbackMsg(''), 6000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to accept request');
    }
  };

  const handleReject = async (reqId) => {
    try {
      setFeedbackMsg('');
      setErrorMsg('');
      await rejectRequest(reqId);
      setFeedbackMsg('Request has been declined.');
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reject request');
    }
  };

  const handleVerifyOtp = async (otp) => {
    if (selectedReqForOtp) {
      await verifyPickupOtp(selectedReqForOtp._id, otp);
      setFeedbackMsg('🎉 Pickup verified successfully! Food donation marked as completed.');
      setTimeout(() => setFeedbackMsg(''), 6000);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        {/* Top Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Donor Dashboard</h1>
            <p className="dashboard-subtitle">
              Welcome, <strong>{user?.organizationName}</strong>. Manage your surplus food and incoming claims.
            </p>
          </div>
          <Link to="/add-listing" className="btn btn-primary">
            <PlusCircle size={18} /> Donate Food
          </Link>
        </div>

        {/* 4 Stats Cards */}
        <div className="stats-grid">
          <StatCard
            label="Total Donations Posted"
            value={totalDonations}
            icon={Utensils}
            color="#16a34a"
          />
          <StatCard
            label="Active Listings"
            value={activeListingsCount}
            icon={AlertCircle}
            color="#2563eb"
          />
          <StatCard
            label="Pending NGO Claims"
            value={pendingRequestsCount}
            icon={Clock}
            color="#d97706"
          />
          <StatCard
            label="Completed Pickups"
            value={completedDonationsCount}
            icon={CheckCircle2}
            color="#059669"
          />
        </div>

        {feedbackMsg && (
          <div style={{
            backgroundColor: '#dcfce7',
            border: '1px solid #86efac',
            color: '#15803d',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontWeight: 600,
          }}>
            {feedbackMsg}
          </div>
        )}

        {errorMsg && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontWeight: 600,
          }}>
            {errorMsg}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid var(--border)',
          marginBottom: '1.5rem',
        }}>
          <button
            onClick={() => setActiveTab('requests')}
            style={{
              padding: '0.75rem 0.5rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'requests' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'requests' ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            Incoming NGO Claims
            {pendingRequestsCount > 0 && (
              <span className="badge badge-pending">{pendingRequestsCount}</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('listings')}
            style={{
              padding: '0.75rem 0.5rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'listings' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'listings' ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            My Food Listings ({donorListings.length})
          </button>
        </div>

        {/* Tab Content 1: Incoming NGO Requests */}
        {activeTab === 'requests' && (
          <div className="table-container">
            {donorRequests.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>No donation requests yet.</p>
                <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  When an NGO requests your posted food, it will appear here for your approval.
                </p>
              </div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Food Item</th>
                    <th>NGO / Charity</th>
                    <th>Arrival ETA</th>
                    <th>Notes</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {donorRequests.map((req) => (
                    <tr key={req._id}>
                      <td style={{ fontWeight: 700 }}>
                        {req.listing?.title || 'Buffet Surplus'}
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                          {req.listing?.quantity?.value} {req.listing?.quantity?.unit || 'servings'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{req.ngo?.organizationName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Rep: {req.ngo?.name} • {req.ngo?.phone}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.875rem' }}>
                        {req.pickupEta ? new Date(req.pickupEta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Within 45 mins'}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '200px' }}>
                        {req.notes || 'No special notes'}
                      </td>
                      <td>
                        <StatusBadge status={req.status} />
                      </td>
                      <td>
                        {req.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleAccept(req._id)}
                              className="btn btn-primary btn-sm"
                              title="Accept claim and generate pickup code"
                            >
                              <Check size={16} /> Accept
                            </button>
                            <button
                              onClick={() => handleReject(req._id)}
                              className="btn btn-secondary btn-sm"
                              title="Decline claim"
                            >
                              <X size={16} /> Reject
                            </button>
                          </div>
                        )}

                        {req.status === 'accepted' && (
                          <button
                            onClick={() => setSelectedReqForOtp(req)}
                            className="btn btn-primary btn-sm"
                            style={{ backgroundColor: '#0f766e', borderColor: '#0f766e' }}
                          >
                            <ShieldCheck size={16} /> Verify Handover OTP
                          </button>
                        )}

                        {req.status === 'completed' && (
                          <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle2 size={16} /> Pickup Verified
                          </span>
                        )}

                        {req.status === 'rejected' && (
                          <span style={{ fontSize: '0.85rem', color: '#b91c1c' }}>Declined</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab Content 2: My Posted Listings */}
        {activeTab === 'listings' && (
          <div className="table-container">
            {donorListings.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>You haven't posted any food listings yet.</p>
                <Link to="/add-listing" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                  Post Your First Food Donation
                </Link>
              </div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Title & Category</th>
                    <th>Dietary</th>
                    <th>Quantity</th>
                    <th>Best Before</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {donorListings.map((listing) => (
                    <tr key={listing._id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{listing.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{listing.foodType}</div>
                      </td>
                      <td>
                        <span className="badge badge-veg">● {listing.dietaryType}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {listing.quantity?.value} {listing.quantity?.unit}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {new Date(listing.bestBefore).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td>
                        <StatusBadge status={listing.status} />
                      </td>
                      <td>
                        <Link to={`/listings/${listing._id}`} className="btn btn-secondary btn-sm">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* OTP Handover Verification Modal */}
        <OtpModal
          isOpen={!!selectedReqForOtp}
          onClose={() => setSelectedReqForOtp(null)}
          onVerify={handleVerifyOtp}
          requestTitle={selectedReqForOtp?.listing?.title}
        />
      </main>
    </div>
  );
};

export default DonorDashboard;
