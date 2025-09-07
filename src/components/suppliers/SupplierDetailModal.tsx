import React, { useState } from 'react';
import { useSupplier, Supplier } from '../../contexts/SupplierContext';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  Calendar, 
  DollarSign,
  FileText,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface SupplierDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier;
}

export default function SupplierDetailModal({ isOpen, onClose, supplier }: SupplierDetailModalProps) {
  const { 
    purchaseOrders, 
    supplierPayments, 
    getSupplierStats 
  } = useSupplier();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('info');
  
  const stats = getSupplierStats(supplier.id);
  const supplierOrders = purchaseOrders.filter(order => order.supplierId === supplier.id);
  const supplierPaymentsData = supplierPayments.filter(payment => payment.supplierId === supplier.id);

  const tabs = [
    { id: 'info', label: 'Informations', icon: Building2 },
    { id: 'orders', label: 'Commandes', icon: FileText },
    { id: 'payments', label: 'Paiements', icon: CreditCard },
    { id: 'balance', label: 'Balance', icon: DollarSign }
  ];

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Payé
          </span>
        );
      case 'received':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Reçu
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Envoyé
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Brouillon
          </span>
        );
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    const badges = {
      'virement': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Virement' },
      'cheque': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chèque' },
      'espece': { bg: 'bg-green-100', text: 'text-green-800', label: 'Espèces' },
      'carte': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Carte' }
    };
    
    const badge = badges[method as keyof typeof badges] || badges.virement;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const exportSupplierPDF = () => {
    const reportContent = generateSupplierReportHTML();
    
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'fixed';
    tempDiv.style.top = '0';
    tempDiv.style.left = '0';
    tempDiv.style.width = '210mm';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.zIndex = '-1';
    tempDiv.style.opacity = '0';
    tempDiv.innerHTML = reportContent;
    document.body.appendChild(tempDiv);

    const options = {
      margin: [10, 10, 10, 10],
      filename: `Fournisseur_${supplier.name.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: false,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };

    html2pdf()
      .set(options)
      .from(tempDiv)
      .save()
      .then(() => {
        document.body.removeChild(tempDiv);
      })
      .catch((error) => {
        console.error('Erreur lors de la génération du PDF:', error);
        if (document.body.contains(tempDiv)) {
          document.body.removeChild(tempDiv);
        }
        alert('Erreur lors de la génération du PDF');
      });
  };

  const generateSupplierReportHTML = () => {
    return `
      <div style="padding: 20px; font-family: Arial, sans-serif; background: white;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #EA580C; padding-bottom: 20px;">
          <h1 style="font-size: 28px; color: #EA580C; margin: 0; font-weight: bold;">FICHE FOURNISSEUR DÉTAILLÉE</h1>
          <h2 style="font-size: 20px; color: #1f2937; margin: 10px 0; font-weight: bold;">${supplier.name}</h2>
          <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        
        <!-- Informations fournisseur -->
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">📋 Informations Générales</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border: 1px solid #f59e0b;">
              <p style="font-size: 14px; color: #92400e; margin: 0;"><strong>Nom:</strong> ${supplier.name}</p>
            </div>
            <div style="background: #fee2e2; padding: 15px; border-radius: 8px; border: 1px solid #dc2626;">
              <p style="font-size: 14px; color: #991b1b; margin: 0;"><strong>ICE:</strong> ${supplier.ice}</p>
            </div>
            <div style="background: #dcfce7; padding: 15px; border-radius: 8px; border: 1px solid #16a34a;">
              <p style="font-size: 14px; color: #166534; margin: 0;"><strong>Contact:</strong> ${supplier.contactPerson}</p>
            </div>
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #0ea5e9;">
              <p style="font-size: 14px; color: #0c4a6e; margin: 0;"><strong>Délai paiement:</strong> ${supplier.paymentTerms} jours</p>
            </div>
          </div>
        </div>
        
        <!-- Statistiques -->
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">📊 Statistiques</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #0ea5e9;">
              <p style="font-size: 14px; color: #0c4a6e; margin: 0;"><strong>Total Commandes:</strong> ${stats.totalPurchases.toLocaleString()} MAD</p>
            </div>
            <div style="background: #dcfce7; padding: 15px; border-radius: 8px; border: 1px solid #16a34a;">
              <p style="font-size: 14px; color: #166534; margin: 0;"><strong>Total Paiements:</strong> ${stats.totalPayments.toLocaleString()} MAD</p>
            </div>
            <div style="background: ${stats.balance > 0 ? '#fee2e2' : '#dcfce7'}; padding: 15px; border-radius: 8px; border: 1px solid ${stats.balance > 0 ? '#dc2626' : '#16a34a'};">
              <p style="font-size: 14px; color: ${stats.balance > 0 ? '#991b1b' : '#166534'}; margin: 0;"><strong>Balance:</strong> ${stats.balance.toLocaleString()} MAD</p>
            </div>
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border: 1px solid #f59e0b;">
              <p style="font-size: 14px; color: #92400e; margin: 0;"><strong>Nombre Commandes:</strong> ${stats.ordersCount}</p>
            </div>
          </div>
        </div>
        
        <!-- Commandes -->
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">📦 Commandes</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb; font-weight: bold;">N° Commande</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Date</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Montant TTC</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Statut</th>
              </tr>
            </thead>
            <tbody>
              ${supplierOrders.map(order => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${order.number}</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${new Date(order.date).toLocaleDateString('fr-FR')}</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${order.totalTTC.toLocaleString()} MAD</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${order.status === 'paid' ? 'Payé' : order.status === 'received' ? 'Reçu' : order.status === 'sent' ? 'Envoyé' : 'Brouillon'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <!-- Paiements -->
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">💳 Paiements</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb; font-weight: bold;">Date</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Montant</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Mode</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Référence</th>
              </tr>
            </thead>
            <tbody>
              ${supplierPaymentsData.map(payment => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${new Date(payment.paymentDate).toLocaleDateString('fr-FR')}</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${payment.amount.toLocaleString()} MAD</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${payment.paymentMethod === 'virement' ? 'Virement' : payment.paymentMethod === 'cheque' ? 'Chèque' : payment.paymentMethod === 'espece' ? 'Espèces' : 'Carte'}</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${payment.reference}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  const exportToExcel = () => {
    // Créer les données CSV
    const csvData = [];
    
    // En-têtes
    csvData.push(['Fournisseur', supplier.name]);
    csvData.push(['ICE', supplier.ice]);
    csvData.push(['Contact', supplier.contactPerson]);
    csvData.push(['']);
    
    // Commandes
    csvData.push(['COMMANDES']);
    csvData.push(['N° Commande', 'Date', 'Montant TTC', 'Statut']);
    supplierOrders.forEach(order => {
      csvData.push([
        order.number,
        new Date(order.date).toLocaleDateString('fr-FR'),
        `${order.totalTTC.toLocaleString()} MAD`,
        order.status === 'paid' ? 'Payé' : order.status === 'received' ? 'Reçu' : order.status === 'sent' ? 'Envoyé' : 'Brouillon'
      ]);
    });
    
    csvData.push(['']);
    
    // Paiements
    csvData.push(['PAIEMENTS']);
    csvData.push(['Date', 'Montant', 'Mode', 'Référence']);
    supplierPaymentsData.forEach(payment => {
      csvData.push([
        new Date(payment.paymentDate).toLocaleDateString('fr-FR'),
        `${payment.amount.toLocaleString()} MAD`,
        payment.paymentMethod === 'virement' ? 'Virement' : payment.paymentMethod === 'cheque' ? 'Chèque' : payment.paymentMethod === 'espece' ? 'Espèces' : 'Carte',
        payment.reference
      ]);
    });
    
    // Convertir en CSV
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Fournisseur_${supplier.name.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="inline-block w-full max-w-6xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Fournisseur: {supplier.name}</h3>
                <p className="text-sm opacity-90">ICE: {supplier.ice}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={exportSupplierPDF}
                  className="inline-flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={exportToExcel}
                  className="inline-flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Excel</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <span className="sr-only">Fermer</span>
                  ✕
                </button>
              </div>
            </div>
          </div>

      <div className="space-y-6">
        <div className="p-6">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.ordersCount}</div>
            <div className="text-xs text-orange-700">Commandes</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalPurchases.toLocaleString()}</div>
            <div className="text-xs text-blue-700">MAD Achats</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalPayments.toLocaleString()}</div>
            <div className="text-xs text-green-700">MAD Payés</div>
          </div>
          <div className={`border rounded-lg p-4 text-center ${
            stats.balance > 0 ? 'bg-red-50 border-red-200' : 
            stats.balance < 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className={`text-2xl font-bold ${
              stats.balance > 0 ? 'text-red-600' : 
              stats.balance < 0 ? 'text-green-600' : 'text-gray-600'
            }`}>
              {stats.balance.toLocaleString()}
            </div>
            <div className={`text-xs ${
              stats.balance > 0 ? 'text-red-700' : 
              stats.balance < 0 ? 'text-green-700' : 'text-gray-700'
            }`}>
              MAD {stats.balance > 0 ? 'À payer' : stats.balance < 0 ? 'Crédit' : 'Soldé'}
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Informations générales</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{supplier.name}</p>
                      <p className="text-sm text-gray-500">ICE: {supplier.ice}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{supplier.contactPerson}</p>
                      <p className="text-sm text-gray-500">Personne de contact</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{supplier.phone}</p>
                      <p className="text-sm text-gray-500">Téléphone</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{supplier.email}</p>
                      <p className="text-sm text-gray-500">Email</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{supplier.address}</p>
                      <p className="text-sm text-gray-500">Adresse</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Conditions commerciales</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{supplier.paymentTerms} jours</p>
                      <p className="text-sm text-gray-500">Délai de paiement</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      {supplier.status === 'active' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{supplier.status === 'active' ? 'Actif' : 'Inactif'}</p>
                      <p className="text-sm text-gray-500">Statut</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(supplier.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-sm text-gray-500">Date d'ajout</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Historique des commandes</h4>
            {supplierOrders.length > 0 ? (
              <div className="space-y-3">
                {supplierOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">{order.number}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.date).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.items.length} article{order.items.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {order.totalTTC.toLocaleString()} MAD
                      </p>
                      <div className="mt-1">
                        {getOrderStatusBadge(order.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucune commande pour ce fournisseur</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Historique des paiements</h4>
            {supplierPaymentsData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mode de paiement
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Référence
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {supplierPaymentsData.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(payment.paymentDate).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {payment.amount.toLocaleString()} MAD
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPaymentMethodBadge(payment.paymentMethod)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.reference}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun paiement pour ce fournisseur</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Commandes détaillées</h4>
            {supplierOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix HT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        TVA
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix TTC
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {supplierOrders.map((order) => 
                      order.items.map((item, itemIndex) => (
                        <tr key={`${order.id}-${itemIndex}`} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                              <div className="text-xs text-gray-500">{item.description}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.quantity.toFixed(3)} {item.unit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.unitPrice.toFixed(2)} MAD
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.vatRate}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {(item.total * (1 + item.vatRate / 100)).toFixed(2)} MAD
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucune commande pour ce fournisseur</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'balance' && (
          <div className="space-y-6">
            <div className="text-center">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Balance Fournisseur</h4>
              <div className={`text-4xl font-bold ${
                stats.balance > 0 ? 'text-red-600' : stats.balance < 0 ? 'text-green-600' : 'text-gray-600'
              }`}>
                {stats.balance.toLocaleString()} MAD
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {stats.balance > 0 ? 'Montant dû au fournisseur' : 
                 stats.balance < 0 ? 'Crédit disponible' : 'Compte soldé'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h5 className="font-semibold text-blue-900 mb-4">📊 Analyse Financière</h5>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-800">Total commandes:</span>
                    <span className="font-bold text-blue-900">{stats.totalPurchases.toLocaleString()} MAD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-800">Total paiements:</span>
                    <span className="font-bold text-blue-900">{stats.totalPayments.toLocaleString()} MAD</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-300 pt-2">
                    <span className="text-blue-800 font-bold">Balance:</span>
                    <span className={`font-bold ${
                      stats.balance > 0 ? 'text-red-600' : stats.balance < 0 ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {stats.balance.toLocaleString()} MAD
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h5 className="font-semibold text-purple-900 mb-4">📈 Indicateurs</h5>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-purple-800">Nombre de commandes:</span>
                    <span className="font-bold text-purple-900">{stats.ordersCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-800">Montant moyen/commande:</span>
                    <span className="font-bold text-purple-900">
                      {stats.ordersCount > 0 ? (stats.totalPurchases / stats.ordersCount).toFixed(0) : '0'} MAD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-800">Délai de paiement:</span>
                    <span className="font-bold text-purple-900">{supplier.paymentTerms} jours</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommandations */}
            {stats.balance > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h5 className="font-semibold text-red-900">Action Requise</h5>
                </div>
                <p className="text-red-800 text-sm">
                  Vous devez <strong>{stats.balance.toLocaleString()} MAD</strong> à ce fournisseur. 
                  Planifiez un paiement pour maintenir de bonnes relations commerciales.
                </p>
              </div>
            )}

            {stats.balance < 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h5 className="font-semibold text-green-900">Situation Favorable</h5>
                </div>
                <p className="text-green-800 text-sm">
                  Vous avez un crédit de <strong>{Math.abs(stats.balance).toLocaleString()} MAD</strong> chez ce fournisseur. 
                  Vous pouvez utiliser ce crédit pour vos prochaines commandes.
                </p>
              </div>
            )}

            {stats.balance === 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-gray-600" />
                  <h5 className="font-semibold text-gray-900">Compte Soldé</h5>
                </div>
                <p className="text-gray-800 text-sm">
                  Parfait ! Votre compte avec ce fournisseur est équilibré. 
                  Aucun montant dû de part et d'autre.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Résumé financier */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
          <h4 className="font-semibold text-orange-900 mb-4">Résumé Financier</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">{stats.totalPurchases.toLocaleString()}</div>
              <div className="text-xs text-blue-700">MAD Total Achats</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{stats.totalPayments.toLocaleString()}</div>
              <div className="text-xs text-green-700">MAD Total Payés</div>
            </div>
            <div>
              <div className={`text-lg font-bold ${
                stats.balance > 0 ? 'text-red-600' : 
                stats.balance < 0 ? 'text-green-600' : 'text-gray-600'
              }`}>
                {stats.balance.toLocaleString()}
              </div>
              <div className={`text-xs ${
                stats.balance > 0 ? 'text-red-700' : 
                stats.balance < 0 ? 'text-green-700' : 'text-gray-700'
              }`}>
                MAD {stats.balance > 0 ? 'À payer' : stats.balance < 0 ? 'Crédit' : 'Soldé'}
              </div>
            </div>
          </div>
        </div>
        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun paiement pour ce fournisseur</p>
              </div>
            )}
          </div>
        )}

        {/* Résumé financier */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
          <h4 className="font-semibold text-orange-900 mb-4">Résumé Financier</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">{stats.totalPurchases.toLocaleString()}</div>
              <div className="text-xs text-blue-700">MAD Total Achats</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{stats.totalPayments.toLocaleString()}</div>
              <div className="text-xs text-green-700">MAD Total Payés</div>
            </div>
            <div>
              <div className={`text-lg font-bold ${
                stats.balance > 0 ? 'text-red-600' : 
                stats.balance < 0 ? 'text-green-600' : 'text-gray-600'
              }`}>
                {stats.balance.toLocaleString()}
              </div>
              <div className={`text-xs ${
                stats.balance > 0 ? 'text-red-700' : 
                stats.balance < 0 ? 'text-green-700' : 'text-gray-700'
              }`}>
                MAD {stats.balance > 0 ? 'À payer' : stats.balance < 0 ? 'Crédit' : 'Soldé'}
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}