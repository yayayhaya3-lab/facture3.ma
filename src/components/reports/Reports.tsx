import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  BarChart3, 
  Crown,
  TrendingUp, 
  DollarSign, 
  FileText, 
  Users, 
  Package,
  Calendar,
  Download,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Target,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, differenceInDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import RevenueEvolutionChart from './charts/RevenueEvolutionChart';
import PaymentStatusChart from './charts/PaymentStatusChart';
import CashflowChart from './charts/CashflowChart';
import TopClientsChart from './charts/TopClientsChart';
import PaymentMethodChart from './charts/PaymentMethodChart';
import PaymentDelayChart from './charts/PaymentDelayChart';
import FinancialKPIs from './FinancialKPIs';
import FinancialAlerts from './FinancialAlerts';
import html2pdf from 'html2pdf.js';

export default function Reports() {
  const { t } = useLanguage();
  const { invoices, clients, products } = useData();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [compareMode, setCompareMode] = useState(false);
  const [comparePeriod, setComparePeriod] = useState('previous');
  const [activeTab, setActiveTab] = useState('overview');

  // Vérifier l'accès PRO
  const isProActive = user?.company.subscription === 'pro' && user?.company.expiryDate && 
    new Date(user.company.expiryDate) > new Date();

  if (!isProActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🔒 Fonctionnalité PRO
          </h2>
          <p className="text-gray-600 mb-6">
            La Gestion financière est réservée aux abonnés PRO. 
            Passez à la version PRO pour accéder à cette fonctionnalité avancée.
          </p>
          <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200">
            <span className="flex items-center justify-center space-x-2">
              <Crown className="w-5 h-5" />
              <span>Passer à PRO - 299 MAD/mois</span>
            </span>
          </button>
        </div>
      </div>
    );
  }

  // Fonction pour filtrer les factures selon la période
  const getFilteredInvoices = () => {
    const now = new Date();
    let startDate = new Date();

    switch (selectedPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    return invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.date);
      const matchesPeriod = invoiceDate >= startDate;
      const matchesClient = selectedClient === 'all' || invoice.clientId === selectedClient;
      const matchesProduct = selectedProduct === 'all' || 
        invoice.items.some(item => item.description === products.find(p => p.id === selectedProduct)?.name);
      const matchesPaymentMethod = selectedPaymentMethod === 'all' || 
        invoice.paymentMethod === selectedPaymentMethod;
      
      return matchesPeriod && matchesClient && matchesProduct && matchesPaymentMethod;
    });
  };

  const filteredInvoices = getFilteredInvoices();

  // Calculs des statistiques basés sur la période sélectionnée
  const paidInvoices = filteredInvoices.filter(invoice => invoice.status === 'paid');
  const unpaidInvoices = filteredInvoices.filter(invoice => invoice.status === 'unpaid');
  const collectedInvoices = filteredInvoices.filter(invoice => invoice.status === 'collected');
  
  const totalRevenue = paidInvoices.reduce((sum, invoice) => sum + invoice.totalTTC, 0);
  const unpaidRevenue = unpaidInvoices.reduce((sum, invoice) => sum + invoice.totalTTC, 0);
  const collectedRevenue = collectedInvoices.reduce((sum, invoice) => sum + invoice.totalTTC, 0);

  // Total général de toutes les factures de la période
  const totalAllInvoices = filteredInvoices.reduce((sum, invoice) => sum + invoice.totalTTC, 0);

  // Données pour les graphiques
  const revenueEvolutionData = useMemo(() => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(currentDate, i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthInvoices = invoices.filter(invoice => {
        const invoiceDate = parseISO(invoice.date);
        return invoiceDate >= monthStart && invoiceDate <= monthEnd;
      });
      
      const currentYearRevenue = monthInvoices
        .filter(inv => inv.status === 'paid' || inv.status === 'collected')
        .reduce((sum, inv) => sum + inv.totalTTC, 0);
      
      // Données année précédente
      const previousYearDate = new Date(date.getFullYear() - 1, date.getMonth(), 1);
      const prevMonthStart = startOfMonth(previousYearDate);
      const prevMonthEnd = endOfMonth(previousYearDate);
      
      const prevYearInvoices = invoices.filter(invoice => {
        const invoiceDate = parseISO(invoice.date);
        return invoiceDate >= prevMonthStart && invoiceDate <= prevMonthEnd;
      });
      
      const previousYearRevenue = prevYearInvoices
        .filter(inv => inv.status === 'paid' || inv.status === 'collected')
        .reduce((sum, inv) => sum + inv.totalTTC, 0);
      
      months.push({
        month: format(date, 'MMM', { locale: fr }),
        currentYear: currentYearRevenue,
        previousYear: previousYearRevenue,
        date: date.toISOString()
      });
    }
    
    return months;
  }, [invoices]);

  const paymentStatusData = useMemo(() => {
    const total = filteredInvoices.length;
    if (total === 0) return [];
    
    return [
      {
        name: 'Payées',
        value: paidInvoices.length,
        percentage: (paidInvoices.length / total) * 100,
        amount: totalRevenue,
        color: '#10B981'
      },
      {
        name: 'Non payées',
        value: unpaidInvoices.length,
        percentage: (unpaidInvoices.length / total) * 100,
        amount: unpaidRevenue,
        color: '#EF4444'
      },
      {
        name: 'Encaissées',
        value: collectedInvoices.length,
        percentage: (collectedInvoices.length / total) * 100,
        amount: collectedRevenue,
        color: '#F59E0B'
      }
    ];
  }, [filteredInvoices, paidInvoices, unpaidInvoices, collectedInvoices, totalRevenue, unpaidRevenue, collectedRevenue]);

  const topClientsData = useMemo(() => {
    const clientStats = clients.map(client => {
      const clientInvoices = filteredInvoices.filter(inv => inv.clientId === client.id);
      const totalAmount = clientInvoices.reduce((sum, inv) => sum + inv.totalTTC, 0);
      const paidAmount = clientInvoices
        .filter(inv => inv.status === 'paid' || inv.status === 'collected')
        .reduce((sum, inv) => sum + inv.totalTTC, 0);
      const unpaidAmount = clientInvoices
        .filter(inv => inv.status === 'unpaid')
        .reduce((sum, inv) => sum + inv.totalTTC, 0);
      
      return {
        name: client.name,
        totalAmount,
        paidAmount,
        unpaidAmount,
        invoicesCount: clientInvoices.length
      };
    }).filter(client => client.totalAmount > 0)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10);
    
    return clientStats;
  }, [clients, filteredInvoices]);

  const paymentMethodData = useMemo(() => {
    const methods = ['virement', 'espece', 'cheque', 'effet'];
    const methodStats = methods.map(method => {
      const methodInvoices = filteredInvoices.filter(inv => 
        (inv.status === 'paid' || inv.status === 'collected') && inv.paymentMethod === method
      );
      const amount = methodInvoices.reduce((sum, inv) => sum + inv.totalTTC, 0);
      
      return {
        name: method === 'virement' ? 'Virement' : 
              method === 'espece' ? 'Espèces' :
              method === 'cheque' ? 'Chèque' : 'Effet',
        value: amount,
        count: methodInvoices.length,
        percentage: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0
      };
    }).filter(method => method.value > 0);
    
    return methodStats;
  }, [filteredInvoices, totalRevenue]);

  const cashflowData = useMemo(() => {
    const futureMonths = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthName = format(date, 'MMM yyyy', { locale: fr });
      
      // Factures à échoir ce mois
      const monthUnpaidInvoices = unpaidInvoices.filter(invoice => {
        if (!invoice.dueDate) return false;
        const dueDate = parseISO(invoice.dueDate);
        return dueDate.getMonth() === date.getMonth() && dueDate.getFullYear() === date.getFullYear();
      });
      
      const expectedRevenue = monthUnpaidInvoices.reduce((sum, inv) => sum + inv.totalTTC, 0);
      
      futureMonths.push({
        month: monthName,
        expectedRevenue,
        invoicesCount: monthUnpaidInvoices.length
      });
    }
    
    return futureMonths;
  }, [unpaidInvoices]);

  const paymentDelayData = useMemo(() => {
    const delayedInvoices = unpaidInvoices.filter(invoice => {
      if (!invoice.dueDate) return false;
      const dueDate = parseISO(invoice.dueDate);
      return dueDate < new Date();
    });

    const clientDelays = clients.map(client => {
      const clientDelayedInvoices = delayedInvoices.filter(inv => inv.clientId === client.id);
      if (clientDelayedInvoices.length === 0) return null;
      
      const totalDelay = clientDelayedInvoices.reduce((sum, inv) => {
        const dueDate = parseISO(inv.dueDate!);
        return sum + differenceInDays(new Date(), dueDate);
      }, 0);
      
      const averageDelay = totalDelay / clientDelayedInvoices.length;
      const totalAmount = clientDelayedInvoices.reduce((sum, inv) => sum + inv.totalTTC, 0);
      
      return {
        clientName: client.name,
        averageDelay,
        totalAmount,
        invoicesCount: clientDelayedInvoices.length
      };
    }).filter(Boolean)
      .sort((a, b) => b!.averageDelay - a!.averageDelay)
      .slice(0, 5);
    
    return clientDelays;
  }, [clients, unpaidInvoices]);

  const stats = [
    {
      title: 'Total Factures Période',
      value: `${filteredInvoices.length}`,
      subtitle: `${totalAllInvoices.toLocaleString()} MAD`,
      icon: FileText,
      color: 'from-blue-500 to-indigo-600',
      change: `${totalAllInvoices.toLocaleString()} MAD`,
      count: filteredInvoices.length
    },
    {
      title: 'Factures Payées',
      value: `${paidInvoices.length}`,
      subtitle: `${totalRevenue.toLocaleString()} MAD`,
      icon: CheckCircle,
      color: 'from-emerald-500 to-teal-600',
      change: `${totalRevenue.toLocaleString()} MAD`,
      count: paidInvoices.length
    },
    {
      
      title: 'Factures Non Payées',
      value: `${unpaidInvoices.length}`,
      subtitle: `${unpaidRevenue.toLocaleString()} MAD`,
      icon: XCircle,
      color: 'from-red-500 to-pink-600',
      change: `${unpaidRevenue.toLocaleString()} MAD`,
      count: unpaidInvoices.length
    },
    {
      title: 'Factures Encaissées',
      value: `${collectedInvoices.length}`,
      subtitle: `${collectedRevenue.toLocaleString()} MAD`,
      icon: Clock,
      color: 'from-yellow-500 to-orange-600',
      change: `${collectedRevenue.toLocaleString()} MAD`,
      count: collectedInvoices.length
    }
  ];

  const periods = [
    { id: 'week', label: 'Cette semaine' },
    { id: 'month', label: 'Ce mois' },
    { id: 'quarter', label: 'Ce trimestre' },
    { id: 'year', label: 'Cette année' }
  ];

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'evolution', label: 'Évolution CA', icon: TrendingUp },
    { id: 'cashflow', label: 'Trésorerie', icon: DollarSign },
    { id: 'clients', label: 'Analyse Clients', icon: Users },
    { id: 'delays', label: 'Retards', icon: AlertTriangle }
  ];

  const getPeriodLabel = () => {
    const labels = {
      'week': 'cette semaine',
      'month': 'ce mois',
      'quarter': 'ce trimestre',
      'year': 'cette année'
    };
    return labels[selectedPeriod as keyof typeof labels] || 'cette période';
  };

  const handleExportPDF = () => {
    const reportContent = generateFinancialReportHTML();
    
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
      filename: `Rapport_Financier_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`,
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

  const generateFinancialReportHTML = () => {
    return `
      <div style="padding: 20px; font-family: Arial, sans-serif; background: white;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #059669; padding-bottom: 20px;">
          <h1 style="font-size: 28px; color: #059669; margin: 0; font-weight: bold;">RAPPORT FINANCIER DÉTAILLÉ</h1>
          <h2 style="font-size: 20px; color: #1f2937; margin: 10px 0; font-weight: bold;">${user?.company?.name || ''}</h2>
          <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">Généré le ${new Date().toLocaleDateString('fr-FR')} - Période: ${getPeriodLabel()}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">📊 Indicateurs Clés</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #0ea5e9;">
              <p style="font-size: 14px; color: #0c4a6e; margin: 0;"><strong>CA Total:</strong> ${totalAllInvoices.toLocaleString()} MAD</p>
            </div>
            <div style="background: #dcfce7; padding: 15px; border-radius: 8px; border: 1px solid #16a34a;">
              <p style="font-size: 14px; color: #166534; margin: 0;"><strong>CA Encaissé:</strong> ${totalRevenue.toLocaleString()} MAD</p>
            </div>
            <div style="background: #fee2e2; padding: 15px; border-radius: 8px; border: 1px solid #dc2626;">
              <p style="font-size: 14px; color: #991b1b; margin: 0;"><strong>En Attente:</strong> ${unpaidRevenue.toLocaleString()} MAD</p>
            </div>
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border: 1px solid #f59e0b;">
              <p style="font-size: 14px; color: #92400e; margin: 0;"><strong>Taux Recouvrement:</strong> ${filteredInvoices.length > 0 ? Math.round((totalRevenue / totalAllInvoices) * 100) : 0}%</p>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <span>Tableau de Bord Financier</span>
            <Crown className="w-6 h-6 text-yellow-500" />
          </h1>
          <p className="text-gray-600 mt-2">
            Analyse complète de vos performances financières avec graphiques interactifs et KPIs avancés.
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              compareMode 
                ? 'bg-purple-600 text-white' 
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Mode Comparaison</span>
          </button>
          <button 
            onClick={handleExportPDF}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Alertes financières */}
      <FinancialAlerts invoices={filteredInvoices} />

      {/* Filtres avancés */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Période
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {periods.map(period => (
                <option key={period.id} value={period.id}>{period.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Client
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">Tous les clients</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="w-4 h-4 inline mr-1" />
              Produit
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">Tous les produits</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Mode de paiement
            </label>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">Tous les modes</option>
              <option value="virement">Virement</option>
              <option value="espece">Espèces</option>
              <option value="cheque">Chèque</option>
              <option value="effet">Effet</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedClient('all');
                setSelectedProduct('all');
                setSelectedPaymentMethod('all');
                setSelectedPeriod('month');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {compareMode && (
          <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-purple-900">Mode Comparaison:</span>
              <select
                value={comparePeriod}
                onChange={(e) => setComparePeriod(e.target.value)}
                className="px-3 py-1 border border-purple-300 rounded text-sm"
              >
                <option value="previous">Période précédente</option>
                <option value="lastYear">Même période année dernière</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Navigation par onglets */}
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
                      ? 'border-blue-500 text-blue-600'
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

      {/* Contenu des onglets */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Statistiques par statut */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {stat.value}
                      </p>
                      <p className="text-sm text-gray-500">
                        {stat.subtitle}
                      </p>
                    </div>
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* KPIs Financiers */}
          <FinancialKPIs invoices={filteredInvoices} />

          {/* Graphiques de synthèse */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PaymentStatusChart data={paymentStatusData} />
            <PaymentMethodChart data={paymentMethodData} />
          </div>
        </div>
      )}

      {activeTab === 'evolution' && (
        <div className="space-y-6">
          <RevenueEvolutionChart data={revenueEvolutionData} />
          
          {/* Analyse de performance */}
          {filteredInvoices.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Analyse de Performance</h3>
                  <p className="text-sm text-gray-600">Indicateurs clés pour {getPeriodLabel()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <p className="text-lg font-bold text-emerald-600">
                      {filteredInvoices.length > 0 ? Math.round((totalRevenue / totalAllInvoices) * 100) : 0}%
                    </p>
                  </div>
                  <p className="text-sm text-emerald-700">Taux de recouvrement</p>
                  <p className="text-xs text-gray-500">Factures payées / Total</p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <p className="text-lg font-bold text-blue-600">
                      {filteredInvoices.length > 0 ? Math.round(totalAllInvoices / filteredInvoices.length).toLocaleString() : '0'}
                    </p>
                  </div>
                  <p className="text-sm text-blue-700">Panier moyen</p>
                  <p className="text-xs text-gray-500">MAD par facture</p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <p className="text-lg font-bold text-purple-600">
                      {revenueEvolutionData.length > 1 ? 
                        Math.round(revenueEvolutionData.reduce((acc, d) => acc + d.currentYear, 0) / revenueEvolutionData.length).toLocaleString() : 
                        '0'
                      }
                    </p>
                  </div>
                  <p className="text-sm text-purple-700">Moyenne mensuelle</p>
                  <p className="text-xs text-gray-500">MAD par mois</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'cashflow' && (
        <div className="space-y-6">
          <CashflowChart data={cashflowData} />
          
          {/* Résumé trésorerie */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé Trésorerie</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-2xl font-bold text-green-600">{totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-green-700">Encaissé (MAD)</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-2xl font-bold text-red-600">{unpaidRevenue.toLocaleString()}</p>
                <p className="text-sm text-red-700">À encaisser (MAD)</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-2xl font-bold text-blue-600">
                  {cashflowData.reduce((sum, item) => sum + item.expectedRevenue, 0).toLocaleString()}
                </p>
                <p className="text-sm text-blue-700">Prévisionnel 6 mois</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'clients' && (
        <div className="space-y-6">
          <TopClientsChart data={topClientsData} />
        </div>
      )}

      {activeTab === 'delays' && (
        <div className="space-y-6">
          <PaymentDelayChart data={paymentDelayData} />
        </div>
      )}

      {/* Widget de synthèse rapide */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">📊 Synthèse Rapide - {getPeriodLabel()}</h3>
            <p className="text-sm opacity-90">
              {filteredInvoices.length} factures • {Math.round((paidInvoices.length / Math.max(filteredInvoices.length, 1)) * 100)}% payées • 
              CA {totalAllInvoices > 0 ? '+' : ''}{totalAllInvoices.toLocaleString()} MAD
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{totalAllInvoices.toLocaleString()}</div>
            <div className="text-sm opacity-90">MAD Total</div>
          </div>
        </div>
      </div>
    </div>
  );
}