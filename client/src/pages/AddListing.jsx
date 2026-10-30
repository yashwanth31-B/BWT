import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFood } from '../context/FoodContext';
import Sidebar from '../components/Sidebar';
import { PlusCircle, Clock, MapPin, AlertCircle, Utensils, CheckCircle2 } from 'lucide-react';

const AddListing = () => {
  const { user } = useAuth();
  const { addListing } = useFood();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    foodType: 'Cooked Meals',
    dietaryType: 'Veg',
    quantityValue: '',
    quantityUnit: 'servings',
    preparedTime: new Date().toISOString().slice(0, 16),
    expiryHours: '4', // preset helper for student demo
    pickupStreet: user?.address?.street || '',
    pickupCity: user?.address?.city || 'Bangalore',
    pickupPhone: user?.phone || '',
    specialNotes: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.quantityValue || !formData.pickupPhone) {
      setError('Please provide food title, quantity, and contact phone.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Calculate bestBefore timestamp from preparedTime + expiryHours
      const bestBeforeDate = new Date(
        Date.now() + Number(formData.expiryHours) * 60 * 60 * 1000
      ).toISOString();

      await addListing({
        ...formData,
        bestBefore: bestBeforeDate,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/donor');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to publish food listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h1 className="dashboard-title">Donate Surplus Food</h1>
              <p className="dashboard-subtitle">
                List unconsumed surplus meals or grocery stock so verified NGOs can pick it up promptly.
              </p>
            </div>
          </div>

          {success && (
            <div style={{
              backgroundColor: '#dcfce7',
              border: '1px solid #86efac',
              color: '#15803d',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
              fontWeight: 600,
            }}>
              <CheckCircle2 size={20} />
              Food listing successfully published! Redirecting to dashboard...
            </div>
          )}

          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
            }}>
              {error}
            </div>
          )}

          <div className="card">
            <form onSubmit={handleSubmit}>
              {/* Section 1: Food Details */}
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                1. Food Item Information
              </h3>

              <div className="form-group">
                <label className="form-label">Food Title / Menu Item *</label>
                <input
                  type="text"
                  name="title"
                  required
                  className="form-control"
                  placeholder="e.g. Vegetarian Buffet Surplus (Rice, Paneer Masala, Dal Makhani)"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Food Category *</label>
                  <select
                    name="foodType"
                    className="form-control"
                    value={formData.foodType}
                    onChange={handleChange}
                  >
                    <option value="Cooked Meals">Cooked Meals</option>
                    <option value="Raw Groceries">Raw Groceries</option>
                    <option value="Packaged Food">Packaged Food</option>
                    <option value="Bakery / Desserts">Bakery / Desserts</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Dietary Type *</label>
                  <select
                    name="dietaryType"
                    className="form-control"
                    value={formData.dietaryType}
                    onChange={handleChange}
                  >
                    <option value="Veg">Vegetarian (Veg)</option>
                    <option value="Non-Veg">Non-Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Egg">Contains Egg</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Quantity Amount *</label>
                  <input
                    type="number"
                    name="quantityValue"
                    required
                    min="1"
                    className="form-control"
                    placeholder="e.g. 50"
                    value={formData.quantityValue}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity Unit</label>
                  <select
                    name="quantityUnit"
                    className="form-control"
                    value={formData.quantityUnit}
                    onChange={handleChange}
                  >
                    <option value="servings">Servings (Meals)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="packets">Packets / Boxes</option>
                    <option value="boxes">Crates</option>
                  </select>
                </div>
              </div>

              {/* Section 2: Preparation & Expiry Guidance */}
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '1.5rem 0 1rem 0', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                2. Preparation Time & Expiry Window
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Prepared / Cooked Time</label>
                  <input
                    type="datetime-local"
                    name="preparedTime"
                    className="form-control"
                    value={formData.preparedTime}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Safe Use-By / Expiry Window *</label>
                  <select
                    name="expiryHours"
                    className="form-control"
                    value={formData.expiryHours}
                    onChange={handleChange}
                  >
                    <option value="2">Within 2 Hours (Urgent Hot Food)</option>
                    <option value="4">Within 4 Hours (Standard Buffet)</option>
                    <option value="8">Within 8 Hours (Same-Day Evening)</option>
                    <option value="24">Within 24 Hours (Bakery / Produce)</option>
                    <option value="48">Within 48 Hours (Raw / Dry Stock)</option>
                  </select>
                </div>
              </div>

              {/* Section 3: Pickup Location */}
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '1.5rem 0 1rem 0', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                3. Pickup Location & Instructions
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    name="pickupCity"
                    required
                    className="form-control"
                    value={formData.pickupCity}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone for Pickup *</label>
                  <input
                    type="tel"
                    name="pickupPhone"
                    required
                    className="form-control"
                    placeholder="e.g. +91 9811122233"
                    value={formData.pickupPhone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Street Address & Landmark</label>
                <input
                  type="text"
                  name="pickupStreet"
                  className="form-control"
                  placeholder="e.g. 45 MG Road, Near Metro Pillar 12"
                  value={formData.pickupStreet}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Special Notes / Packaging Requirements</label>
                <textarea
                  name="specialNotes"
                  rows="3"
                  className="form-control"
                  placeholder="e.g. Kept in warmers. Please bring clean stainless steel containers and transport boxes."
                  value={formData.specialNotes}
                  onChange={handleChange}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg"
                  style={{ flex: 1 }}
                >
                  <PlusCircle size={20} /> {loading ? 'Publishing Food...' : 'Publish Food Donation'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/donor')}
                  className="btn btn-secondary btn-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddListing;
