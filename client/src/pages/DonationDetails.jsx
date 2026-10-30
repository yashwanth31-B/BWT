import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFood } from '../context/FoodContext';
import StatusBadge from '../components/StatusBadge';
import RequestModal from '../components/RequestModal';
import {
  ArrowLeft,
  Building2,
  Clock,
  MapPin,
  Utensils,
  Phone,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Send,
} from 'lucide-react';

const DonationDetails = () => {
  const { id } = useParams();
  const { listings, getListingById, createRequest } = useFood();
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState(() => listings.find((l) => l._id === id) || null);
  const [loading, setLoading] = useState(!listing);
  const [fetchError, setFetchError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  React.useEffect(() => {
    let isMounted = true;
    const loadDetails = async () => {
      try {
        const found = listings.find((l) => l._id === id);
        if (found) {
          if (isMounted) setListing(found);
        } else {
          setLoading(true);
          const data = await getListingById(id);
          if (isMounted) setListing(data);
        }
      } catch (err) {
        if (isMounted) setFetchError(err.message || 'Failed to load food listing details');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadDetails();
    return () => { isMounted = false; };
  }, [id, listings, getListingById]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading food listing details...</p>
      </div>
    );
  }

  if (fetchError || !listing) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>{fetchError || 'Food listing not found'}</h2>
        <Link to="/available-food" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Listings
        </Link>
      </div>
    );
  }

  const isAvailable = listing.status === 'available';

  const handleRequestSubmit = async (reqData) => {
    await createRequest(reqData);
    setSuccessMsg('Donation claim submitted successfully! Track your request in "My Requests".');
    setTimeout(() => {
      navigate('/my-requests');
    }, 1500);
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem 0', minHeight: 'calc(100vh - 72px)', backgroundColor: 'var(--bg-main)' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Back Link */}
        <Link
          to="/available-food"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
          }}
        >
          <ArrowLeft size={16} /> Back to Available Food
        </Link>

        {successMsg && (
          <div style={{
            backgroundColor: '#dcfce7',
            border: '1px solid #86efac',
            color: '#15803d',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontWeight: 600,
          }}>
            {successMsg}
          </div>
        )}

        <div className="card" style={{ padding: '2rem 2.5rem' }}>
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="badge badge-veg">● {listing.dietaryType}</span>
                <span className="badge" style={{ backgroundColor: '#e2e8f0', color: '#475569' }}>{listing.foodType}</span>
                <StatusBadge status={listing.status} />
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.3 }}>
                {listing.title}
              </h1>
            </div>

            {isAvailable && (
              <button
                onClick={() => {
                  if (!isAuthenticated) navigate('/login');
                  else if (role === 'donor') alert('Please log in as an NGO to claim food.');
                  else setModalOpen(true);
                }}
                className="btn btn-primary btn-lg"
              >
                <Send size={18} /> Request Donation
              </button>
            )}
          </div>

          {/* Quantity Callout Banner */}
          <div style={{
            backgroundColor: 'var(--primary-light)',
            border: '1px solid #bbf7d0',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '2rem',
          }}>
            <Utensils size={24} color="var(--primary)" />
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-hover)' }}>
                Surplus Quantity: {listing.quantity?.value} {listing.quantity?.unit || 'servings'}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#166534' }}>
                Surplus food offered by donor based on stated preparation time and use-by guidance.
              </div>
            </div>
          </div>

          {/* Grid: Food Timings vs Donor Info */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem',
          }}>
            {/* Box 1: Timing & Hygiene */}
            <div style={{
              backgroundColor: 'var(--bg-subtle)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-md)',
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} color="var(--primary)" /> Timing & Freshness
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Prepared at: </span>
                  <strong>{new Date(listing.preparedTime || listing.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Best Before: </span>
                  <strong style={{ color: '#b45309' }}>
                    {new Date(listing.bestBefore).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Listing Created: </span>
                  <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Box 2: Food Donor Details */}
            <div style={{
              backgroundColor: 'var(--bg-subtle)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-md)',
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={18} color="var(--primary)" /> Food Donor Information
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <strong>{listing.donor?.organizationName || 'Grand Palace Hotel'}</strong>
                  {listing.donor?.isVerified && (
                    <ShieldCheck size={16} color="var(--primary)" title="Verified Donor" />
                  )}
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Contact Person: </span>
                  <span>{listing.donor?.name || 'Chef In-Charge'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Phone size={15} color="var(--text-muted)" />
                  <span>{listing.donor?.phone || listing.pickupAddress?.contactPhone || '+91 9811122233'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pickup Address & Special Notes */}
          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '1.5rem',
            marginBottom: '2rem',
          }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="var(--primary)" /> Pickup Location
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              <strong>{listing.pickupAddress?.city || 'Bangalore'}</strong>
              {listing.pickupAddress?.street ? ` — ${listing.pickupAddress.street}` : ''}
            </p>

            {listing.specialNotes && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#fffbeb',
                borderLeft: '4px solid #f59e0b',
                borderRadius: 'var(--radius-sm)',
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400e', marginBottom: '0.25rem' }}>
                  Donor Notes & Handover Instructions:
                </div>
                <p style={{ fontSize: '0.9rem', color: '#78350f' }}>
                  {listing.specialNotes}
                </p>
              </div>
            )}
          </div>

          {/* Food Safety & Inspection Advisory */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '2rem',
          }}>
            <h4 style={{
              fontSize: '0.95rem',
              fontWeight: 800,
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginBottom: '0.5rem',
            }}>
              <AlertTriangle size={18} color="#d97706" /> Food Safety & Inspection Advisory
            </h4>
            <ul style={{
              fontSize: '0.85rem',
              color: '#475569',
              lineHeight: 1.5,
              paddingLeft: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
            }}>
              <li>Food availability, preparation timing, and use-by limits are provided directly by participating donors.</li>
              <li>Receiving NGOs must visually and organoleptically inspect food (packaging seal, odor, and temperature) prior to handover.</li>
              <li>AaharShare operates as a matching platform and does not independently inspect, laboratory test, or certify food safety.</li>
              <li>Any food that appears damaged, spoiled, or unsafe must not be accepted or distributed to beneficiaries.</li>
            </ul>
          </div>

          {/* Footer CTAs */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Link to="/available-food" className="btn btn-secondary">
              Back to Listings
            </Link>
            {isAvailable && (
              <button
                onClick={() => {
                  if (!isAuthenticated) navigate('/login');
                  else if (role === 'donor') alert('Please log in as an NGO to claim food.');
                  else setModalOpen(true);
                }}
                className="btn btn-primary"
              >
                <Send size={18} /> Request Donation Claim
              </button>
            )}
          </div>
        </div>
      </div>

      <RequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleRequestSubmit}
        listing={listing}
      />
    </div>
  );
};

export default DonationDetails;
