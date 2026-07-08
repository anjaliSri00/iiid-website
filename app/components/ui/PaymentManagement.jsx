// components/Admin/PaymentManagement.js

import { useState, useEffect } from "react";
import {
  CreditCard,
  Search,
  X,
  Loader2,
  RefreshCw,
  Eye,
  IndianRupee,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Banknote,
  Receipt,
  Copy,
  Check
} from "lucide-react";
import { toast } from "react-toastify";
import { paymentService } from "@/helper/services/paymentService";

const PaymentManagement = ({ session }) => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentDetail, setShowPaymentDetail] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPayments: 0,
    successfulPayments: 0,
    failedPayments: 0,
    pendingPayments: 0,
    refundedPayments: 0,
    averageAmount: 0,
    todayRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch payments
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const result = await paymentService.listPayments(session);
      
      if (result.success) {
        // Ensure we have an array
        let paymentsData = result.data || [];
        
        // If paymentsData is not an array, try to convert it
        if (!Array.isArray(paymentsData)) {
          if (typeof paymentsData === 'object' && paymentsData !== null) {
            paymentsData = Object.values(paymentsData);
          } else {
            paymentsData = [];
          }
        }
        
        setPayments(paymentsData);
        setFilteredPayments(paymentsData);
        
        // Calculate stats
        const statsResult = await paymentService.getPaymentStats(paymentsData);
        if (statsResult.success) {
          setStats(statsResult.data);
        }
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPayments();
  }, []);

  // Search filter
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPayments(payments);
    } else {
      const search = searchTerm.toLowerCase();
      const filtered = payments.filter(payment => 
        (payment.order_id?.toLowerCase().includes(search) ||
         payment.id?.toLowerCase().includes(search) ||
         payment.user_name?.toLowerCase().includes(search) ||
         payment.user_email?.toLowerCase().includes(search) ||
         payment.course_title?.toLowerCase().includes(search) ||
         payment.course_code?.toLowerCase().includes(search))
      );
      setFilteredPayments(filtered);
    }
  }, [searchTerm, payments]);

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    const styles = {
      success: "bg-emerald-100 text-emerald-700",
      captured: "bg-emerald-100 text-emerald-700",
      failed: "bg-red-100 text-red-700",
      pending: "bg-amber-100 text-amber-700",
      refunded: "bg-blue-100 text-blue-700",
      created: "bg-gray-100 text-gray-700",
      authorized: "bg-purple-100 text-purple-700"
    };
    return styles[s] || styles.created;
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const s = status?.toLowerCase();
    switch(s) {
      case 'success':
      case 'captured':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'refunded':
        return <TrendingDown className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    const m = method?.toLowerCase();
    switch(m) {
      case 'card':
      case 'credit card':
      case 'debit card':
        return <CreditCard className="w-4 h-4" />;
      case 'upi':
        return <Wallet className="w-4 h-4" />;
      case 'net banking':
        return <Banknote className="w-4 h-4" />;
      case 'wallet':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <Receipt className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Total Revenue</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          ) : (
            <p className="text-lg font-bold text-emerald-600">
              {formatCurrency(stats.totalRevenue)}
            </p>
          )}
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Total Payments</span>
            <Receipt className="w-4 h-4 text-blue-600" />
          </div>
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          ) : (
            <p className="text-lg font-bold text-blue-600">
              {stats.totalPayments || 0}
            </p>
          )}
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Successful</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          ) : (
            <p className="text-lg font-bold text-emerald-600">
              {stats.successfulPayments || 0}
            </p>
          )}
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Failed</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          ) : (
            <p className="text-lg font-bold text-red-600">
              {stats.failedPayments || 0}
            </p>
          )}
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Pending</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          ) : (
            <p className="text-lg font-bold text-amber-600">
              {stats.pendingPayments || 0}
            </p>
          )}
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Avg Amount</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          ) : (
            <p className="text-lg font-bold text-purple-600">
              {formatCurrency(stats.averageAmount)}
            </p>
          )}
        </div>
      </div>

      {/* Payment List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header and Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <input
                type="text"
                placeholder="Search by order ID, user, email, course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <button
              onClick={fetchPayments}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm">Refresh</span>
            </button>
          </div>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? "No payments match your search" : "No payments found"}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-2 text-sm text-red-600 hover:text-red-700"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr 
                    key={payment.id || payment.order_id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedPayment(payment);
                      setShowPaymentDetail(true);
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-900">
                          {payment.order_id || payment.id?.slice(0, 8) || "N/A"}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(payment.order_id || payment.id || "N/A");
                          }}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Copy Order ID"
                        >
                          {copied ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 text-xs font-semibold flex-shrink-0">
                          {payment.user_name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {payment.user_name || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">{payment.user_email || "N/A"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-gray-900">
                          {payment.course_title || "N/A"}
                        </p>
                        {payment.course_code && (
                          <p className="text-xs text-gray-500">{payment.course_code}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {getPaymentMethodIcon(payment.payment_method)}
                        <span className="text-sm text-gray-600 capitalize">
                          {payment.payment_method || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getStatusBadge(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        {payment.status || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(payment.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPayment(payment);
                          setShowPaymentDetail(true);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Payment Detail Modal */}
      {showPaymentDetail && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Payment Details
                </h2>
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getStatusBadge(selectedPayment.status)}`}>
                  {selectedPayment.status}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowPaymentDetail(false);
                  setSelectedPayment(null);
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {/* Payment Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Order ID</p>
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {selectedPayment.order_id || selectedPayment.id || "N/A"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Payment ID</p>
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {selectedPayment.payment_id || "N/A"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="text-lg font-bold text-emerald-600">
                    {formatCurrency(selectedPayment.amount)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Payment Method</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {selectedPayment.payment_method || "N/A"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="text-sm text-gray-900">
                    {formatDate(selectedPayment.created_at)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="text-sm text-gray-900">
                    {formatDate(selectedPayment.updated_at)}
                  </p>
                </div>
              </div>

              {/* User Info */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">User Information</h4>
                <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm text-gray-900">{selectedPayment.user_name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{selectedPayment.user_email || "N/A"}</p>
                  </div>
                  {selectedPayment.user_id && (
                    <div>
                      <p className="text-xs text-gray-500">User ID</p>
                      <p className="text-sm text-gray-900">{selectedPayment.user_id}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Course Info */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Course Information</h4>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-900">{selectedPayment.course_title || "N/A"}</p>
                  {selectedPayment.course_code && (
                    <p className="text-xs text-gray-500">Code: {selectedPayment.course_code}</p>
                  )}
                  {selectedPayment.course_id && (
                    <p className="text-xs text-gray-500">ID: {selectedPayment.course_id}</p>
                  )}
                </div>
              </div>

              {/* Payment Metadata */}
              {selectedPayment.metadata && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Additional Details</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap break-all">
                      {typeof selectedPayment.metadata === 'string' 
                        ? selectedPayment.metadata
                        : JSON.stringify(selectedPayment.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;