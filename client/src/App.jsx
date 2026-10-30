import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AvailableFood from './pages/AvailableFood';
import DonationDetails from './pages/DonationDetails';
import DonorDashboard from './pages/DonorDashboard';
import AddListing from './pages/AddListing';
import NgoDashboard from './pages/NgoDashboard';
import MyRequests from './pages/MyRequests';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/available-food" element={<AvailableFood />} />
          <Route path="/listings/:id" element={<DonationDetails />} />

          {/* Donor Routes */}
          <Route
            path="/donor"
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <DonorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-listing"
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <AddListing />
              </ProtectedRoute>
            }
          />

          {/* NGO Routes */}
          <Route
            path="/ngo"
            element={
              <ProtectedRoute allowedRoles={['ngo']}>
                <NgoDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-requests"
            element={
              <ProtectedRoute allowedRoles={['ngo']}>
                <MyRequests />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 Fallback */}
          <Route
            path="*"
            element={
              <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>404 - Page Not Found</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  The requested page does not exist.
                </p>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
