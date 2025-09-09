import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SubscriptionStatus {
  isExpired: boolean;
  isExpiringSoon: boolean;
  daysRemaining: number;
  expiryDate: string | null;
  shouldBlockUser: boolean;
  shouldShowNotification: boolean;
}

export function useSubscriptionStatus() {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    isExpired: false,
    isExpiringSoon: false,
    daysRemaining: 0,
    expiryDate: null,
    shouldBlockUser: false,
    shouldShowNotification: false
  });

  useEffect(() => {
    if (!user?.company) {
      setStatus({
        isExpired: false,
        isExpiringSoon: false,
        daysRemaining: 0,
        expiryDate: null,
        shouldBlockUser: false,
        shouldShowNotification: false
      });
      return;
    }

    const { subscription, expiryDate } = user.company;
    
    // Si ce n'est pas un abonnement Pro, pas de vérification
    if (subscription !== 'pro' || !expiryDate) {
      setStatus({
        isExpired: false,
        isExpiringSoon: false,
        daysRemaining: 0,
        expiryDate: null,
        shouldBlockUser: false,
        shouldShowNotification: false
      });
      return;
    }

    const currentDate = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry.getTime() - currentDate.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    const isExpired = daysRemaining <= 0;
    const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 5;
    
    // Logique de blocage
    const shouldBlockUser = isExpired && !user.isAdmin;
    const shouldShowNotification = isExpiringSoon && user.isAdmin;

    setStatus({
      isExpired,
      isExpiringSoon,
      daysRemaining: Math.max(0, daysRemaining),
      expiryDate,
      shouldBlockUser,
      shouldShowNotification
    });
  }, [user]);

  return status;
}