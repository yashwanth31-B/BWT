import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartHandshake, UserPlus, UtensilsCrossed, Building2 } from 'lucide-react';

const Register = () => {
  const [role, setRole] = useState('donor');
  const [formData, setFormData] = useState({
    name: '',
    organizationName: '',
    email: '',
    password: '',
    phone: '',
    city: 'Bangalore',
    street: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.organizationName || !formData.email || !formData.password || !formData.phone) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await register({ ...formData, role });
      if (res.user?.role === 'donor') navigate('/donor');
      else if (res.user?.role === 'ngo') navigate('/ngo');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1rem',
      backgroundColor: 'var(--bg-main)',
    }}>
      <div style={{
        maxWidth: '560px',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
        padding: '2.5rem',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem',
          }}>
            <HeartHandshake size={28} />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Join AaharShare
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Choose your organization type and get started
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          backgroundColor: 'var(--bg-subtle)',
          padding: '0.35rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.75rem',
        }}>
          <button
            type="button"
            onClick={() => setRole('donor')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.875rem',
              transition: 'all 0.15s ease',
              backgroundColor: role === 'donor' ? '#ffffff' : 'transparent',
              color: role === 'donor' ? 'var(--primary-hover)' : 'var(--text-muted)',
              boxShadow: role === 'donor' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <UtensilsCrossed size={18} />
            <span>Food Donor</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('ngo')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.875rem',
              transition: 'all 0.15s ease',
              backgroundColor: role === 'ngo' ? '#ffffff' : 'transparent',
              color: role === 'ngo' ? 'var(--primary-hover)' : 'var(--text-muted)',
              boxShadow: role === 'ngo' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <Building2 size={18} />
            <span>NGO / Charity</span>
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                {role === 'donor' ? 'Business / Restaurant Name' : 'NGO / Foundation Name'}
              </label>
              <input
                type="text"
                name="organizationName"
                required
                className="form-control"
                placeholder={role === 'donor' ? 'e.g. Grand Palace Hotel' : 'e.g. Helping Hands Foundation'}
                value={formData.organizationName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Representative Name</label>
              <input
                type="text"
                name="name"
                required
                className="form-control"
                placeholder="e.g. Chef Rajesh Sharma"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Official Email</label>
              <input
                type="email"
                name="email"
                required
                className="form-control"
                placeholder="e.g. contact@domain.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                required
                className="form-control"
                placeholder="e.g. +91 9876543210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password (min 6 characters)</label>
              <input
                type="password"
                name="password"
                required
                minLength="6"
                className="form-control"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Operating City</label>
              <input
                type="text"
                name="city"
                required
                className="form-control"
                placeholder="e.g. Bangalore"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
          >
            <UserPlus size={18} /> {loading ? 'Registering...' : `Register as ${role === 'donor' ? 'Food Donor' : 'NGO Partner'}`}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
