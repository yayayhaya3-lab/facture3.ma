import React from 'react';
import { AlertTriangle, Crown, Clock, X } from 'lucide-react';

interface ExpirationNotificationProps {
  daysRemaining: number;
  onRenew: () => void;
  onDismiss: () => void;
}

export default function ExpirationNotification({ daysRemaining, onRenew, onDismiss }: ExpirationNotificationProps) {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center animate-pulse">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-lg">⏰ Abonnement Pro - Expiration Proche</p>
            <p className="text-sm opacity-90">
              Il reste seulement <strong>{daysRemaining} jour{daysRemaining > 1 ? 's' : ''}</strong> avant la fin de votre abonnement Pro. 
              Pensez à le renouveler pour éviter l'interruption du service.
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onRenew}
            className="inline-flex items-center space-x-2 bg-white text-orange-600 hover:bg-gray-100 px-6 py-2 rounded-lg font-semibold transition-colors shadow-lg"
          >
            <Crown className="w-4 h-4" />
            <span>Renouveler mon abonnement</span>
          </button>
          
          <button
            onClick={onDismiss}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Masquer temporairement"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}