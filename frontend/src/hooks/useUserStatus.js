// src/hooks/useUserStatus.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '../services/authService';

export const useUserStatus = (userId) => {
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const checkStatusViaApi = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await apiClient.get(`http://localhost:8086/api/users/${userId}/status`);
      setIsOnline(response.data.online);
    } catch (err) {
      console.warn(`Erreur vérification statut user ${userId}:`, err.message);
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      checkStatusViaApi();
    }, 5000);
  }, [checkStatusViaApi]);

  useEffect(() => {
    if (!userId) return;

    checkStatusViaApi();
    startPolling();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [userId, checkStatusViaApi, startPolling]);

  return { isOnline, loading };
};