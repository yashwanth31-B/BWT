import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from './AuthContext';

const FoodContext = createContext();

export const useFood = () => useContext(FoodContext);

export const FoodProvider = ({ children }) => {
  const { user, token, role, isAuthenticated } = useAuth();

  const [listings, setListings] = useState([]);
  const [donorListings, setDonorListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);

  const [loadingListings, setLoadingListings] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch Public Available Food Listings (Supports query params)
  const fetchListings = useCallback(async (params = {}) => {
    setLoadingListings(true);
    setError(null);
    try {
      const res = await api.get('/listings', { params });
      if (res.data?.success) {
        setListings(res.data.listings || []);
      }
    } catch (err) {
      console.error('[FoodContext] Error fetching listings:', err.message);
      setError(getErrorMessage(err, 'Failed to fetch food listings'));
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
      console.error(`[FoodContext] Error fetching listing ${id}:`, err.message);
      throw new Error(getErrorMessage(err, 'Listing not found'));
    }
  }, []);

  // 3. Fetch Donor's Own Listings
  const fetchDonorListings = useCallback(async () => {
    if (!token || role !== 'donor') return;
    try {
      const res = await api.get('/listings/my-listings');
      if (res.data?.success) {
        setDonorListings(res.data.listings || []);
      }
    } catch (err) {
      console.error('[FoodContext] Error fetching donor listings:', err.message);
    }
  }, [token, role]);

  // 4. Fetch Requests based on active role (Donor sees incoming; NGO sees claims)
  const fetchRequests = useCallback(async () => {
    if (!token) return;
    setLoadingRequests(true);
    try {
      if (role === 'donor') {
        const res = await api.get('/requests/donor');
        if (res.data?.success) {
          setRequests(res.data.requests || []);
        }
      } else if (role === 'ngo') {
        const res = await api.get('/requests/ngo');
        if (res.data?.success) {
          setRequests(res.data.requests || []);
        }
      }
    } catch (err) {
      console.error('[FoodContext] Error fetching requests:', err.message);
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
      if (usersRes.data?.success) {
        setAdminUsers(usersRes.data.users || []);
      }
    } catch (err) {
      console.error('[FoodContext] Error fetching admin data:', err.message);
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
    } else {
      setDonorListings([]);
      setRequests([]);
      setAdminStats(null);
      setAdminUsers([]);
    }
  }, [isAuthenticated, role, fetchDonorListings, fetchRequests, fetchAdminData]);

  // ================= ACTION METHODS CONNECTED TO BACKEND ================= //

  // Post New Food Listing (Donor)
  const addListing = async (formData) => {
    setActionLoading(true);
    try {
      const res = await api.post('/listings', formData);
      if (res.data?.success) {
        // Refresh both public listings and donor listings
        await Promise.all([fetchListings(), fetchDonorListings()]);
        return res.data.listing;
      }
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to publish food listing'));
    } finally {
      setActionLoading(false);
    }
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
      throw new Error(getErrorMessage(err, 'Failed to submit donation request'));
    } finally {
      setActionLoading(false);
    }
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
      throw new Error(getErrorMessage(err, 'Failed to accept request'));
    } finally {
      setActionLoading(false);
    }
  };

  // Reject Donation Request (Donor)
  const rejectRequest = async (requestId) => {
    setActionLoading(true);
    try {
      const res = await api.patch(`/requests/${requestId}/reject`);
      if (res.data?.success) {
        await Promise.all([fetchRequests(), fetchDonorListings(), fetchListings()]);
        return res.data.request;
      }
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to reject request'));
    } finally {
      setActionLoading(false);
    }
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
      throw new Error(getErrorMessage(err, 'Incorrect pickup verification code'));
    } finally {
      setActionLoading(false);
    }
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
      throw new Error(getErrorMessage(err, 'Failed to update user verification status'));
    }
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
