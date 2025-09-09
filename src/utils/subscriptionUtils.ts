/**
 * Utilitaires pour la gestion des abonnements
 */

export interface SubscriptionInfo {
  isActive: boolean;
  isExpired: boolean;
  isExpiringSoon: boolean;
  daysRemaining: number;
  expiryDate: Date | null;
}

/**
 * Vérifie le statut d'un abonnement Pro
 */
export function checkSubscriptionStatus(
  subscription: 'free' | 'pro' | undefined,
  expiryDate: string | undefined
): SubscriptionInfo {
  const defaultInfo: SubscriptionInfo = {
    isActive: false,
    isExpired: false,
    isExpiringSoon: false,
    daysRemaining: 0,
    expiryDate: null
  };

  if (subscription !== 'pro' || !expiryDate) {
    return defaultInfo;
  }

  const currentDate = new Date();
  const expiry = new Date(expiryDate);
  const timeDiff = expiry.getTime() - currentDate.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  return {
    isActive: daysRemaining > 0,
    isExpired: daysRemaining <= 0,
    isExpiringSoon: daysRemaining > 0 && daysRemaining <= 5,
    daysRemaining: Math.max(0, daysRemaining),
    expiryDate: expiry
  };
}

/**
 * Détermine si un utilisateur doit être bloqué
 */
export function shouldBlockUser(
  isUserAdmin: boolean,
  subscriptionInfo: SubscriptionInfo
): boolean {
  // Les admins ne sont jamais bloqués
  if (isUserAdmin) return false;
  
  // Les utilisateurs gérés sont bloqués si l'abonnement Pro est expiré
  return subscriptionInfo.isExpired;
}

/**
 * Détermine si une notification d'expiration doit être affichée
 */
export function shouldShowExpirationNotification(
  isUserAdmin: boolean,
  subscriptionInfo: SubscriptionInfo
): boolean {
  // Seulement pour les admins quand l'abonnement expire bientôt
  return isUserAdmin && subscriptionInfo.isExpiringSoon;
}

/**
 * Génère le message d'expiration approprié
 */
export function getExpirationMessage(
  subscriptionInfo: SubscriptionInfo,
  isUserAdmin: boolean
): string {
  if (subscriptionInfo.isExpired) {
    return isUserAdmin 
      ? 'Votre abonnement Pro est expiré. Veuillez le renouveler pour continuer à utiliser toutes les fonctionnalités.'
      : 'Ce compte est bloqué. Veuillez demander à l\'administrateur de renouveler l\'abonnement Pro.';
  }
  
  if (subscriptionInfo.isExpiringSoon) {
    return `Il reste seulement ${subscriptionInfo.daysRemaining} jour${subscriptionInfo.daysRemaining > 1 ? 's' : ''} avant la fin de votre abonnement Pro. Pensez à le renouveler pour éviter l'interruption du service.`;
  }
  
  return '';
}

/**
 * Calcule les jours restants avant expiration
 */
export function calculateDaysRemaining(expiryDate: string): number {
  const currentDate = new Date();
  const expiry = new Date(expiryDate);
  const timeDiff = expiry.getTime() - currentDate.getTime();
  return Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
}

/**
 * Formate une date d'expiration pour l'affichage
 */
export function formatExpiryDate(expiryDate: string, locale: string = 'fr-FR'): string {
  return new Date(expiryDate).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}