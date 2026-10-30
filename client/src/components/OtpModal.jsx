import React, { useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';

const OtpModal = ({ isOpen, onClose, onVerify, requestTitle }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 4) {
      setError('Please enter a valid 4-digit numeric code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onVerify(otp);
      setOtp('');
      onClose();
    } catch (err) {
      setError(err.message || 'Incorrect verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-light)',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}>
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Verify Food Handover</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Ask the NGO volunteer for their <strong>4-digit pickup code</strong>.
          </p>
          {requestTitle && (
            <p style={{ fontSize: '0.825rem', color: 'var(--primary-hover)', marginTop: '0.5rem', fontWeight: 600 }}>
              Listing: {requestTitle}
            </p>
          )}
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            marginBottom: '1rem',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ textAlign: 'center', display: 'block' }}>
              Enter 4-Digit Code
            </label>
            <input
              type="text"
              maxLength="4"
              autoFocus
              className="form-control"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 5821"
              style={{
                fontSize: '1.75rem',
                letterSpacing: '0.5rem',
                textAlign: 'center',
                fontWeight: 800,
                padding: '0.75rem',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Verifying...' : 'Confirm Pickup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OtpModal;
