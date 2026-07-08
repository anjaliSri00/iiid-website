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
  Check,
  User,
  BookOpen,
  Calendar,
  Hash,
  Tag,
  Shield,
  Users
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
  
  // Check if user is admin or internal
  const isAdminOrInternal = () => {
    if (!session?.user?.role) return false;
    const role = session.user.role;
    if (typeof role === "string") {
      return role.toLowerCase() === "admin" || role.toLowerCase() === "internal";
    }
    if (Array.isArray(role)) {
      return role.some(r => r.toLowerCase() === "admin" || r.toLowerCase() === "internal");
    }
    return false;
  };

  const isAdmin = isAdminOrInternal();
  
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

  // Fetch payments based on user role
  const fetchPayments = async () => {
    setLoading(true);
    try {
      let result;
      
      if (isAdmin) {
        // Admin/Internal - fetch all payments
        result = await paymentService.listPayments(session);
      } else {
        // Student - fetch only their own payments
        result = await paymentService.getUserPayments(session);
      }
      
      if (result.success) {
        let paymentsData = result.data || [];
        
        // Ensure we have an array
        if (!Array.isArray(paymentsData)) {
          if (typeof paymentsData === 'object' && paymentsData !== null) {
            paymentsData = Object.values(paymentsData).flat();
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
         payment.payment_code?.toLowerCase().includes(search) ||
         payment.id?.toString().includes(search) ||
         payment.user_id?.toString().includes(search) ||
         payment.course_id?.toString().includes(search) ||
         payment.partner_order_id?.toLowerCase().includes(search) ||
         payment.payment_method?.toLowerCase().includes(search) ||
         payment.status?.toLowerCase().includes(search) ||
         payment.payment_for?.toLowerCase().includes(search))
      );
      setFilteredPayments(filtered);
    }
  }, [searchTerm, payments]);

  // Copy to clipboard
  const copyToClipboard = (text) => {
    if (!text) return;
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
    }).format(parseFloat(amount));
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
      completed: "bg-emerald-100 text-emerald-700",
      failed: "bg-red-100 text-red-700",
      failure: "bg-red-100 text-red-700",
      pending: "bg-amber-100 text-amber-700",
      initiated: "bg-blue-100 text-blue-700",
      refunded: "bg-purple-100 text-purple-700",
      created: "bg-gray-100 text-gray-700",
      authorized: "bg-indigo-100 text-indigo-700"
    };
    return styles[s] || styles.created;
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const s = status?.toLowerCase();
    switch(s) {
      case 'success':
      case 'captured':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'failed':
      case 'failure':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'initiated':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'refunded':
        return <TrendingDown className="w-4 h-4 text-purple-600" />;
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
      case 'netbanking':
        return <Banknote className="w-4 h-4" />;
      case 'wallet':
        return <DollarSign className="w-4 h-4" />;
      case 'razorpay':
        return <Receipt className="w-4 h-4" />;
      default:
        return <Receipt className="w-4 h-4" />;
    }
  };

  // Get payment type label
  const getPaymentTypeLabel = (type) => {
    const labels = {
      course_enrollment: "Course Enrollment",
      subscription: "Subscription",
      service: "Service Payment"
    };
    return labels[type] || type || "N/A";
  };

  // Get user role badge
  const getRoleBadge = () => {
    if (isAdmin) {
      return (
        <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
          <Shield className="w-3 h-3" />
          Admin View
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
        <User className="w-3 h-3" />
        My Payments
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Role Badge */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isAdmin ? "Payment Management" : "My Payments"}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin 
              ? "Monitor and manage all payment transactions" 
              : "View your payment history and transaction details"}
          </p>
        </div>
        {getRoleBadge()}
      </div>

      {/* Stats Cards - Show different stats for admin vs student */}
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
                placeholder={isAdmin 
                  ? "Search by Order ID, Payment Code, User ID, Course ID..." 
                  : "Search by Order ID, Payment Code, Course ID..."}
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
                {searchTerm 
                  ? "No payments match your search" 
                  : isAdmin 
                    ? "No payments found" 
                    : "You haven't made any payments yet"}
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
                    Payment Details
                  </th>
                  {isAdmin && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
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
                    key={payment.id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedPayment(payment);
                      setShowPaymentDetail(true);
                    }}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-gray-900">
                            {payment.payment_code || `PAY-${payment.id}`}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(payment.payment_code || `PAY-${payment.id}`);
                            }}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Copy Payment Code"
                          >
                            {copied ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-gray-400" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {getPaymentTypeLabel(payment.payment_for)}
                        </p>
                        {payment.partner_order_id && (
                          <p className="text-xs text-gray-400 font-mono">
                            Razorpay: {payment.partner_order_id}
                          </p>
                        )}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            User #{payment.user_id}
                          </p>
                          <p className="text-xs text-gray-500">
                            {payment.payment_method || "N/A"}
                          </p>
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-gray-900">
                          Course #{payment.course_id}
                        </p>
                        {payment.discount && parseFloat(payment.discount) > 0 && (
                          <p className="text-xs text-emerald-600">
                            Discount: {formatCurrency(payment.discount)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(payment.amount_paid || payment.price)}
                        </p>
                        {payment.price && payment.price !== payment.amount_paid && (
                          <p className="text-xs text-gray-400 line-through">
                            {formatCurrency(payment.price)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getStatusBadge(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        {payment.status || "N/A"}
                      </span>
                      {payment.pg_source && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {payment.pg_source}
                        </p>
                      )}
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
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
                  <p className="text-xs text-gray-500">Payment Code</p>
                  <p className="text-sm font-mono text-gray-900">
                    {selectedPayment.payment_code || "N/A"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Order ID</p>
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {selectedPayment.order_id || "N/A"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Razorpay Order ID</p>
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {selectedPayment.partner_order_id || "N/A"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Payment Type</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {getPaymentTypeLabel(selectedPayment.payment_for)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Amount Paid</p>
                  <p className="text-lg font-bold text-emerald-600">
                    {formatCurrency(selectedPayment.amount_paid)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Payment Method</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                    {getPaymentMethodIcon(selectedPayment.payment_method)}
                    {selectedPayment.payment_method || "N/A"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Original Price</p>
                  <p className="text-sm text-gray-900">
                    {formatCurrency(selectedPayment.price)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Discount</p>
                  <p className="text-sm text-emerald-600">
                    {formatCurrency(selectedPayment.discount)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">PG Source</p>
                  <p className="text-sm text-gray-900">
                    {selectedPayment.pg_source || "N/A"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Created At</p>
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

              {/* User & Course Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    User Information
                  </h4>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-900">
                      <span className="text-gray-500">User ID:</span> {selectedPayment.user_id}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    Course Information
                  </h4>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-900">
                      <span className="text-gray-500">Course ID:</span> {selectedPayment.course_id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {selectedPayment.partner_txn_id && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Transaction Details</h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-900">
                      <span className="text-gray-500">Transaction ID:</span> {selectedPayment.partner_txn_id}
                    </p>
                    {selectedPayment.partner_transaction_time && (
                      <p className="text-sm text-gray-900 mt-1">
                        <span className="text-gray-500">Transaction Time:</span> {formatDate(selectedPayment.partner_transaction_time)}
                      </p>
                    )}
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