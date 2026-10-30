import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartHandshake, LogOut, LayoutDashboard, PlusCircle, Sparkles, User, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, role, isAuthenticated, isLiveApi, logout, quickDemoLogin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleQuickSwitch = async (targetRole) => {
    setSwitching(true);
    try {
      await quickDemoLogin(targetRole);
      if (targetRole === 'donor') navigate('/donor');
      else if (targetRole === 'ngo') navigate('/ngo');
      else if (targetRole === 'admin') navigate('/admin');
    } catch (err) {
      console.error('Quick switch error:', err);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)',
          }}>
            <HeartHandshake size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Aahar<span style={{ color: 'var(--primary)' }}>Share</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: -3 }}>
              Food Donation Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="desktop-nav">
          <Link to="/" style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.925rem' }}>
            Home
          </Link>
          <Link to="/available-food" style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.925rem' }}>
            Available Food
          </Link>

          {isAuthenticated && (
            <>
              {role === 'donor' && (
                <>
                  <Link to="/donor" style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.925rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link to="/add-listing" className="btn btn-primary btn-sm">
                    <PlusCircle size={16} /> Donate Food
                  </Link>
                </>
              )}

              {role === 'ngo' && (
                <>
                  <Link to="/ngo" style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.925rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <LayoutDashboard size={16} /> NGO Dashboard
                  </Link>
                  <Link to="/my-requests" style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.925rem' }}>
                    My Requests
                  </Link>
                </>
              )}

              {role === 'admin' && (
                <Link to="/admin" style={{ fontWeight: 600, color: '#7e22ce', fontSize: '0.925rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <LayoutDashboard size={16} /> Admin Panel
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Right CTA / User State */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Live API Status Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.6rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.725rem',
            fontWeight: 700,
            backgroundColor: isLiveApi ? '#dcfce7' : '#fee2e2',
            color: isLiveApi ? '#15803d' : '#b91c1c',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
            {isLiveApi ? 'API Online' : 'Offline'}
          </div>

          {/* Hackathon Demo Role Quick-Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'var(--bg-subtle)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', padding: '0 0.4rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Sparkles size={12} color="var(--primary)" /> Demo:
            </span>
            <button
              onClick={() => handleQuickSwitch('donor')}
              className={`btn btn-sm ${role === 'donor' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            >
              Donor
            </button>
            <button
              onClick={() => handleQuickSwitch('ngo')}
              className={`btn btn-sm ${role === 'ngo' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            >
              NGO
            </button>
            <button
              onClick={() => handleQuickSwitch('admin')}
              className={`btn btn-sm ${role === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            >
              Admin
            </button>
          </div>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ textAlign: 'right', display: 'none' }} className="user-info-text">
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {user.name.split(' ')[0]}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'capitalize' }}>
                  {role}
                </div>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Sign Out">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
