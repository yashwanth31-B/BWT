import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFood } from '../context/FoodContext';
import {
  HeartHandshake,
  UtensilsCrossed,
  ShieldCheck,
  Truck,
  ArrowRight,
  Sparkles,
  Users,
  Award,
  Clock,
} from 'lucide-react';
import FoodCard from '../components/FoodCard';

const Home = () => {
  const { isAuthenticated, role } = useAuth();
  const { listings } = useFood();
  const navigate = useNavigate();

  const activeListings = listings.filter((l) => l.status === 'available').slice(0, 3);

  // Compute live impact stats
  const totalMealsSaved = listings.reduce((acc, curr) => {
    return acc + (curr.quantity?.value || 0);
  }, 1450); // base + dynamically added

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, #ecfdf5 0%, #f8fafc 100%)',
        padding: '5rem 0 4rem 0',
        borderBottom: '1px solid var(--border)',
        textAlign: 'center',
      }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#dcfce7',
            color: '#15803d',
            padding: '0.4rem 1rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            boxShadow: '0 2px 4px rgba(22, 163, 74, 0.1)',
          }}>
            <Sparkles size={16} /> Zero Waste • Zero Hunger
          </div>

          <h1 style={{
            fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            color: 'var(--text-main)',
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem',
          }}>
            Bridge Surplus Food to <br />
            <span style={{ color: 'var(--primary)' }}>Those Who Need It Most</span>
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
            maxWidth: '680px',
            margin: '0 auto 2.5rem auto',
          }}>
            Empowering restaurants, hotels, and caterers to seamlessly donate surplus food directly to verified charitable NGOs in real time.
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}>
            <Link to="/add-listing" className="btn btn-primary btn-lg">
              <UtensilsCrossed size={20} /> Donate Surplus Food
            </Link>
            <Link to="/available-food" className="btn btn-secondary btn-lg">
              <Truck size={20} /> Find Available Food
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Statistics Banner */}
      <section style={{
        backgroundColor: '#ffffff',
        padding: '3rem 0',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            textAlign: 'center',
          }}>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
                {totalMealsSaved.toLocaleString()}+
              </div>
              <div style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Meals Rescued & Distributed
              </div>
            </div>

            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f766e', lineHeight: 1 }}>
                45+
              </div>
              <div style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Hotels & Food Providers
              </div>
            </div>

            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#2563eb', lineHeight: 1 }}>
                28+
              </div>
              <div style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Verified Partner NGOs
              </div>
            </div>

            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#7e22ce', lineHeight: 1 }}>
                100%
              </div>
              <div style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Secure OTP Handovers
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-main)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3.5rem auto' }}>
            <span className="badge badge-available" style={{ marginBottom: '0.5rem' }}>
              Simple 4-Step Flow
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>
              How AaharShare Works
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Designed for student hackathon simplicity, speed, and real-world safety.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.75rem',
          }}>
            {/* Step 1 */}
            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                fontSize: '1.25rem',
                fontWeight: 800,
              }}>
                1
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Donor Posts Food</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Restaurant or banquet logs in and adds surplus food details, quantity, and expiry guidance in under 60 seconds.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                backgroundColor: '#dbeafe',
                color: '#2563eb',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                fontSize: '1.25rem',
                fontWeight: 800,
              }}>
                2
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>NGO Claims Food</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Nearby charity discovers available food, inspects dietary requirements, and sends a pickup request with their ETA.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                backgroundColor: '#fef3c7',
                color: '#b45309',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                fontSize: '1.25rem',
                fontWeight: 800,
              }}>
                3
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Donor Accepts</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Donor accepts request. System locks the listing and issues a secure <strong>4-digit pickup code</strong> to the NGO.
              </p>
            </div>

            {/* Step 4 */}
            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                backgroundColor: '#ccfbf1',
                color: '#0f766e',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                fontSize: '1.25rem',
                fontWeight: 800,
              }}>
                4
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Pickup & Handover</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                NGO rep arrives at the donor venue, presents the code, and donor confirms handover. Donation complete!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Available Food Preview */}
      <section style={{ padding: '4rem 0', backgroundColor: '#ffffff', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '2.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div>
              <span className="badge badge-active">Live Surplus Listings</span>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.4rem' }}>
                Recently Added Available Food
              </h2>
            </div>
            <Link to="/available-food" className="btn btn-secondary">
              View All Listings <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}>
            {activeListings.map((listing) => (
              <FoodCard
                key={listing._id}
                listing={listing}
                onRequest={() => navigate(`/listings/${listing._id}`)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section style={{ padding: '4rem 0', backgroundColor: 'var(--bg-main)' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: '3.5rem 2rem',
            color: '#ffffff',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem' }}>
              Have Surplus Food Today?
            </h2>
            <p style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem auto', opacity: 0.9 }}>
              Every meal saved feeds a hungry child or family. Join as a food donor or registered charity partner in seconds.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-secondary btn-lg" style={{ color: 'var(--primary)' }}>
                Get Started Now
              </Link>
              <Link to="/available-food" className="btn btn-outline btn-lg" style={{ color: '#ffffff', borderColor: '#ffffff' }}>
                Explore Food Feed
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
