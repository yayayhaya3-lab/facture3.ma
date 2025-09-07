import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSupplier } from '../../contexts/SupplierContext';
import { Plus, Trash2 } from 'lucide-react';
import { 
  Truck, 
  Crown,
  Users, 
  Package, 
  DollarSign, 
  FileText,
  Search,
  Edit,
  Download,
  Filter,
  LayoutDashboard,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Calendar
} from 'lucide-react';
import AddSupplierModal from './AddSupplierModal';
import EditSupplierModal from './EditSupplierModal';
import EditPurchaseOrderModal from './EditPurchaseOrderModal';
import EditSupplierPaymentModal from './EditSupplierPaymentModal';
import AddPurchaseOrderModal from './AddPurchaseOrderModal';
import AddSupplierPaymentModal from './AddSupplierPaymentModal';
import SupplierDashboard from './SupplierDashboard';
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';

export default function SupplierManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    suppliers, 
    purchaseOrders, 
    supplierPayments, 
    deleteSupplier, 
    deletePurchaseOrder,
    deleteSupplierPayment,
    getSupplierStats,
    getSupplierBalance 
  } = useSupplier();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<string | null>(null);

  // Vérifier l'accès PRO - Permettre l'accès si l'utilisateur a une licence Pro active
  const isProActive = user?.company.subscription === 'pro' && user?.company.expiryDate && 
    new Date(user.company.expiryDate) > new Date();

  // Filtrer les fournisseurs
  const filteredSuppliers = selectedSupplier === 'all' 
    ? suppliers 
    : suppliers.filter(supplier => supplier.id === selectedSupplier);

  const searchFilteredSuppliers = filteredSuppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.ice.includes(searchTerm) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculer les statistiques globales
  const totalSuppliers = suppliers.length;
  const totalPurchases = purchaseOrders.reduce((sum, order) => sum + order.totalTTC, 0);
  const totalPayments = supplierPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalBalance = totalPurchases - totalPayments;

  // Si pas d'accès Pro, afficher le message de restriction
  if (!isProActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🔒 Fonctionnalité PRO
          </h2>
          <p className="text-gray-600 mb-6">
            La Gestion des Fournisseurs est réservée aux abonnés PRO. 
            Passez à la version PRO pour accéder à cette fonctionnalité avancée.
          </p>
          <button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200">
            <span className="flex items-center justify-center space-x-2">
              <Crown className="w-5 h-5" />
              <span>Passer à PRO - 299 MAD/mois</span>
            </span>
          </button>
        </div>
      </div>
    );
  }

  const handleDeleteSupplier = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      deleteSupplier(id);
    }
  };

  const handleDeleteOrder = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      deletePurchaseOrder(id);
    }
  };

  const handleDeletePayment = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      deleteSupplierPayment(id);
    }
  };
  const exportSupplierReport = () => {
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
      filename: `Rapport_Fournisseurs_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`,
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
          <h1 style="font-size: 28px; color: #EA580C; margin: 0; font-weight: bold;">RAPPORT DE GESTION FOURNISSEURS</h1>
          <h2 style="font-size: 20px; color: #1f2937; margin: 10px 0; font-weight: bold;">${user?.company?.name || ''}</h2>
          <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">📊 Statistiques Globales</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border: 1px solid #f59e0b;">
              <p style="font-size: 14px; color: #92400e; margin: 0;"><strong>Total Fournisseurs:</strong> ${totalSuppliers}</p>
            </div>
            <div style="background: #fee2e2; padding: 15px; border-radius: 8px; border: 1px solid #dc2626;">
              <p style="font-size: 14px; color: #991b1b; margin: 0;"><strong>Total Achats:</strong> ${totalPurchases.toLocaleString()} MAD</p>
            </div>
            <div style="background: #dcfce7; padding: 15px; border-radius: 8px; border: 1px solid #16a34a;">
              <p style="font-size: 14px; color: #166534; margin: 0;"><strong>Total Paiements:</strong> ${totalPayments.toLocaleString()} MAD</p>
            </div>
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #0ea5e9;">
              <p style="font-size: 14px; color: #0c4a6e; margin: 0;"><strong>Balance Globale:</strong> ${totalBalance.toLocaleString()} MAD</p>
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">🏢 Liste des Fournisseurs</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb; font-weight: bold;">Nom</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Total Achats</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Total Paiements</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Balance</th>
              </tr>
            </thead>
            <tbody>
              ${suppliers.map(supplier => {
                const stats = getSupplierStats(supplier.id);
                return `
                  <tr>
                    <td style="padding: 8px; border: 1px solid #e5e7eb;">${supplier.name}</td>
                    <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${stats.totalPurchases.toLocaleString()} MAD</td>
                    <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${stats.totalPayments.toLocaleString()} MAD</td>
                    <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb; ${stats.balance > 0 ? 'color: #dc2626;' : 'color: #16a34a;'}">${stats.balance.toLocaleString()} MAD</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'suppliers', label: 'Fournisseurs', icon: Truck },
    { id: 'orders', label: 'Commandes', icon: FileText },
    { id: 'payments', label: 'Paiements', icon: CreditCard }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Truck className="w-8 h-8 text-orange-600" />
            <span>Gestion des Fournisseurs</span>
            <Crown className="w-6 h-6 text-yellow-500" />
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez vos fournisseurs, commandes d'achat et paiements. Fonctionnalité réservée aux abonnés PRO.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrer par fournisseur
            </label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Tous les fournisseurs</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={exportSupplierReport}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
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
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <SupplierDashboard />
      )}

      {/* Suppliers Tab */}
      {activeTab === 'suppliers' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Fournisseurs</h2>
            <button
              onClick={() => navigate('/suppliers')}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un Fournisseur</span>
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              💡 <strong>Information :</strong> Pour ajouter, modifier ou consulter les détails d'un fournisseur, 
              utilisez la section dédiée "Fournisseurs" dans le menu principal.
            </p>
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Rechercher par nom, ICE ou email..."
              />
            </div>
          </div>

          {/* Suppliers Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fournisseur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Achats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Paiements
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {searchFilteredSuppliers.map((supplier) => {
                    const stats = getSupplierStats(supplier.id);
                    
                    return (
                      <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                            <div className="text-xs text-gray-500">ICE: {supplier.ice}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{supplier.contactPerson}</div>
                          <div className="text-xs text-gray-500">{supplier.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {stats.totalPurchases.toLocaleString()} MAD
                          </div>
                          <div className="text-xs text-gray-500">
                            {stats.ordersCount} commande{stats.ordersCount > 1 ? 's' : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {stats.totalPayments.toLocaleString()} MAD
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-bold ${
                            stats.balance > 0 ? 'text-red-600' : stats.balance < 0 ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {stats.balance.toLocaleString()} MAD
                          </div>
                          <div className="text-xs text-gray-500">
                            {stats.balance > 0 ? 'À payer' : stats.balance < 0 ? 'Crédit' : 'Soldé'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => setEditingSupplier(supplier.id)}
                              className="text-amber-600 hover:text-amber-700 transition-colors"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSupplier(supplier.id)}
                              className="text-red-600 hover:text-red-700 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {searchFilteredSuppliers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun fournisseur trouvé</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Commandes d'Achat</h2>
            <button
              onClick={() => setIsAddOrderModalOpen(true)}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle Commande</span>
            </button>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commande
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fournisseur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant TTC
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {purchaseOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.supplier.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(order.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.totalTTC.toLocaleString()} MAD
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'paid' ? 'bg-green-100 text-green-800' :
                          order.status === 'received' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'sent' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status === 'paid' ? 'Payé' :
                           order.status === 'received' ? 'Reçu' :
                           order.status === 'sent' ? 'Envoyé' : 'Brouillon'}
                        </span>
                      </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setEditingOrder(order.id)}
                      className="text-amber-600 hover:text-amber-700 transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {purchaseOrders.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucune commande d'achat</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Paiements Fournisseurs</h2>
            <button
              onClick={() => setIsAddPaymentModalOpen(true)}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Paiement</span>
            </button>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fournisseur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Référence
                    </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {supplierPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payment.supplier.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payment.paymentDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.amount.toLocaleString()} MAD
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.paymentMethod === 'virement' ? 'bg-blue-100 text-blue-800' :
                          payment.paymentMethod === 'cheque' ? 'bg-yellow-100 text-yellow-800' :
                          payment.paymentMethod === 'espece' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {payment.paymentMethod === 'virement' ? 'Virement' :
                           payment.paymentMethod === 'cheque' ? 'Chèque' :
                           payment.paymentMethod === 'espece' ? 'Espèces' : 'Carte'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.reference}
                      </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setEditingPayment(payment.id)}
                      className="text-amber-600 hover:text-amber-700 transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePayment(payment.id)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {supplierPayments.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun paiement enregistré</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}

      <AddPurchaseOrderModal 
        isOpen={isAddOrderModalOpen} 
        onClose={() => setIsAddOrderModalOpen(false)} 
      />

      <AddSupplierPaymentModal 
        isOpen={isAddPaymentModalOpen} 
        onClose={() => setIsAddPaymentModalOpen(false)} 
      />

      {editingOrder && (
        <EditPurchaseOrderModal
          isOpen={!!editingOrder}
          onClose={() => setEditingOrder(null)}
          order={purchaseOrders.find(order => order.id === editingOrder)!}
        />
      )}

      {editingPayment && (
        <EditSupplierPaymentModal
          isOpen={!!editingPayment}
          onClose={() => setEditingPayment(null)}
          payment={supplierPayments.find(payment => payment.id === editingPayment)!}
        />
      )}
    </div>
  );
}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>