import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFood } from '../context/FoodContext';
import FoodCard from '../components/FoodCard';
import RequestModal from '../components/RequestModal';
import { Search, Filter, Utensils, MapPin, Sparkles, AlertCircle } from 'lucide-react';

const AvailableFood = () => {
  const { listings, createRequest, loadingListings, error: listingsError } = useFood();
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDiet, setSelectedDiet] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [statusFilter, setStatusFilter] = useState('available'); // 'available' | 'all'

  const [modalListing, setModalListing] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Extract unique cities
  const cities = useMemo(() => {
    const set = new Set();
    listings.forEach((l) => {
      if (l.pickupAddress?.city) set.add(l.pickupAddress.city);
    });
    return Array.from(set);
  }, [listings]);

  // Filter listings
  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      // Status filter
      if (statusFilter === 'available' && l.status !== 'available') return false;

      // Category filter
      if (selectedCategory !== 'All' && l.foodType !== selectedCategory) return false;

      // Dietary filter
      if (selectedDiet !== 'All' && l.dietaryType !== selectedDiet) return false;

      // City filter
      if (selectedCity !== 'All' && l.pickupAddress?.city !== selectedCity) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = l.title?.toLowerCase().includes(q);
        const donorMatch = l.donor?.organizationName?.toLowerCase().includes(q);
        const cityMatch = l.pickupAddress?.city?.toLowerCase().includes(q);
        if (!titleMatch && !donorMatch && !cityMatch) return false;
      }

      return true;
    });
  }, [listings, statusFilter, selectedCategory, selectedDiet, selectedCity, searchQuery]);

  const handleClaimClick = (listing) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (role === 'donor') {
      alert('You are currently signed in as a Donor. Please log in as an NGO to claim food.');
      return;
    }
    setModalListing(listing);
  };

  const handleRequestSubmit = async (reqData) => {
    await createRequest(reqData);
    setToastMessage('Request sent to donor successfully! Track status in "My Requests".');
    setTimeout(() => setToastMessage(''), 4000);
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem 0', minHeight: 'calc(100vh - 72px)', backgroundColor: 'var(--bg-main)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <span className="badge badge-available" style={{ marginBottom: '0.4rem' }}>
            <Sparkles size={14} /> Live Community Feed
          </span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
            Available Food for Donation
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>
            Discover surplus food ready for immediate pickup by registered charitable organizations.
          </p>
        </div>

        {/* Toast alert */}
        {toastMessage && (
          <div style={{
            backgroundColor: '#dcfce7',
            border: '1px solid #86efac',
            color: '#15803d',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontWeight: 600,
          }}>
            {toastMessage}
          </div>
        )}

        {/* Search & Filters Card */}
        <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            alignItems: 'center',
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative', gridColumn: 'span 2' }}>
              <Search
                size={18}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Search food, dishes, hotel name, or city..."
                style={{ paddingLeft: '2.5rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <select
                className="form-control"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Cooked Meals">Cooked Meals</option>
                <option value="Raw Groceries">Raw Groceries</option>
                <option value="Packaged Food">Packaged Food</option>
                <option value="Bakery / Desserts">Bakery / Desserts</option>
              </select>
            </div>

            {/* Dietary Dropdown */}
            <div>
              <select
                className="form-control"
                value={selectedDiet}
                onChange={(e) => setSelectedDiet(e.target.value)}
              >
                <option value="All">All Diets (Veg & Non-Veg)</option>
                <option value="Veg">Vegetarian Only</option>
                <option value="Non-Veg">Non-Vegetarian</option>
                <option value="Vegan">Vegan</option>
              </select>
            </div>

            {/* City Dropdown */}
            <div>
              <select
                className="form-control"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="All">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Status toggle */}
            <div>
              <select
                className="form-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="available">Status: Available Only</option>
                <option value="all">Status: Show All</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Showing <strong>{filteredListings.length}</strong> donation listing{filteredListings.length === 1 ? '' : 's'}
          </p>
        </div>

        {filteredListings.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Utensils size={48} color="var(--text-light)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
              No surplus food matching your criteria
            </h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', maxWidth: '400px', margin: '0.25rem auto 1.5rem auto' }}>
              Try adjusting your search filters or check back shortly as donors post new food daily.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedDiet('All');
                setSelectedCity('All');
                setStatusFilter('available');
              }}
              className="btn btn-secondary btn-sm"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}>
            {filteredListings.map((listing) => (
              <FoodCard
                key={listing._id}
                listing={listing}
                onRequest={handleClaimClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Request Modal */}
      <RequestModal
        isOpen={!!modalListing}
        onClose={() => setModalListing(null)}
        onSubmit={handleRequestSubmit}
        listing={modalListing}
      />
    </div>
  );
};

export default AvailableFood;
