import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  Search,
  ClipboardList,
  ShieldAlert,
  Users,
  Building2,
} from 'lucide-react';

const Sidebar = () => {
  const { user, role } = useAuth();

  return (
    <aside className="dashboard-sidebar">
      {/* Profile snippet */}
      <div style={{
        padding: '0.85rem',
        backgroundColor: 'var(--bg-subtle)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Building2 size={16} color="var(--primary)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.organizationName || 'User Organization'}
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Signed in as <strong style={{ color: 'var(--primary)', textTransform: 'capitalize' }}>{role}</strong>
        </div>
      </div>

      <div className="sidebar-heading">Navigation</div>

      {role === 'donor' && (
        <>
          <NavLink
            to="/donor"
            end
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </NavLink>

          <NavLink
            to="/add-listing"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            <PlusCircle size={18} />
            <span>Donate Surplus Food</span>
          </NavLink>

          <NavLink
            to="/available-food"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            <Search size={18} />
            <span>Browse Public Feed</span>
          </NavLink>
        </>
      )}

      {role === 'ngo' && (
        <>
          <NavLink
            to="/ngo"
            end
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>NGO Overview</span>
          </NavLink>

          <NavLink
            to="/available-food"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            <Search size={18} />
            <span>Find Available Food</span>
          </NavLink>

          <NavLink
            to="/my-requests"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            <ClipboardList size={18} />
            <span>My Requests & Codes</span>
          </NavLink>
        </>
      )}

      {role === 'admin' && (
        <>
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Admin Analytics</span>
          </NavLink>

          <NavLink
            to="/available-food"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            <Search size={18} />
            <span>All Food Listings</span>
          </NavLink>
        </>
      )}
    </aside>
  );
};

export default Sidebar;
