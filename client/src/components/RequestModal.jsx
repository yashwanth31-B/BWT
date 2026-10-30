import React, { useState } from 'react';
import { Send, X, Clock, FileText } from 'lucide-react';

const RequestModal = ({ isOpen, onClose, onSubmit, listing }) => {
  const [pickupEta, setPickupEta] = useState('30 minutes');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !listing) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await onSubmit({
        listingId: listing._id,
        pickupEta: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
        notes: notes || `Pickup planned within ${pickupEta}`,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit request');
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

        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Request Food Donation</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Claiming: <strong style={{ color: 'var(--text-main)' }}>{listing.title}</strong>
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--primary-hover)', fontWeight: 600, marginTop: '0.25rem' }}>
            Quantity: {listing.quantity?.value} {listing.quantity?.unit || 'servings'} • {listing.pickupAddress?.city}
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={16} /> Estimated Arrival Time (ETA)
            </label>
            <select
              className="form-control"
              value={pickupEta}
              onChange={(e) => setPickupEta(e.target.value)}
            >
              <option value="15-30 minutes">15 - 30 minutes</option>
              <option value="30-45 minutes">30 - 45 minutes</option>
              <option value="1 hour">Within 1 hour</option>
              <option value="2 hours">Within 2 hours</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={16} /> Notes for Donor
            </label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="e.g., Volunteer arriving in white Maruti van with insulated containers."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              <Send size={16} /> {loading ? 'Submitting...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestModal;
