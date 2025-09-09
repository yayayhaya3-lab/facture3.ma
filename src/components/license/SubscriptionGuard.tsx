import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscriptionStatus } from '../../hooks/useSubscriptionStatus';
import ExpiredAccountModal from '../auth/ExpiredAccountModal';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export default function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { user, logout } = useAuth();
  const subscriptionStatus = useSubscriptionStatus();

  useEffect(() => {
    // Si l'utilisateur est bloqué (utilisateur géré avec abonnement expiré)
    if (subscriptionStatus.shouldBlockUser) {
      // Déconnecter automatiquement l'utilisateur
      logout();
    }
  }, [subscriptionStatus.shouldBlockUser, logout]);

  // Si l'abonnement est expiré et que c'est un utilisateur géré, afficher le modal de blocage
  if (subscriptionStatus.isExpired && user && !user.isAdmin) {
    return (
      <ExpiredAccountModal
        isOpen={true}
        onClose={() => logout()}
        isAdmin={false}
        expiryDate={subscriptionStatus.expiryDate || new Date().toISOString()}
      />
    );
  }

  return <>{children}</>;
}