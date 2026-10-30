import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from './AuthContext';

const FoodContext = createContext();

export const useFood = () => useContext(FoodContext);

const INITIAL_LISTINGS = [
  {
    _id: '672233445566778899aaee01',
    title: 'Fresh Buffet Lunch Surplus (Jeera Rice, Paneer Butter Masala, Dal)',
    foodType: 'Cooked Meals',
    dietaryType: 'Veg',
    quantity: { value: 50, unit: 'servings' },
    preparedTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    bestBefore: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    pickupAddress: {
      street: '45 MG Road, Ashok Nagar',
      city: 'Bangalore',
      contactPhone: '+91 9811122233',
    },
    specialNotes: 'Freshly prepared for an afternoon banquet. Packed in clean insulated containers.',
    status: 'available',
    donor: {
      _id: '672233445566778899aabb01',
      name: 'Chef Rajesh Sharma',
      organizationName: 'Grand Palace Hotel & Banquets',
      phone: '+91 9811122233',
      isVerified: true,
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '672233445566778899aaee02',
    title: 'Fresh Artisan Bakery Surplus (Croissants, Dinner Rolls & Cupcakes)',
    foodType: 'Bakery / Desserts',
    dietaryType: 'Egg',
    quantity: { value: 35, unit: 'packets' },
    preparedTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    bestBefore: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    pickupAddress: {
      street: '12 Indiranagar 100ft Rd',
      city: 'Bangalore',
      contactPhone: '+91 9822233344',
    },
    specialNotes: 'Freshly baked today morning. Individually sealed in food-grade packaging.',
    status: 'available',
    donor: {
      _id: '672233445566778899aabb02',
      name: 'Priya Verma',
      organizationName: 'Royal Delight Caterers',
      phone: '+91 9822233344',
      isVerified: true,
    },
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '672233445566778899aaee03',
    title: 'Surplus Fresh Farm Produce (Tomatoes, Bell Peppers, Potatoes)',
    foodType: 'Raw Groceries',
    dietaryType: 'Vegan',
    quantity: { value: 30, unit: 'kg' },
    preparedTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    bestBefore: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    pickupAddress: {
      street: '88 Whitefield Main Road',
      city: 'Bangalore',
      contactPhone: '+91 9811122233',
    },
    specialNotes: 'High quality raw produce. Ideal for community shelter cooking.',
    status: 'available',
    donor: {
      _id: '672233445566778899aabb01',
      name: 'Chef Rajesh Sharma',
      organizationName: 'Grand Palace Hotel & Banquets',
      phone: '+91 9811122233',
      isVerified: true,
    },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '672233445566778899aaee04',
    title: 'Sealed Breakfast Packs & Dairy (UHT Milk, Cornflakes, Fruit Jams)',
    foodType: 'Packaged Food',
    dietaryType: 'Veg',
    quantity: { value: 40, unit: 'packets' },
    preparedTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    bestBefore: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    pickupAddress: {
      street: '12 Indiranagar 100ft Rd',
      city: 'Bangalore',
      contactPhone: '+91 9822233344',
    },
    specialNotes: 'Factory-sealed individual cartons with manufacturer expiry labels intact.',
    status: 'available',
    donor: {
      _id: '672233445566778899aabb02',
      name: 'Priya Verma',
      organizationName: 'Royal Delight Caterers',
      phone: '+91 9822233344',
      isVerified: true,
    },
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

const INITIAL_REQUESTS = [
  {
    _id: '672233445566778899aacc01',
    listing: INITIAL_LISTINGS[0],
    donor: INITIAL_LISTINGS[0].donor,
    ngo: {
      _id: '672233445566778899aabb03',
      name: 'Sister Mary',
      organizationName: 'Helping Hands Community Foundation',
      phone: '+91 9833344455',
      address: { city: 'Bangalore' },
      isVerified: true,
    },
    status: 'pending',
    pickupEta: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    notes: 'Our volunteers are ready with an insulated van. Can collect immediately.',
    pickupOtp: null,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

export const FoodProvider = ({ children }) => {
  const { user, token, role, isAuthenticated } = useAuth();

  const [listings, setListings] = useState(() => {
    const saved = localStorage.getItem('food_listings');
    return saved ? JSON.parse(saved) : INITIAL_LISTINGS;
  });

  const [donorListings, setDonorListings] = useState([]);
  const [requests, setRequests] = useState(() => {
    const saved = localStorage.getItem('donation_requests');
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  const [adminStats, setAdminStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([
    {
      _id: '672233445566778899aabb01',
      name: 'Chef Rajesh Sharma',
      organizationName: 'Grand Palace Hotel & Banquets',
      email: 'grandpalace@donor.com',
      role: 'donor',
      phone: '+91 9811122233',
      address: { city: 'Bangalore' },
      isVerified: true,
    },
    {
      _id: '672233445566778899aabb03',
      name: 'Sister Mary',
      organizationName: 'Helping Hands Community Foundation',
      email: 'helpinghands@ngo.org',
      role: 'ngo',
      phone: '+91 9833344455',
      address: { city: 'Bangalore' },
      isVerified: true,
    },
    {
      _id: '672233445566778899aabb04',
      name: 'Amit Patel',
      organizationName: 'Feed The City Relief Care',
      email: 'feedthecity@ngo.org',
      role: 'ngo',
      phone: '+91 9844455566',
      address: { city: 'Bangalore' },
      isVerified: false,
    },
  ]);

  const [loadingListings, setLoadingListings] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('food_listings', JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem('donation_requests', JSON.stringify(requests));
  }, [requests]);

  // 1. Fetch Public Available Food Listings
  const fetchListings = useCallback(async (params = {}) => {
    setLoadingListings(true);
    setError(null);
    try {
      const res = await api.get('/listings', { params });
      if (res.data?.success && res.data.listings?.length > 0) {
        setListings(res.data.listings);
      }
    } catch (err) {
      console.warn('[FoodContext] Using cached/demo listings:', err.message);
    } finally {
      setLoadingListings(false);
    }
  }, []);

  // 2. Fetch Single Listing By ID
  const getListingById = useCallback(async (id) => {
    try {
      const res = await api.get(`/listings/${id}`);
      if (res.data?.success) {
        return res.data.listing;
      }
    } catch (err) {
      console.warn(`[FoodContext] Fetch single listing fallback for ${id}`);
    }
    const found = listings.find((l) => l._id === id) || INITIAL_LISTINGS[0];
    return found;
  }, [listings]);

  // 3. Fetch Donor's Own Listings
  const fetchDonorListings = useCallback(async () => {
    if (!token || role !== 'donor') return;
    try {
      const res = await api.get('/listings/my-listings');
      if (res.data?.success && res.data.listings) {
        setDonorListings(res.data.listings);
        return;
      }
    } catch (err) {
      console.warn('[FoodContext] Using local donor listings');
    }
    // Fallback: Filter from current listings
    const filtered = listings.filter((l) => l.donor?._id === user?._id || !l.donor?._id);
    setDonorListings(filtered.length > 0 ? filtered : listings.slice(0, 2));
  }, [token, role, listings, user]);

  // 4. Fetch Requests based on active role
  const fetchRequests = useCallback(async () => {
    if (!token) return;
    setLoadingRequests(true);
    try {
      if (role === 'donor') {
        const res = await api.get('/requests/donor');
        if (res.data?.success && res.data.requests) {
          setRequests(res.data.requests);
        }
      } else if (role === 'ngo') {
        const res = await api.get('/requests/ngo');
        if (res.data?.success && res.data.requests) {
          setRequests(res.data.requests);
        }
      }
    } catch (err) {
      console.warn('[FoodContext] Using local requests');
    } finally {
      setLoadingRequests(false);
    }
  }, [token, role]);

  // 5. Fetch Admin Dashboard Metrics & Users
  const fetchAdminData = useCallback(async () => {
    if (!token || role !== 'admin') return;
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get('/admin/users'),
      ]);
      if (statsRes.data?.success) {
        setAdminStats(statsRes.data.stats);
      }
      if (usersRes.data?.success && usersRes.data.users) {
        setAdminUsers(usersRes.data.users);
      }
    } catch (err) {
      console.warn('[FoodContext] Using local admin data');
    }
  }, [token, role]);

  // Sync data automatically whenever user/role/token changes
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'donor') {
        fetchDonorListings();
        fetchRequests();
      } else if (role === 'ngo') {
        fetchRequests();
      } else if (role === 'admin') {
        fetchAdminData();
      }
    }
  }, [isAuthenticated, role, fetchDonorListings, fetchRequests, fetchAdminData]);

  // Post New Food Listing (Donor)
  const addListing = async (formData) => {
    setActionLoading(true);
    try {
      const res = await api.post('/listings', formData);
      if (res.data?.success) {
        await Promise.all([fetchListings(), fetchDonorListings()]);
        return res.data.listing;
      }
    } catch (err) {
      console.warn('Backend addListing fallback:', err.message);
    } finally {
      setActionLoading(false);
    }

    // Local / Serverless fallback
    const newListing = {
      _id: `lst_${Date.now()}`,
      donor: user || {
        _id: '672233445566778899aabb01',
        name: 'Chef Rajesh Sharma',
        organizationName: 'Grand Palace Hotel & Banquets',
        phone: '+91 9811122233',
        isVerified: true,
      },
      title: formData.title,
      foodType: formData.foodType,
      dietaryType: formData.dietaryType || 'Veg',
      quantity: {
        value: Number(formData.quantityValue),
        unit: formData.quantityUnit || 'servings',
      },
      preparedTime: formData.preparedTime || new Date().toISOString(),
      bestBefore: formData.bestBefore || new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      pickupAddress: {
        street: formData.pickupStreet || user?.address?.street || '',
        city: formData.pickupCity || user?.address?.city || 'Bangalore',
        contactPhone: formData.pickupPhone || user?.phone || '+91 9811122233',
      },
      specialNotes: formData.specialNotes || '',
      status: 'available',
      createdAt: new Date().toISOString(),
    };

    setListings((prev) => [newListing, ...prev]);
    setDonorListings((prev) => [newListing, ...prev]);
    return newListing;
  };

  // Submit Donation Claim Request (NGO)
  const createRequest = async ({ listingId, pickupEta, notes }) => {
    setActionLoading(true);
    try {
      const res = await api.post('/requests', { listingId, pickupEta, notes });
      if (res.data?.success) {
        await fetchRequests();
        return res.data.request;
      }
    } catch (err) {
      console.warn('Backend createRequest fallback:', err.message);
    } finally {
      setActionLoading(false);
    }

    const targetListing = listings.find((l) => l._id === listingId) || INITIAL_LISTINGS[0];
    const newRequest = {
      _id: `req_${Date.now()}`,
      listing: targetListing,
      donor: targetListing.donor,
      ngo: user || {
        _id: '672233445566778899aabb03',
        name: 'Sister Mary',
        organizationName: 'Helping Hands Community Foundation',
        phone: '+91 9833344455',
        isVerified: true,
      },
      status: 'pending',
      pickupEta: pickupEta || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      notes: notes || '',
      pickupOtp: null,
      createdAt: new Date().toISOString(),
    };

    setRequests((prev) => [newRequest, ...prev]);
    return newRequest;
  };

  // Accept Donation Request & Generate 4-digit OTP (Donor)
  const acceptRequest = async (requestId) => {
    setActionLoading(true);
    try {
      const res = await api.patch(`/requests/${requestId}/accept`);
      if (res.data?.success) {
        await Promise.all([fetchRequests(), fetchDonorListings(), fetchListings()]);
        return res.data.request;
      }
    } catch (err) {
      console.warn('Backend acceptRequest fallback:', err.message);
    } finally {
      setActionLoading(false);
    }

    // Local fallback: generate 4-digit numeric code
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setRequests((prev) =>
      prev.map((r) => (r._id === requestId ? { ...r, status: 'accepted', pickupOtp: generatedOtp } : r))
    );

    const targetReq = requests.find((r) => r._id === requestId);
    if (targetReq) {
      const listingId = targetReq.listing?._id || targetReq.listing;
      setListings((prev) => prev.map((l) => (l._id === listingId ? { ...l, status: 'reserved' } : l)));
      setDonorListings((prev) => prev.map((l) => (l._id === listingId ? { ...l, status: 'reserved' } : l)));
    }
    return { pickupOtp: generatedOtp };
  };

  // Reject Donation Request (Donor)
  const rejectRequest = async (requestId) => {
    setActionLoading(true);
    try {
      await api.patch(`/requests/${requestId}/reject`);
      await Promise.all([fetchRequests(), fetchDonorListings(), fetchListings()]);
    } catch (err) {
      console.warn('Backend rejectRequest fallback:', err.message);
    } finally {
      setActionLoading(false);
    }

    setRequests((prev) =>
      prev.map((r) => (r._id === requestId ? { ...r, status: 'rejected' } : r))
    );
  };

  // Verify Handover OTP (Donor)
  const verifyPickupOtp = async (requestId, enteredOtp) => {
    setActionLoading(true);
    try {
      const res = await api.post(`/requests/${requestId}/verify-pickup`, { otp: enteredOtp });
      if (res.data?.success) {
        await Promise.all([fetchRequests(), fetchDonorListings(), fetchListings()]);
        return true;
      }
    } catch (err) {
      console.warn('Backend verifyPickupOtp fallback:', err.message);
    } finally {
      setActionLoading(false);
    }

    const targetReq = requests.find((r) => r._id === requestId);
    if (!targetReq) throw new Error('Request not found');

    if (targetReq.pickupOtp && targetReq.pickupOtp !== enteredOtp.trim()) {
      throw new Error('Incorrect pickup verification code. Please check with the NGO.');
    }

    setRequests((prev) =>
      prev.map((r) =>
        r._id === requestId
          ? { ...r, status: 'completed', completedAt: new Date().toISOString() }
          : r
      )
    );

    const listingId = targetReq.listing?._id || targetReq.listing;
    setListings((prev) => prev.map((l) => (l._id === listingId ? { ...l, status: 'completed' } : l)));
    setDonorListings((prev) => prev.map((l) => (l._id === listingId ? { ...l, status: 'completed' } : l)));
    return true;
  };

  // Toggle User / NGO Verification (Admin)
  const toggleUserVerification = async (userId) => {
    try {
      const res = await api.patch(`/admin/verify-user/${userId}`);
      if (res.data?.success) {
        setAdminUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isVerified: res.data.user.isVerified } : u))
        );
        return res.data.user;
      }
    } catch (err) {
      console.warn('Backend toggleUserVerification fallback:', err.message);
    }

    setAdminUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, isVerified: !u.isVerified } : u))
    );
    const updated = adminUsers.find((u) => u._id === userId) || { organizationName: 'Organization' };
    return { ...updated, isVerified: !updated.isVerified };
  };

  return (
    <FoodContext.Provider
      value={{
        listings,
        donorListings,
        requests,
        adminStats,
        adminUsers,
        loadingListings,
        loadingRequests,
        actionLoading,
        error,
        fetchListings,
        getListingById,
        fetchDonorListings,
        fetchRequests,
        fetchAdminData,
        addListing,
        createRequest,
        acceptRequest,
        rejectRequest,
        verifyPickupOtp,
        toggleUserVerification,
      }}
    >
      {children}
    </FoodContext.Provider>
  );
};
