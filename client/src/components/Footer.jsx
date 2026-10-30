import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, ShieldCheck, Sparkles, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#ffffff',
      borderTop: '1px solid var(--border)',
      paddingTop: '3.5rem',
      paddingBottom: '2rem',
      marginTop: 'auto',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem',
        }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: '8px',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <HeartHandshake size={20} />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Aahar<span style={{ color: 'var(--primary)' }}>Share</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              A student hackathon prototype bridging the gap between food abundance and hunger. Connecting restaurants and caterers directly with charitable NGOs.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
              Quick Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <li><Link to="/" style={{ color: 'inherit' }}>Home & Mission</Link></li>
              <li><Link to="/available-food" style={{ color: 'inherit' }}>Find Available Food</Link></li>
              <li><Link to="/add-listing" style={{ color: 'inherit' }}>Donate Food</Link></li>
              <li><Link to="/register" style={{ color: 'inherit' }}>Join as an NGO or Donor</Link></li>
            </ul>
          </div>

          {/* Key Workflow */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
              Trust & Verification
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="var(--primary)" />
                <span>Verified NGO Network</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} color="var(--primary)" />
                <span>4-Digit Secure Handover Verification</span>
              </div>
            </div>
          </div>
        </div>

        {/* Food Safety Notice */}
        <div style={{
          backgroundColor: 'var(--bg-main)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.25rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          marginBottom: '1.5rem',
        }}>
          <strong>Responsible Food Safety Notice:</strong> Surplus food listings and use-by timings are provided directly by participating food donors. AaharShare is a coordination platform and does not independently certify or inspect food safety. Recipient NGOs must inspect all food before accepting handover and discard any items showing signs of deterioration.
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
        }}>
          <div>
            © {new Date().getFullYear()} AaharShare Platform — Built for Student Hackathon.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Reducing Food Wastage with <Heart size={14} color="#ef4444" fill="#ef4444" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
