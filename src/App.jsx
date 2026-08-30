import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Zap,
  Activity,
  Award,
  Layers,
  RefreshCw,
  Sliders,
  FileText,
  Users,
  CheckCircle,
  AlertTriangle,
  Server,
  ArrowUpRight,
  Edit2,
  Building,
  PlusCircle,
  Trash2,
  Cpu,
  Wifi,
  Globe
} from 'lucide-react';
import { RevenueMarginChart, TransactionStatusDonut, ProviderLatencyChart } from './components/Charts';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://cheepper-bills-backend.vercel.app/api/v1";

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [economics, setEconomics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [providerRules, setProviderRules] = useState([]);
  const [cashbackRules, setCashbackRules] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [revenueAccounts, setRevenueAccounts] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // Revenue Account Creation Modal State
  const [showAddRevenueModal, setShowAddRevenueModal] = useState(false);
  const [revAccName, setRevAccName] = useState("");
  const [revBankName, setRevBankName] = useState("Zenith Bank");
  const [revAccNum, setRevAccNum] = useState("");
  const [revAllocPct, setRevAllocPct] = useState("80.0");
  const [revIsPrimary, setRevIsPrimary] = useState(false);

  // Platform Transactions Explorer & Stream State
  const [txSearch, setTxSearch] = useState("");
  const [txCategoryFilter, setTxCategoryFilter] = useState("ALL");
  const [txStatusFilter, setTxStatusFilter] = useState("ALL");
  const [txSortBy, setTxSortBy] = useState("NEWEST");
  const [txDateFrom, setTxDateFrom] = useState("");
  const [txDateTo, setTxDateTo] = useState("");
  const [liveStream, setLiveStream] = useState(true);

  // User & KYC Filter & Modal State
  const [userSearch, setUserSearch] = useState("");
  const [kycFilter, setKycFilter] = useState("ALL");
  const [selectedUserForKyc, setSelectedUserForKyc] = useState(null);
  const [selectedUserForWallet, setSelectedUserForWallet] = useState(null);
  const [selectedUserForTx, setSelectedUserForTx] = useState(null);
  const [userTxHistory, setUserTxHistory] = useState([]);
  const [loadingUserTx, setLoadingUserTx] = useState(false);
  const [userModalSearch, setUserModalSearch] = useState("");
  const [userModalCatFilter, setUserModalCatFilter] = useState("ALL");
  const [userModalStatusFilter, setUserModalStatusFilter] = useState("ALL");
  const [userModalSortBy, setUserModalSortBy] = useState("NEWEST");
  const [userModalDateFrom, setUserModalDateFrom] = useState("");
  const [userModalDateTo, setUserModalDateTo] = useState("");
  const [newKycTier, setNewKycTier] = useState("TIER_2");
  const [newKycStatus, setNewKycStatus] = useState("VERIFIED");
  const [adjAmount, setAdjAmount] = useState("1000");
  const [adjType, setAdjType] = useState("CREDIT");
  const [adjReason, setAdjReason] = useState("");

  // Cashback Rule Creation Modal State
  const [showCreateCbModal, setShowCreateCbModal] = useState(false);
  const [cbName, setCbName] = useState("");
  const [cbCategory, setCbCategory] = useState("ALL");
  const [cbRewardType, setCbRewardType] = useState("PERCENTAGE");
  const [cbRewardValue, setCbRewardValue] = useState("2.0");
  const [cbCondition, setCbCondition] = useState("EVERY_TRANSACTION");
  const [cbNValue, setCbNValue] = useState("3");
  const [cbThreshold, setCbThreshold] = useState("50000");
  const [cbPeak, setCbPeak] = useState("10000");
  const [cbFreq, setCbFreq] = useState("EVERY_TX");

  // Edit Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newShare, setNewShare] = useState("");
  const [newFee, setNewFee] = useState("");
  const [auditReason, setAuditReason] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [econRes, catRes, auditRes, provRulesRes, cbRulesRes, usersRes, txRes, revAccRes, healthRes] = await Promise.all([
        fetch(`${API_BASE}/admin/economics`).then(r => r.json()),
        fetch(`${API_BASE}/bills/categories`).then(r => r.json()),
        fetch(`${API_BASE}/admin/pricing/audits`).then(r => r.json()),
        fetch(`${API_BASE}/admin/provider-rules`).then(r => r.json()),
        fetch(`${API_BASE}/admin/cashback-rules`).then(r => r.json()),
        fetch(`${API_BASE}/admin/users`).then(r => r.json()),
        fetch(`${API_BASE}/admin/transactions`).then(r => r.json()),
        fetch(`${API_BASE}/admin/revenue-accounts`).then(r => r.json()),
        fetch(`${API_BASE}/admin/system-health`).then(r => r.json()),
      ]);
      setEconomics(econRes);
      setCategories(Array.isArray(catRes) ? catRes : []);
      setAudits(Array.isArray(auditRes) ? auditRes : []);
      setProviderRules(Array.isArray(provRulesRes) ? provRulesRes : []);
      setCashbackRules(Array.isArray(cbRulesRes) ? cbRulesRes : []);
      setUsersList(Array.isArray(usersRes) ? usersRes : []);
      setAllTransactions(Array.isArray(txRes) ? txRes : []);
      setRevenueAccounts(Array.isArray(revAccRes) ? revAccRes : []);
      setSystemHealth(healthRes);
    } catch (e) {
      console.error("Error fetching admin data:", e);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  // Real-time Live Stream Polling Every 5 Seconds
  useEffect(() => {
    if (!liveStream) return;
    const interval = setInterval(async () => {
      try {
        const txRes = await fetch(`${API_BASE}/admin/transactions`).then(r => r.json());
        setAllTransactions(txRes);
      } catch (e) {
        console.error("Live stream poll error:", e);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [liveStream]);

  const handleUpdateRule = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !auditReason) return;
    setSaving(true);
    try {
      const payload = {
        product_code: selectedProduct.code,
        customer_share_pct: newShare ? parseFloat(newShare) : null,
        fee: newFee ? parseFloat(newFee) : null,
        reason: auditReason
      };
      const res = await fetch(`${API_BASE}/admin/pricing/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setMsg(`Rule for ${selectedProduct.name} updated & logged to audit trail!`);
        setSelectedProduct(null);
        setNewShare("");
        setNewFee("");
        setAuditReason("");
        await fetchData();
      } else {
        const err = await res.json();
        alert(`Failed to update: ${err.detail || "Unknown error"}`);
      }
    } catch (e) {
      alert(`Error updating rule: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Flatten all products
  const allProducts = categories.flatMap(cat =>
    cat.products.map(p => ({ ...p, categoryName: cat.name }))
  );

  const [editingCbRule, setEditingCbRule] = useState(null);

  const handleSaveCashbackRule = async (e) => {
    e.preventDefault();
    if (!cbName) return;
    setSaving(true);
    try {
      const isEditing = editingCbRule !== null;
      const endpoint = isEditing ? `${API_BASE}/admin/cashback-rules/update` : `${API_BASE}/admin/cashback-rules/create`;
      const payload = {
        rule_id: isEditing ? editingCbRule.id : undefined,
        name: cbName,
        category_slug: cbCategory === "ALL" ? null : cbCategory,
        reward_type: cbRewardType,
        reward_value: parseFloat(cbRewardValue),
        condition_type: cbCondition,
        n_value: parseInt(cbNValue) || 3,
        threshold_amount: parseFloat(cbThreshold) || 50000,
        peak_amount: parseFloat(cbPeak) || 10000,
        frequency_limit: cbFreq,
        max_awards_per_user: 5
      };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setMsg(`Cashback Rule '${cbName}' ${isEditing ? 'updated' : 'created'} successfully!`);
        setShowCreateCbModal(false);
        setEditingCbRule(null);
        setCbName("");
        await fetchData();
      } else {
        const err = await res.json();
        alert(`Failed to save rule: ${err.detail || "Error"}`);
      }
    } catch (e) {
      alert(`Error saving cashback rule: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCashbackRule = async (ruleId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/cashback-rules/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rule_id: ruleId })
      });
      if (res.ok) {
        const data = await res.json();
        setMsg(data.message);
        await fetchData();
      }
    } catch (e) {
      alert(`Error toggling rule: ${e.message}`);
    }
  };

  const handleDeleteCashbackRule = async (ruleId) => {
    if (!window.confirm("Are you sure you want to delete this cashback rule?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/cashback-rules/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rule_id: ruleId })
      });
      if (res.ok) {
        const data = await res.json();
        setMsg(data.message);
        await fetchData();
      }
    } catch (e) {
      alert(`Error deleting rule: ${e.message}`);
    }
  };

  const handleSyncGatewayRates = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/admin/provider-rules/sync-rates`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setMsg(data.message || "Synced live gateway wholesale rates successfully!");
        await fetchData();
      }
    } catch (e) {
      alert(`Error syncing gateway rates: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateKyc = async (e) => {
    e.preventDefault();
    if (!selectedUserForKyc) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users/update-kyc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: selectedUserForKyc.id,
          kyc_tier: newKycTier,
          kyc_status: newKycStatus
        })
      });
      if (res.ok) {
        const data = await res.json();
        setMsg(data.message);
        setSelectedUserForKyc(null);
        await fetchData();
      }
    } catch (e) {
      alert(`Error updating KYC: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleWalletAdjustment = async (e) => {
    e.preventDefault();
    if (!selectedUserForWallet || !adjReason) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users/wallet-adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: selectedUserForWallet.id,
          amount: parseFloat(adjAmount),
          adjustment_type: adjType,
          reason: adjReason
        })
      });
      if (res.ok) {
        const data = await res.json();
        setMsg(data.message);
        setSelectedUserForWallet(null);
        setAdjReason("");
        await fetchData();
      }
    } catch (e) {
      alert(`Error adjusting wallet: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleUserSuspension = async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/users/toggle-suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId })
      });
      if (res.ok) {
        const data = await res.json();
        setMsg(data.message);
        await fetchData();
      }
    } catch (e) {
      alert(`Error toggling suspension: ${e.message}`);
    }
  };

  const handleSaveRevenueAccount = async (e) => {
    e.preventDefault();
    if (!revAccName || !revAccNum) return;
    setSaving(true);
    try {
      const payload = {
        account_name: revAccName,
        bank_name: revBankName,
        account_number: revAccNum,
        allocation_pct: parseFloat(revAllocPct),
        is_primary: revIsPrimary
      };
      const res = await fetch(`${API_BASE}/admin/revenue-accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setMsg("Company Revenue Bank Account added successfully!");
        setShowAddRevenueModal(false);
        setRevAccName("");
        setRevAccNum("");
        await fetchData();
      }
    } catch (err) {
      alert(`Error adding revenue account: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRevenueAccount = async (id) => {
    if (!window.confirm("Are you sure you want to delete this revenue account?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/revenue-accounts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMsg("Revenue account deleted successfully!");
        await fetchData();
      }
    } catch (err) {
      alert(`Error deleting revenue account: ${err.message}`);
    }
  };

  const handlePingProvider = async (code) => {
    try {
      const res = await fetch(`${API_BASE}/admin/providers/${code}/ping`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setMsg(`Pinged ${data.provider_name}: ${data.ping_status} (${data.latency_ms} ms)`);
        await fetchData();
      }
    } catch (err) {
      alert(`Ping failed: ${err.message}`);
    }
  };


  const handleOpenUserTransactions = async (user) => {
    setSelectedUserForTx(user);
    setLoadingUserTx(true);
    setUserModalSearch("");
    setUserModalCatFilter("ALL");
    setUserModalStatusFilter("ALL");
    setUserModalSortBy("NEWEST");
    setUserModalDateFrom("");
    setUserModalDateTo("");
    try {
      const res = await fetch(`${API_BASE}/admin/users/${user.id}/transactions`);
      if (res.ok) {
        const data = await res.json();
        setUserTxHistory(data);
      }
    } catch (e) {
      console.error("Error fetching user transactions:", e);
    } finally {
      setLoadingUserTx(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0F172A' }}>
      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <header className="glass-card" style={{ borderRadius: 0, padding: '16px 28px', borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: 'linear-gradient(135deg, #10B981, #06B6D4)', padding: '10px', borderRadius: '12px', display: 'flex' }}>
              <Zap style={{ color: '#fff', width: '22px', height: '22px' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Cheepper Bills <span className="gradient-text">Admin Console</span></h1>
              <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>Platform Economics, Pricing Share Rules & Routing Engine</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1E293B', padding: '6px 12px', borderRadius: '20px', border: '1px solid #334155', fontSize: '12px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
              <span style={{ color: '#94A3B8' }}>PostgreSQL + Redis: <strong style={{ color: '#10B981' }}>ONLINE</strong></span>
            </div>

            <button onClick={fetchData} style={{ background: '#1E293B', color: '#06B6D4', border: '1px solid #334155', padding: '8px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600' }}>
              <RefreshCw style={{ width: '14px', height: '14px' }} /> Refresh Data
            </button>
          </div>
        </div>
      </header>

      {/* ── CREATE / EDIT CASHBACK RULE MODAL ────────────────────────────── */}
      {showCreateCbModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '520px', padding: '28px', background: '#1E293B' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px', color: '#FFF' }}>
              🎁 {editingCbRule ? `Edit Cashback Rule: ${editingCbRule.name}` : 'Create Flexible Cashback / Bonus Rule'}
            </h3>
            <p style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '18px' }}>Configure multi-rule triggers (Percentage/Fixed, First N tx, Thresholds, Peak values, Schedules)</p>

            <form onSubmit={handleSaveCashbackRule} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Rule Name *</label>
                <input
                  type="text"
                  required
                  value={cbName}
                  onChange={e => setCbName(e.target.value)}
                  placeholder="e.g. Electricity Peak ₦10,000 Recharge Reward"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Reward Type</label>
                  <select value={cbRewardType} onChange={e => setCbRewardType(e.target.value)} style={{ width: '100%', background: '#0F172A', color: '#FFF', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (₦)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Reward Value</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={cbRewardValue}
                    onChange={e => setCbRewardValue(e.target.value)}
                    placeholder="e.g. 2.5 or 150"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Trigger Condition Criteria</label>
                <select value={cbCondition} onChange={e => setCbCondition(e.target.value)} style={{ width: '100%', background: '#0F172A', color: '#FFF', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
                  <option value="EVERY_TRANSACTION">Each / Every Transaction</option>
                  <option value="FIRST_N_TX">First N Transactions for User</option>
                  <option value="ACCUMULATED_THRESHOLD">Accumulated Spend Threshold (₦)</option>
                  <option value="PEAK_VALUE_TIER">Peak Single Transaction Value (₦)</option>
                </select>
              </div>

              {cbCondition === "FIRST_N_TX" && (
                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>First N Transactions Count</label>
                  <input type="number" value={cbNValue} onChange={e => setCbNValue(e.target.value)} style={{ width: '100%' }} />
                </div>
              )}

              {cbCondition === "ACCUMULATED_THRESHOLD" && (
                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Accumulated Spend Threshold (₦)</label>
                  <input type="number" value={cbThreshold} onChange={e => setCbThreshold(e.target.value)} style={{ width: '100%' }} />
                </div>
              )}

              {cbCondition === "PEAK_VALUE_TIER" && (
                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Peak Transaction Amount (₦)</label>
                  <input type="number" value={cbPeak} onChange={e => setCbPeak(e.target.value)} style={{ width: '100%' }} />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Target Category</label>
                  <select value={cbCategory} onChange={e => setCbCategory(e.target.value)} style={{ width: '100%', background: '#0F172A', color: '#FFF', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
                    <option value="ALL">⚡ All Services</option>
                    <option value="airtime">📱 Airtime</option>
                    <option value="data">📶 Data</option>
                    <option value="electricity">⚡ Electricity</option>
                    <option value="cable">📺 Cable TV</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Frequency Schedule</label>
                  <select value={cbFreq} onChange={e => setCbFreq(e.target.value)} style={{ width: '100%', background: '#0F172A', color: '#FFF', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
                    <option value="EVERY_TX">Every Transaction</option>
                    <option value="DAILY">Daily Limit</option>
                    <option value="WEEKLY">Weekly Limit</option>
                    <option value="MONTHLY">Monthly Limit</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <button type="button" onClick={() => setShowCreateCbModal(false)} style={{ flex: 1, background: '#0F172A', color: '#94A3B8', border: '1px solid #334155', padding: '10px', borderRadius: '10px' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ flex: 1, background: '#10B981', color: '#FFF', padding: '10px', borderRadius: '10px', fontWeight: 'bold' }}>
                  {saving ? 'Creating...' : 'Activate Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE REVENUE BANK ACCOUNT MODAL ────────────────────────────── */}
      {showAddRevenueModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '28px', background: '#1E293B' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building style={{ color: '#10B981' }} /> Add Company Revenue Bank Account
            </h3>
            <p style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '18px' }}>
              Configure company corporate bank account to receive automated margin & commission settlement payouts.
            </p>

            <form onSubmit={handleSaveRevenueAccount} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Account Description Name *</label>
                <input
                  type="text"
                  required
                  value={revAccName}
                  onChange={e => setRevAccName(e.target.value)}
                  placeholder="e.g. Cheepper Primary Corporate Revenue"
                  style={{ width: '100%', background: '#0F172A', color: '#FFF', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Bank Name *</label>
                  <select
                    value={revBankName}
                    onChange={e => setRevBankName(e.target.value)}
                    style={{ width: '100%', background: '#0F172A', color: '#FFF', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}
                  >
                    <option value="Zenith Bank">Zenith Bank</option>
                    <option value="GTBank">Guaranty Trust Bank (GTB)</option>
                    <option value="Access Bank">Access Bank</option>
                    <option value="First Bank">First Bank Nigeria</option>
                    <option value="UBA">United Bank for Africa (UBA)</option>
                    <option value="Providus Bank">Providus Bank</option>
                    <option value="Wema Bank">Wema Bank</option>
                    <option value="Standard Chartered">Standard Chartered</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>NUBAN Account Number *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={revAccNum}
                    onChange={e => setRevAccNum(e.target.value)}
                    placeholder="10-digit NUBAN"
                    style={{ width: '100%', background: '#0F172A', color: '#FFF', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Margin Allocation Share (%)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    required
                    value={revAllocPct}
                    onChange={e => setRevAllocPct(e.target.value)}
                    placeholder="e.g. 80"
                    style={{ width: '100%', background: '#0F172A', color: '#FFF', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
                  <input
                    type="checkbox"
                    id="revPrimary"
                    checked={revIsPrimary}
                    onChange={e => setRevIsPrimary(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#10B981' }}
                  />
                  <label htmlFor="revPrimary" style={{ fontSize: '12px', color: '#FFF', cursor: 'pointer' }}>Set as Primary Settlement</label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <button type="button" onClick={() => setShowAddRevenueModal(false)} style={{ flex: 1, background: '#0F172A', color: '#94A3B8', border: '1px solid #334155', padding: '10px', borderRadius: '10px' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ flex: 1, background: '#10B981', color: '#FFF', padding: '10px', borderRadius: '10px', fontWeight: 'bold' }}>
                  {saving ? 'Saving Account...' : 'Save Bank Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ── MAIN CONTENT AREA ────────────────────────────────────────────── */}
      <main style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '28px' }}>

        {/* Toast Alert Notification */}
        {msg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', color: '#10B981', padding: '12px 18px', borderRadius: '12px', marginBottom: '24px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>✅ {msg}</span>
            <button onClick={() => setMsg("")} style={{ background: 'none', color: '#10B981', fontWeight: 'bold' }}>✕</button>
          </div>
        )}

        {/* ── TOP METRICS SUMMARY CARDS ───────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '28px' }}>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '12px', marginBottom: '10px' }}>
              <span>TOTAL BILL VOLUME</span>
              <DollarSign style={{ width: '18px', height: '18px', color: '#06B6D4' }} />
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#FFF' }}>
              ₦{economics ? parseFloat(economics.total_bill_volume).toLocaleString('en-NG', { minimumFractionDigits: 2 }) : '0.00'}
            </h3>
            <span style={{ fontSize: '11px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
              <ArrowUpRight style={{ width: '14px', height: '14px' }} /> {economics?.total_transactions_count || 0} Successful Transactions
            </span>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '12px', marginBottom: '10px' }}>
              <span>GROSS PLATFORM MARGIN</span>
              <TrendingUp style={{ width: '18px', height: '18px', color: '#10B981' }} />
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#10B981' }}>
              ₦{economics ? parseFloat(economics.gross_platform_margin).toLocaleString('en-NG', { minimumFractionDigits: 2 }) : '0.00'}
            </h3>
            <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px', display: 'block' }}>
              Retained Cheepper Revenue
            </span>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '12px', marginBottom: '10px' }}>
              <span>CUSTOMER SAVINGS PASSED</span>
              <Award style={{ width: '18px', height: '18px', color: '#8B5CF6' }} />
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#8B5CF6' }}>
              ₦{economics ? parseFloat(economics.total_customer_savings).toLocaleString('en-NG', { minimumFractionDigits: 2 }) : '0.00'}
            </h3>
            <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px', display: 'block' }}>
              Shared Provider Discounts (Sections 48–49)
            </span>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '12px', marginBottom: '10px' }}>
              <span>CASHBACK DISBURSED</span>
              <Activity style={{ width: '18px', height: '18px', color: '#F59E0B' }} />
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#F59E0B' }}>
              ₦{economics ? parseFloat(economics.total_cashback_issued).toLocaleString('en-NG', { minimumFractionDigits: 2 }) : '0.00'}
            </h3>
            <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px', display: 'block' }}>
              Reward Loyalty Wallet Credits
            </span>
          </div>

        </div>

        {/* ── NAVIGATION TABS BAR ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid #334155', paddingBottom: '12px', overflowX: 'auto' }}>
          {[
            { id: "overview", label: "Economics & Charts", icon: Activity },
            { id: "revenue", label: "Company Revenue Accounts", icon: Building },
            { id: "health", label: "API Health & System Stats", icon: Cpu },
            { id: "transactions", label: "Transactions Feed & Stream", icon: DollarSign },
            { id: "pricing", label: "Provider Wholesale Matrix", icon: Sliders },
            { id: "cashback", label: "Cashback & Bonus Engine", icon: Award },
            { id: "audits", label: "Audit Log Trail", icon: FileText },
            { id: "users", label: "Users & KYC Directory", icon: Users },
          ].map(t => {

            const IconComponent = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  background: active ? '#10B981' : '#1E293B',
                  color: active ? '#FFF' : '#94A3B8',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '1px solid ' + (active ? '#10B981' : '#334155')
                }}
              >
                <IconComponent style={{ width: '16px', height: '16px' }} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: ECONOMICS OVERVIEW & MARGINS ─────────────────────────── */}
        {activeTab === "overview" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Interactive SVG Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              <RevenueMarginChart
                volume={economics ? parseFloat(economics.total_bill_volume) : 0}
                margin={economics ? parseFloat(economics.gross_platform_margin) : 0}
                savings={economics ? parseFloat(economics.total_customer_savings) : 0}
              />
              <TransactionStatusDonut
                successCount={allTransactions.filter(t => t.status === 'SUCCESS').length || (economics?.total_transactions_count || 12)}
                failedCount={allTransactions.filter(t => t.status === 'FAILED').length || 1}
                processingCount={allTransactions.filter(t => t.status === 'PROCESSING').length || 0}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              <div className="glass-card" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Provider Breakdown &amp; Volume Share</h2>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #334155', color: '#94A3B8' }}>
                        <th style={{ padding: '12px' }}>Provider</th>
                        <th style={{ padding: '12px' }}>Status</th>
                        <th style={{ padding: '12px' }}>Success Rate</th>
                        <th style={{ padding: '12px' }}>Latency</th>
                        <th style={{ padding: '12px' }}>Volume (₦)</th>
                        <th style={{ padding: '12px' }}>Platform Margin (₦)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {economics?.provider_breakdown?.map((p, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #1E293B' }}>
                          <td style={{ padding: '12px', fontWeight: '600' }}>{p.provider_name} ({p.provider_code})</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ background: p.status === 'ACTIVE' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: p.status === 'ACTIVE' ? '#10B981' : '#EF4444', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                              {p.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px', color: '#10B981', fontWeight: 'bold' }}>{p.success_rate_pct}%</td>
                          <td style={{ padding: '12px', color: '#94A3B8' }}>{p.avg_latency_ms} ms</td>
                          <td style={{ padding: '12px' }}>₦{p.transaction_volume?.toLocaleString()}</td>
                          <td style={{ padding: '12px', color: '#06B6D4', fontWeight: 'bold' }}>₦{p.platform_margin_earned?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="glass-card" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Economic Allocation Summary</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ background: '#0F172A', padding: '14px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>Provider Wholesale Discounts</span>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#06B6D4', margin: '4px 0 0' }}>
                      ₦{economics ? parseFloat(economics.total_provider_discounts).toLocaleString() : '0.00'}
                    </p>
                  </div>
                  <div style={{ background: '#0F172A', padding: '14px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>Customer Discount Share</span>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#8B5CF6', margin: '4px 0 0' }}>
                      ₦{economics ? parseFloat(economics.total_customer_savings).toLocaleString() : '0.00'}
                    </p>
                  </div>
                  <div style={{ background: '#0F172A', padding: '14px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>Net Platform Retained Margin</span>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#10B981', margin: '4px 0 0' }}>
                      ₦{economics ? parseFloat(economics.gross_platform_margin).toLocaleString() : '0.00'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: COMPANY REVENUE GENERATION BANK ACCOUNTS ──────────────── */}
        {activeTab === "revenue" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFF' }}>Company Revenue Generation Accounts</h2>
                <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                  Manage corporate bank accounts receiving automated margin & commission settlement payouts.
                </p>
              </div>
              <button
                onClick={() => setShowAddRevenueModal(true)}
                style={{ background: '#10B981', color: '#FFF', padding: '10px 18px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
              >
                <PlusCircle style={{ width: '16px', height: '16px' }} /> Add Revenue Bank Account
              </button>
            </div>

            {/* Total Revenue Accumulated Summary Card */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
              <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #10B981' }}>
                <span style={{ fontSize: '11px', color: '#94A3B8', letterSpacing: '1px' }}>TOTAL SETTLED PLATFORM REVENUE</span>
                <h3 style={{ fontSize: '26px', fontWeight: '800', color: '#10B981', margin: '6px 0' }}>
                  ₦{economics ? parseFloat(economics.gross_platform_margin).toLocaleString('en-NG', { minimumFractionDigits: 2 }) : '0.00'}
                </h3>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>Automated double-entry settlement to company accounts</span>
              </div>

              <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #06B6D4' }}>
                <span style={{ fontSize: '11px', color: '#94A3B8', letterSpacing: '1px' }}>ACTIVE REVENUE ACCOUNTS</span>
                <h3 style={{ fontSize: '26px', fontWeight: '800', color: '#06B6D4', margin: '6px 0' }}>
                  {revenueAccounts.length} Corporate Accounts
                </h3>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>Zenith, GTB, Providus & Access Bank routing</span>
              </div>
            </div>

            {/* Revenue Accounts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
              {revenueAccounts.map((acc) => (
                <div key={acc.id} className="glass-card" style={{ padding: '24px', position: 'relative', border: acc.is_primary ? '1px solid #10B981' : '1px solid #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Building style={{ color: '#10B981', width: '24px', height: '24px' }} />
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#FFF', margin: 0 }}>{acc.account_name}</h4>
                        <span style={{ fontSize: '12px', color: '#94A3B8' }}>{acc.bank_name}</span>
                      </div>
                    </div>
                    {acc.is_primary && (
                      <span style={{ background: 'rgba(16,185,129,0.2)', color: '#10B981', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold' }}>
                        PRIMARY SETTLEMENT
                      </span>
                    )}
                  </div>

                  <div style={{ background: '#0F172A', padding: '14px', borderRadius: '12px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '10px', color: '#94A3B8', letterSpacing: '1px' }}>NUBAN ACCOUNT NUMBER</span>
                    <div style={{ fontSize: '22px', fontWeight: '900', color: '#10B981', letterSpacing: '2px', marginTop: '2px' }}>
                      {acc.account_number}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px solid #1E293B', paddingBottom: '10px', marginBottom: '14px' }}>
                    <span style={{ color: '#94A3B8' }}>Margin Share Allocation:</span>
                    <span style={{ color: '#06B6D4', fontWeight: 'bold' }}>{acc.allocation_pct}%</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '16px' }}>
                    <span style={{ color: '#94A3B8' }}>Accumulated Balance:</span>
                    <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '14px' }}>
                      ₦{parseFloat(acc.accumulated_balance).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteRevenueAccount(acc.id)}
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', width: '100%', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Trash2 style={{ width: '14px', height: '14px' }} /> Delete Revenue Account
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: API HEALTH & SYSTEM MONITORING ──────────────────────────── */}
        {activeTab === "health" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Health Header Banner */}
            <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(6,182,212,0.08) 100%)', border: '1px solid rgba(16,185,129,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
                    <span style={{ color: '#10B981', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>ALL SYSTEMS OPERATIONAL</span>
                  </div>
                  <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#FFF' }}>API Provider Health & System Status</h2>
                  <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                    Real-time monitoring of wholesale billing APIs (VTU_NG, EBILLS_AFRICA, VTPASS), gateway latencies, and automated failover priority.
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: '#10B981' }}>{systemHealth?.uptime_pct || 99.98}%</div>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>30-Day Platform Uptime</span>
                </div>
              </div>
            </div>

            {/* Provider Latency Chart */}
            <ProviderLatencyChart providers={systemHealth?.providers_health || []} />

            {/* API Providers Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {systemHealth?.providers_health?.map((p) => (
                <div key={p.code} className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#FFF' }}>{p.name}</h4>
                    <span style={{ background: p.status === 'ACTIVE' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: p.status === 'ACTIVE' ? '#10B981' : '#EF4444', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                      {p.status}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ background: '#0F172A', padding: '10px', borderRadius: '10px' }}>
                      <span style={{ fontSize: '10px', color: '#94A3B8' }}>AVG LATENCY</span>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: p.avg_latency_ms < 350 ? '#10B981' : '#F59E0B' }}>
                        {p.avg_latency_ms} ms
                      </div>
                    </div>

                    <div style={{ background: '#0F172A', padding: '10px', borderRadius: '10px' }}>
                      <span style={{ fontSize: '10px', color: '#94A3B8' }}>SUCCESS RATE</span>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#10B981' }}>
                        {p.success_rate_pct}%
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginBottom: '14px' }}>
                    <span>Failover Priority: Rank #{p.priority}</span>
                    <span>Failures: {p.failure_count}</span>
                  </div>

                  <button
                    onClick={() => handlePingProvider(p.code)}
                    style={{ background: '#1E293B', color: '#06B6D4', border: '1px solid #334155', width: '100%', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Wifi style={{ width: '14px', height: '14px' }} /> Ping API Provider
                  </button>
                </div>
              ))}
            </div>

            {/* Core Infrastructure Components */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#FFF', marginBottom: '16px' }}>
                Core Infrastructure & Service Health Checks
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #334155', color: '#94A3B8' }}>
                      <th style={{ padding: '10px' }}>Component Name</th>
                      <th style={{ padding: '10px' }}>Type</th>
                      <th style={{ padding: '10px' }}>Status</th>
                      <th style={{ padding: '10px' }}>Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {systemHealth?.infrastructure_health?.map((c, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #1E293B' }}>
                        <td style={{ padding: '10px', color: '#FFF', fontWeight: '600' }}>{c.name}</td>
                        <td style={{ padding: '10px', color: '#94A3B8', fontSize: '11px' }}>{c.type}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{ background: 'rgba(16,185,129,0.2)', color: '#10B981', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                            {c.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px', color: '#10B981', fontWeight: 'bold' }}>{c.latency_ms} ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}


        {/* ── TAB: GLOBAL PLATFORM TRANSACTIONS FEED & STREAM ───────────────── */}
        {activeTab === "transactions" && (
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Global Platform Transactions Feed & Real-time Audit Stream</h2>
                <p style={{ fontSize: '12px', color: '#94A3B8' }}>Filter by service type, search references, sort by volume/margins, and inspect live transactions</p>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  onClick={() => setLiveStream(!liveStream)}
                  style={{
                    background: liveStream ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    color: liveStream ? '#10B981' : '#EF4444',
                    border: '1px solid ' + (liveStream ? '#10B981' : '#EF4444'),
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: liveStream ? '#10B981' : '#EF4444', display: 'inline-block' }}></span>
                  {liveStream ? '🟢 LIVE STREAM ON (5s)' : '🔴 LIVE STREAM OFF'}
                </button>

                <span style={{ fontSize: '12px', color: '#06B6D4', background: 'rgba(6,182,212,0.15)', padding: '6px 12px', borderRadius: '8px', fontWeight: '600' }}>
                  {allTransactions.length} Total Platform Payments
                </span>
              </div>
            </div>

            {/* Controls Bar: Search, Category Filters, Status & Sort */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '20px', alignItems: 'center' }}>
              <input
                type="text"
                value={txSearch}
                onChange={e => setTxSearch(e.target.value)}
                placeholder="Search by customer, ref ID, gateway ref, or meter/phone number..."
                style={{ flex: 1, minWidth: '240px', padding: '10px 14px', borderRadius: '10px', background: '#0F172A', border: '1px solid #334155', color: '#FFF', fontSize: '13px' }}
              />

              {/* Service Category Filters — dynamic from DB */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[{ slug: 'ALL', name: 'ALL' }, ...categories.map(c => ({ slug: c.slug, name: c.name }))].map(({ slug, name }) => (
                  <button
                    key={slug}
                    onClick={() => setTxCategoryFilter(slug)}
                    style={{
                      background: txCategoryFilter === slug ? '#06B6D4' : '#1E293B',
                      color: txCategoryFilter === slug ? '#FFF' : '#94A3B8',
                      border: '1px solid ' + (txCategoryFilter === slug ? '#06B6D4' : '#334155'),
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <select
                value={txStatusFilter}
                onChange={e => setTxStatusFilter(e.target.value)}
                style={{ background: '#0F172A', color: '#FFF', padding: '8px 12px', borderRadius: '8px', border: '1px solid #334155', fontSize: '12px' }}
              >
                <option value="ALL">Status: ALL</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="PENDING">PENDING</option>
                <option value="FAILED">FAILED</option>
              </select>

              {/* Sort Dropdown */}
              <select
                value={txSortBy}
                onChange={e => setTxSortBy(e.target.value)}
                style={{ background: '#0F172A', color: '#FFF', padding: '8px 12px', borderRadius: '8px', border: '1px solid #334155', fontSize: '12px' }}
              >
                <option value="NEWEST">Sort: Newest First</option>
                <option value="OLDEST">Sort: Oldest First</option>
                <option value="AMOUNT_DESC">Sort: Highest Amount</option>
                <option value="AMOUNT_ASC">Sort: Lowest Amount</option>
                <option value="MARGIN_DESC">Sort: Highest Margin</option>
              </select>

              {/* Date Range Filter */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ color: '#94A3B8', fontSize: '11px', whiteSpace: 'nowrap' }}>📅 From:</span>
                <input
                  type="date"
                  value={txDateFrom}
                  onChange={e => setTxDateFrom(e.target.value)}
                  style={{ background: '#0F172A', color: '#FFF', padding: '7px 10px', borderRadius: '8px', border: '1px solid #334155', fontSize: '12px' }}
                />
                <span style={{ color: '#94A3B8', fontSize: '11px' }}>To:</span>
                <input
                  type="date"
                  value={txDateTo}
                  onChange={e => setTxDateTo(e.target.value)}
                  style={{ background: '#0F172A', color: '#FFF', padding: '7px 10px', borderRadius: '8px', border: '1px solid #334155', fontSize: '12px' }}
                />
                {(txDateFrom || txDateTo) && (
                  <button
                    onClick={() => { setTxDateFrom(""); setTxDateTo(""); }}
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid #EF4444', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}
                  >
                    ✕ Clear
                  </button>
                )}
              </div>
            </div>

            {/* Transactions Stream Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94A3B8' }}>
                    <th style={{ padding: '12px' }}>Date & Ref</th>
                    <th style={{ padding: '12px' }}>Customer</th>
                    <th style={{ padding: '12px' }}>Service / Category</th>
                    <th style={{ padding: '12px' }}>Account / Phone</th>
                    <th style={{ padding: '12px' }}>Face Value & Fee</th>
                    <th style={{ padding: '12px' }}>Savings & Cashback</th>
                    <th style={{ padding: '12px' }}>Retained Profit</th>
                    <th style={{ padding: '12px' }}>Final Paid</th>
                    <th style={{ padding: '12px' }}>Gateway Route</th>
                    <th style={{ padding: '12px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allTransactions
                    .filter(tx => {
                      if (txCategoryFilter === "ALL") return true;
                      return tx.category_slug && tx.category_slug === txCategoryFilter;
                    })
                    .filter(tx => {
                      if (txStatusFilter === "ALL") return true;
                      return tx.status === txStatusFilter;
                    })
                    .filter(tx => {
                      if (!txSearch) return true;
                      const q = txSearch.toLowerCase();
                      return (
                        tx.user_name.toLowerCase().includes(q) ||
                        tx.user_email.toLowerCase().includes(q) ||
                        tx.reference.toLowerCase().includes(q) ||
                        (tx.provider_reference && tx.provider_reference.toLowerCase().includes(q)) ||
                        tx.account_number.includes(q)
                      );
                    })
                    .filter(tx => {
                      const txDate = new Date(tx.created_at);
                      if (txDateFrom && txDate < new Date(txDateFrom)) return false;
                      if (txDateTo && txDate > new Date(txDateTo + 'T23:59:59')) return false;
                      return true;
                    })
                    .sort((a, b) => {
                      if (txSortBy === "NEWEST") return new Date(b.created_at) - new Date(a.created_at);
                      if (txSortBy === "OLDEST") return new Date(a.created_at) - new Date(b.created_at);
                      if (txSortBy === "AMOUNT_DESC") return b.amount - a.amount;
                      if (txSortBy === "AMOUNT_ASC") return a.amount - b.amount;
                      if (txSortBy === "MARGIN_DESC") return b.cheepper_margin_amount - a.cheepper_margin_amount;
                      return 0;
                    })
                    .map(tx => (
                      <tr key={tx.id} style={{ borderBottom: '1px solid #1E293B' }}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 'bold', color: '#FFF' }}>{new Date(tx.created_at).toLocaleString()}</div>
                          <div style={{ fontSize: '10px', color: '#06B6D4' }}>{tx.reference}</div>
                        </td>

                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 'bold', color: '#F8FAFC' }}>{tx.user_name}</div>
                          <div style={{ fontSize: '10px', color: '#64748B' }}>{tx.user_email}</div>
                        </td>

                        <td style={{ padding: '12px' }}>
                          <span style={{ background: 'rgba(6,182,212,0.15)', color: '#06B6D4', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', display: 'inline-block', marginBottom: '2px' }}>
                            {tx.category_slug ? tx.category_slug.toUpperCase() : 'BILL'}
                          </span>
                          <div style={{ fontWeight: '600', color: '#FFF' }}>{tx.product_name}</div>
                        </td>

                        <td style={{ padding: '12px', color: '#94A3B8', fontWeight: '500' }}>
                          {tx.account_number}
                        </td>

                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 'bold', color: '#FFF' }}>₦{tx.amount.toLocaleString()}</div>
                          <div style={{ fontSize: '10px', color: '#94A3B8' }}>Fee: ₦{tx.fee.toLocaleString()}</div>
                        </td>

                        <td style={{ padding: '12px' }}>
                          <div style={{ color: '#8B5CF6' }}>Savings: ₦{tx.customer_discount_amount.toLocaleString()}</div>
                          <div style={{ color: '#10B981', fontSize: '11px' }}>Earned: +₦{tx.cashback_earned.toLocaleString()}</div>
                        </td>

                        <td style={{ padding: '12px', color: '#10B981', fontWeight: 'bold' }}>
                          ₦{tx.cheepper_margin_amount.toLocaleString()}
                        </td>

                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#FFF' }}>
                          ₦{tx.final_amount.toLocaleString()}
                        </td>

                        <td style={{ padding: '12px' }}>
                          <span style={{ background: '#0F172A', color: '#94A3B8', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', border: '1px solid #334155', fontWeight: '600' }}>
                            {tx.provider_code}
                          </span>
                        </td>

                        <td style={{ padding: '12px' }}>
                          <span style={{ background: tx.status === 'SUCCESS' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: tx.status === 'SUCCESS' ? '#10B981' : '#EF4444', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 2: API SERVICE PROVIDERS WHOLESALE RULES MATRIX ───────────────── */}
        {activeTab === "pricing" && (
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Upstream API Service Providers & Wholesale Discount Rules</h2>
                <p style={{ fontSize: '12px', color: '#94A3B8' }}>Wholesale rates, platform fees, and category margins published by integrated bill API gateways</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  onClick={handleSyncGatewayRates}
                  disabled={saving}
                  style={{ background: '#06B6D4', color: '#FFF', border: 'none', padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw style={{ width: '14px', height: '14px' }} /> Sync Gateway Rates (API)
                </button>
                <span style={{ fontSize: '12px', color: '#10B981', background: 'rgba(16,185,129,0.15)', padding: '6px 12px', borderRadius: '8px', fontWeight: '600' }}>
                  {providerRules.length} Active API Service Gateways
                </span>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94A3B8' }}>
                    <th style={{ padding: '12px' }}>Provider</th>
                    <th style={{ padding: '12px' }}>Airtime</th>
                    <th style={{ padding: '12px' }}>Data</th>
                    <th style={{ padding: '12px' }}>Electricity</th>
                    <th style={{ padding: '12px' }}>Cable TV</th>
                    <th style={{ padding: '12px' }}>Education</th>
                    <th style={{ padding: '12px' }}>Overall</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {providerRules.map(p => {
                    const stars = "⭐".repeat(p.rating_stars || 5);
                    return (
                      <tr key={p.code} style={{ borderBottom: '1px solid #1E293B' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#F8FAFC' }}>
                          {p.name}
                          <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 'normal' }}>{p.code}</div>
                        </td>
                        <td style={{ padding: '12px', color: '#10B981' }}>{p.airtime_rule}</td>
                        <td style={{ padding: '12px', color: '#06B6D4' }}>{p.data_rule}</td>
                        <td style={{ padding: '12px', color: '#F59E0B' }}>{p.electricity_rule}</td>
                        <td style={{ padding: '12px', color: '#8B5CF6' }}>{p.cable_rule}</td>
                        <td style={{ padding: '12px', color: '#EC4899' }}>{p.education_rule}</td>
                        <td style={{ padding: '12px', fontSize: '12px' }}>{stars}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              setSelectedProduct(p);
                              setNewShare(p.airtime_rule);
                              setNewFee(p.electricity_rule);
                              setAuditReason("");
                            }}
                            style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid #10B981', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Edit2 style={{ width: '12px', height: '12px' }} /> Modify Rule
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: CASHBACK & BONUS ENGINE (Flexible Multi-Rule Matrix) ─────── */}
        {activeTab === "cashback" && (
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Flexible Cashback & Bonus Rule Engine</h2>
                <p style={{ fontSize: '12px', color: '#94A3B8' }}>Percentage/Fixed rewards, First/Last N tx, Accumulated spend thresholds, Peak values & Frequency schedules</p>
              </div>
              <button
                onClick={() => {
                  setEditingCbRule(null);
                  setCbName("");
                  setCbCategory("ALL");
                  setCbRewardType("PERCENTAGE");
                  setCbRewardValue("2.0");
                  setCbCondition("EVERY_TRANSACTION");
                  setShowCreateCbModal(true);
                }}
                style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Award style={{ width: '16px', height: '16px' }} /> + Create Cashback Rule
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94A3B8' }}>
                    <th style={{ padding: '12px' }}>Rule Name</th>
                    <th style={{ padding: '12px' }}>Target Category</th>
                    <th style={{ padding: '12px' }}>Reward Structure</th>
                    <th style={{ padding: '12px' }}>Trigger Condition</th>
                    <th style={{ padding: '12px' }}>Frequency Window</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cashbackRules.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #1E293B' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#F8FAFC' }}>{r.name}</td>
                      <td style={{ padding: '12px', color: '#06B6D4' }}>{r.category_slug ? r.category_slug.toUpperCase() : '⚡ All Services'}</td>
                      <td style={{ padding: '12px', color: '#10B981', fontWeight: 'bold' }}>
                        {r.reward_type === 'PERCENTAGE' ? `${r.reward_value}% Cashback` : `₦${r.reward_value.toLocaleString()} Bonus`}
                      </td>
                      <td style={{ padding: '12px', color: '#F59E0B' }}>
                        {r.condition_type === 'EVERY_TRANSACTION' && 'Every Transaction'}
                        {r.condition_type === 'FIRST_N_TX' && `First ${r.n_value} Transactions`}
                        {r.condition_type === 'ACCUMULATED_THRESHOLD' && `Accumulated spend ≥ ₦${r.threshold_amount?.toLocaleString()}`}
                        {r.condition_type === 'PEAK_VALUE_TIER' && `Peak single tx ≥ ₦${r.peak_amount?.toLocaleString()}`}
                      </td>
                      <td style={{ padding: '12px', color: '#8B5CF6' }}>{r.frequency_limit}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: r.is_active ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: r.is_active ? '#10B981' : '#EF4444', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                          {r.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => {
                              setEditingCbRule(r);
                              setCbName(r.name);
                              setCbCategory(r.category_slug || "ALL");
                              setCbRewardType(r.reward_type);
                              setCbRewardValue(r.reward_value.toString());
                              setCbCondition(r.condition_type);
                              setCbNValue((r.n_value || 3).toString());
                              setCbThreshold((r.threshold_amount || 50000).toString());
                              setCbPeak((r.peak_amount || 10000).toString());
                              setCbFreq(r.frequency_limit);
                              setShowCreateCbModal(true);
                            }}
                            style={{ background: 'rgba(6,182,212,0.15)', color: '#06B6D4', border: '1px solid #06B6D4', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Edit2 style={{ width: '11px', height: '11px' }} /> Edit
                          </button>

                          <button
                            onClick={() => handleToggleCashbackRule(r.id)}
                            style={{ background: r.is_active ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)', color: r.is_active ? '#F59E0B' : '#10B981', border: '1px solid ' + (r.is_active ? '#F59E0B' : '#10B981'), padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}
                          >
                            {r.is_active ? 'Pause' : 'Enable'}
                          </button>

                          <button
                            onClick={() => handleDeleteCashbackRule(r.id)}
                            style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid #EF4444', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: AUDIT LOG TRAIL ──────────────────────────────────────── */}
        {activeTab === "audits" && (
          <div className="glass-card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>Historical Audit Log Trail</h2>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '20px' }}>Immutable audit records of all pricing, discount share, and fee updates (Section 49)</p>

            {audits.length === 0 ? (
              <p style={{ color: '#94A3B8', fontSize: '13px' }}>No audit records found yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {audits.map(a => (
                  <div key={a.id} style={{ background: '#0F172A', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#06B6D4', fontWeight: 'bold', fontSize: '13px' }}>{a.product_code} · Changed {a.field_changed}</span>
                      <span style={{ color: '#94A3B8', fontSize: '11px' }}>{new Date(a.created_at).toLocaleString()}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#FFF', margin: '4px 0' }}>
                      Value changed from <code style={{ color: '#EF4444', background: 'rgba(239,68,68,0.15)', padding: '2px 6px', borderRadius: '4px' }}>{a.old_value}</code> ➔ <code style={{ color: '#10B981', background: 'rgba(16,185,129,0.15)', padding: '2px 6px', borderRadius: '4px' }}>{a.new_value}</code>
                    </p>
                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: '4px 0 0' }}>
                      <strong>Audit Reason:</strong> "{a.reason}" · <em>Admin: {a.admin_id}</em>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: PROVIDER ROUTING & HEALTH ────────────────────────────── */}
        {activeTab === "providers" && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <CheckCircle style={{ color: '#10B981' }} />
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>Provider Alpha (Primary Router)</h3>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>Baxi / Interswitch Gateway Route</span>
                </div>
              </div>
              <div style={{ background: '#0F172A', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
                <p style={{ margin: '4px 0', fontSize: '13px' }}>Status: <strong style={{ color: '#10B981' }}>ACTIVE</strong></p>
                <p style={{ margin: '4px 0', fontSize: '13px' }}>Success Rate: <strong>99.8%</strong></p>
                <p style={{ margin: '4px 0', fontSize: '13px' }}>Avg Latency: <strong>320 ms</strong></p>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <ShieldCheck style={{ color: '#06B6D4' }} />
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>Provider Beta (Failover Backup)</h3>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>VTpass / Clubkonnect Secondary Route</span>
                </div>
              </div>
              <div style={{ background: '#0F172A', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
                <p style={{ margin: '4px 0', fontSize: '13px' }}>Status: <strong style={{ color: '#10B981' }}>STANDBY / READY</strong></p>
                <p style={{ margin: '4px 0', fontSize: '13px' }}>Success Rate: <strong>99.4%</strong></p>
                <p style={{ margin: '4px 0', fontSize: '13px' }}>Avg Latency: <strong>410 ms</strong></p>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: USERS & KYC DIRECTORY ────────────────────────────────── */}
        {activeTab === "users" && (
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Customer Directory, Identity & KYC Governance</h2>
                <p style={{ fontSize: '12px', color: '#94A3B8' }}>Manage customer verification tiers (BVN/NIN), manual wallet adjustments, and fraud suspension</p>
              </div>
              <span style={{ fontSize: '12px', color: '#06B6D4', background: 'rgba(6,182,212,0.15)', padding: '6px 12px', borderRadius: '8px', fontWeight: '600' }}>
                {usersList.length} Total Customers
              </span>
            </div>

            {/* Filter & Search Toolbar */}
            <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', alignItems: 'center' }}>
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search customers by name, email, phone, BVN or NIN..."
                style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', background: '#0F172A', border: '1px solid #334155', color: '#FFF', fontSize: '13px' }}
              />

              <div style={{ display: 'flex', gap: '6px' }}>
                {["ALL", "VERIFIED", "PENDING", "REJECTED", "SUSPENDED"].map(status => (
                  <button
                    key={status}
                    onClick={() => setKycFilter(status)}
                    style={{
                      background: kycFilter === status ? '#06B6D4' : '#1E293B',
                      color: kycFilter === status ? '#FFF' : '#94A3B8',
                      border: '1px solid ' + (kycFilter === status ? '#06B6D4' : '#334155'),
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94A3B8' }}>
                    <th style={{ padding: '12px' }}>Customer Name</th>
                    <th style={{ padding: '12px' }}>Identity & Verification</th>
                    <th style={{ padding: '12px' }}>KYC Tier</th>
                    <th style={{ padding: '12px' }}>Wallet Balances</th>
                    <th style={{ padding: '12px' }}>Lifetime Volume</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList
                    .filter(u => {
                      if (kycFilter === "VERIFIED") return u.kyc_status === "VERIFIED";
                      if (kycFilter === "PENDING") return u.kyc_status === "PENDING";
                      if (kycFilter === "REJECTED") return u.kyc_status === "REJECTED";
                      if (kycFilter === "SUSPENDED") return u.is_suspended;
                      return true;
                    })
                    .filter(u => {
                      if (!userSearch) return true;
                      const q = userSearch.toLowerCase();
                      return (
                        u.full_name.toLowerCase().includes(q) ||
                        u.email.toLowerCase().includes(q) ||
                        u.phone_number.includes(q) ||
                        (u.bvn && u.bvn.includes(q)) ||
                        (u.nin && u.nin.includes(q))
                      );
                    })
                    .map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #1E293B' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#F8FAFC' }}>
                          {u.full_name}
                          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 'normal' }}>{u.email} · {u.phone_number}</div>
                        </td>

                        <td style={{ padding: '12px', fontSize: '11px' }}>
                          <div style={{ color: u.bvn !== "Not Provided" ? '#10B981' : '#64748B' }}>BVN: {u.bvn}</div>
                          <div style={{ color: u.nin !== "Not Provided" ? '#06B6D4' : '#64748B' }}>NIN: {u.nin}</div>
                        </td>

                        <td style={{ padding: '12px' }}>
                          <span style={{ background: 'rgba(6,182,212,0.15)', color: '#06B6D4', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                            {u.kyc_tier}
                          </span>
                        </td>

                        <td style={{ padding: '12px', fontSize: '12px' }}>
                          <div style={{ color: '#10B981', fontWeight: 'bold' }}>Wallet: ₦{u.wallet_balance.toLocaleString()}</div>
                          <div style={{ color: '#F59E0B', fontSize: '11px' }}>Bonus: ₦{u.cashback_balance.toLocaleString()}</div>
                        </td>

                        <td style={{ padding: '12px', fontSize: '12px' }}>
                          <div style={{ fontWeight: 'bold', color: '#FFF' }}>₦{u.total_spend_amount.toLocaleString()}</div>
                          <div style={{ fontSize: '10px', color: '#94A3B8' }}>{u.total_transactions_count} Payments</div>
                        </td>

                        <td style={{ padding: '12px' }}>
                          {u.is_suspended ? (
                            <span style={{ background: 'rgba(239,68,68,0.2)', color: '#EF4444', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                              SUSPENDED
                            </span>
                          ) : (
                            <span style={{ background: u.kyc_status === 'VERIFIED' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: u.kyc_status === 'VERIFIED' ? '#10B981' : '#F59E0B', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                              {u.kyc_status}
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => handleOpenUserTransactions(u)}
                              style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6', border: '1px solid #8B5CF6', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}
                            >
                              📜 Tx History
                            </button>

                            <button
                              onClick={() => {
                                setSelectedUserForKyc(u);
                                setNewKycTier(u.kyc_tier);
                                setNewKycStatus(u.kyc_status);
                              }}
                              style={{ background: 'rgba(6,182,212,0.15)', color: '#06B6D4', border: '1px solid #06B6D4', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}
                            >
                              Manage KYC
                            </button>

                            <button
                              onClick={() => {
                                setSelectedUserForWallet(u);
                                setAdjAmount("1000");
                                setAdjType("CREDIT");
                                setAdjReason("");
                              }}
                              style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid #10B981', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}
                            >
                              Adjust Wallet
                            </button>

                            <button
                              onClick={() => handleToggleUserSuspension(u.id)}
                              style={{ background: u.is_suspended ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: u.is_suspended ? '#10B981' : '#EF4444', border: '1px solid ' + (u.is_suspended ? '#10B981' : '#EF4444'), padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}
                            >
                              {u.is_suspended ? 'Unsuspend' : 'Suspend'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── KYC VERIFICATION & TIER MANAGEMENT MODAL ────────────────── */}
        {selectedUserForKyc && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '20px' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '28px', background: '#1E293B' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px', color: '#FFF' }}>Manage KYC: {selectedUserForKyc.full_name}</h3>
              <p style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '18px' }}>Email: {selectedUserForKyc.email} · Phone: {selectedUserForKyc.phone_number}</p>

              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '10px', marginBottom: '16px', border: '1px solid #334155', fontSize: '12px' }}>
                <div>BVN: <strong style={{ color: '#10B981' }}>{selectedUserForKyc.bvn}</strong></div>
                <div style={{ marginTop: '4px' }}>NIN: <strong style={{ color: '#06B6D4' }}>{selectedUserForKyc.nin}</strong></div>
                <div style={{ marginTop: '4px' }}>ID Document Type: <strong>{selectedUserForKyc.id_document_type}</strong></div>
              </div>

              <form onSubmit={handleUpdateKyc} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>KYC Tier Level</label>
                  <select value={newKycTier} onChange={e => setNewKycTier(e.target.value)} style={{ width: '100%', background: '#0F172A', color: '#FFF', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
                    <option value="TIER_1">Tier 1 (Basic Signup — Low Limits)</option>
                    <option value="TIER_2">Tier 2 (BVN + NIN Verified — ₦500k Daily Limit)</option>
                    <option value="TIER_3">Tier 3 (Enhanced Business — Unlimited)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Verification Decision</label>
                  <select value={newKycStatus} onChange={e => setNewKycStatus(e.target.value)} style={{ width: '100%', background: '#0F172A', color: '#FFF', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
                    <option value="VERIFIED">✅ VERIFIED & APPROVED</option>
                    <option value="PENDING">⏳ PENDING REVIEW</option>
                    <option value="REJECTED">❌ REJECTED / INVALID DOCUMENTS</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setSelectedUserForKyc(null)} style={{ flex: 1, background: '#0F172A', color: '#94A3B8', border: '1px solid #334155', padding: '10px', borderRadius: '10px' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} style={{ flex: 1, background: '#10B981', color: '#FFF', padding: '10px', borderRadius: '10px', fontWeight: 'bold' }}>
                    {saving ? 'Saving...' : 'Save Decision'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MANUAL WALLET ADJUSTMENT MODAL ────────────────────────────── */}
        {selectedUserForWallet && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '20px' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '28px', background: '#1E293B' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px', color: '#FFF' }}>💳 Admin Wallet Adjustment</h3>
              <p style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '18px' }}>Customer: <strong>{selectedUserForWallet.full_name}</strong> · Current Balance: <strong style={{ color: '#10B981' }}>₦{selectedUserForWallet.wallet_balance.toLocaleString()}</strong></p>

              <form onSubmit={handleWalletAdjustment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Adjustment Type</label>
                    <select value={adjType} onChange={e => setAdjType(e.target.value)} style={{ width: '100%', background: '#0F172A', color: '#FFF', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
                      <option value="CREDIT">➕ CREDIT WALLET</option>
                      <option value="DEBIT">➖ DEBIT WALLET</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Amount (NGN)</label>
                    <input type="number" required value={adjAmount} onChange={e => setAdjAmount(e.target.value)} style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Audit Reason <span style={{ color: '#EF4444' }}>* (Mandatory)</span></label>
                  <input
                    type="text"
                    required
                    value={adjReason}
                    onChange={e => setAdjReason(e.target.value)}
                    placeholder="e.g. Failed transaction refund, Customer compensation, Manual topup"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setSelectedUserForWallet(null)} style={{ flex: 1, background: '#0F172A', color: '#94A3B8', border: '1px solid #334155', padding: '10px', borderRadius: '10px' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} style={{ flex: 1, background: '#10B981', color: '#FFF', padding: '10px', borderRadius: '10px', fontWeight: 'bold' }}>
                    {saving ? 'Executing...' : 'Execute Adjustment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* ── EDIT RULE MODAL ─────────────────────────────────────────────── */}
      {selectedProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '28px', background: '#1E293B' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>Modify Rule: {selectedProduct.name}</h3>
            <p style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '20px' }}>Product Code: <code>{selectedProduct.code}</code></p>

            <form onSubmit={handleUpdateRule} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                  Customer Share Pct (%) — Current: <strong>{selectedProduct.customer_share_pct}%</strong>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newShare}
                  onChange={e => setNewShare(e.target.value)}
                  placeholder="e.g. 50.0"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                  Product Fee (₦) — Current: <strong>₦{selectedProduct.fee}</strong>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newFee}
                  onChange={e => setNewFee(e.target.value)}
                  placeholder="e.g. 100.00"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                  Audit Trail Reason <span style={{ color: '#EF4444' }}>* (Mandatory)</span>
                </label>
                <input
                  type="text"
                  required
                  value={auditReason}
                  onChange={e => setAuditReason(e.target.value)}
                  placeholder="Why is this pricing rule being changed?"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  style={{ flex: 1, background: '#0F172A', color: '#94A3B8', border: '1px solid #334155', padding: '12px', borderRadius: '10px', fontWeight: '600' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ flex: 1, background: '#10B981', color: '#FFF', padding: '12px', borderRadius: '10px', fontWeight: 'bold' }}
                >
                  {saving ? 'Saving...' : 'Apply & Log Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CUSTOMER TRANSACTION HISTORY MODAL ───────────────────────────── */}
      {selectedUserForTx && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1250, padding: '20px' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '920px', maxHeight: '85vh', overflowY: 'auto', padding: '28px', background: '#1E293B' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#FFF' }}>📜 Transaction History & Audit Ledger</h3>
                  <p style={{ fontSize: '12px', color: '#94A3B8', margin: '4px 0 0' }}>Customer: <strong>{selectedUserForTx.full_name}</strong> ({selectedUserForTx.email})</p>
                </div>
                <button
                  onClick={() => setSelectedUserForTx(null)}
                  style={{ background: '#0F172A', color: '#FFF', border: '1px solid #334155', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px' }}
                >
                  ✕ Close
                </button>
              </div>

              {/* Search, Filter & Sort Bar inside User Modal */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={userModalSearch}
                  onChange={e => setUserModalSearch(e.target.value)}
                  placeholder="Search ref ID, product name, or account/phone..."
                  style={{ flex: 1, minWidth: '200px', padding: '8px 12px', borderRadius: '8px', background: '#0F172A', border: '1px solid #334155', color: '#FFF', fontSize: '12px' }}
                />

                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {[{ slug: 'ALL', name: 'ALL' }, ...categories.map(c => ({ slug: c.slug, name: c.name }))].map(({ slug, name }) => (
                    <button
                      key={slug}
                      onClick={() => setUserModalCatFilter(slug)}
                      style={{
                        background: userModalCatFilter === slug ? '#06B6D4' : '#0F172A',
                        color: userModalCatFilter === slug ? '#FFF' : '#94A3B8',
                        border: '1px solid ' + (userModalCatFilter === slug ? '#06B6D4' : '#334155'),
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {name}
                    </button>
                  ))}
                </div>

                <select
                  value={userModalStatusFilter}
                  onChange={e => setUserModalStatusFilter(e.target.value)}
                  style={{ background: '#0F172A', color: '#FFF', padding: '6px 10px', borderRadius: '6px', border: '1px solid #334155', fontSize: '11px' }}
                >
                  <option value="ALL">Status: ALL</option>
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="PENDING">PENDING</option>
                  <option value="FAILED">FAILED</option>
                </select>

                <select
                  value={userModalSortBy}
                  onChange={e => setUserModalSortBy(e.target.value)}
                  style={{ background: '#0F172A', color: '#FFF', padding: '6px 10px', borderRadius: '6px', border: '1px solid #334155', fontSize: '11px' }}
                >
                  <option value="NEWEST">Newest First</option>
                  <option value="OLDEST">Oldest First</option>
                  <option value="AMOUNT_DESC">Highest Amount</option>
                  <option value="AMOUNT_ASC">Lowest Amount</option>
                  <option value="MARGIN_DESC">Highest Margin</option>
                </select>

                {/* Date Range */}
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <span style={{ color: '#94A3B8', fontSize: '10px', whiteSpace: 'nowrap' }}>📅 From:</span>
                  <input
                    type="date"
                    value={userModalDateFrom}
                    onChange={e => setUserModalDateFrom(e.target.value)}
                    style={{ background: '#0F172A', color: '#FFF', padding: '5px 8px', borderRadius: '6px', border: '1px solid #334155', fontSize: '11px' }}
                  />
                  <span style={{ color: '#94A3B8', fontSize: '10px' }}>To:</span>
                  <input
                    type="date"
                    value={userModalDateTo}
                    onChange={e => setUserModalDateTo(e.target.value)}
                    style={{ background: '#0F172A', color: '#FFF', padding: '5px 8px', borderRadius: '6px', border: '1px solid #334155', fontSize: '11px' }}
                  />
                  {(userModalDateFrom || userModalDateTo) && (
                    <button
                      onClick={() => { setUserModalDateFrom(""); setUserModalDateTo(""); }}
                      style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid #EF4444', padding: '4px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: 'bold' }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {loadingUserTx ? (
                <p style={{ color: '#06B6D4', fontSize: '13px' }}>Loading customer transaction history...</p>
              ) : userTxHistory.length === 0 ? (
                <p style={{ color: '#94A3B8', fontSize: '13px' }}>No transaction history recorded for this user yet.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #334155', color: '#94A3B8' }}>
                        <th style={{ padding: '10px' }}>Date & Reference</th>
                        <th style={{ padding: '10px' }}>Service / Account</th>
                        <th style={{ padding: '10px' }}>Face Amount & Fee</th>
                        <th style={{ padding: '10px' }}>Savings & Cashback</th>
                        <th style={{ padding: '10px' }}>Retained Margin</th>
                        <th style={{ padding: '10px' }}>Final Paid</th>
                        <th style={{ padding: '10px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userTxHistory
                        .filter(tx => {
                          if (userModalCatFilter === "ALL") return true;
                          return tx.category_slug && tx.category_slug === userModalCatFilter;
                        })
                        .filter(tx => {
                          if (userModalStatusFilter === "ALL") return true;
                          return tx.status === userModalStatusFilter;
                        })
                        .filter(tx => {
                          if (!userModalSearch) return true;
                          const q = userModalSearch.toLowerCase();
                          return (
                            tx.reference.toLowerCase().includes(q) ||
                            (tx.provider_reference && tx.provider_reference.toLowerCase().includes(q)) ||
                            tx.product_name.toLowerCase().includes(q) ||
                            tx.account_number.includes(q)
                          );
                        })
                        .filter(tx => {
                          const txDate = new Date(tx.created_at);
                          if (userModalDateFrom && txDate < new Date(userModalDateFrom)) return false;
                          if (userModalDateTo && txDate > new Date(userModalDateTo + 'T23:59:59')) return false;
                          return true;
                        })
                        .sort((a, b) => {
                          if (userModalSortBy === "NEWEST") return new Date(b.created_at) - new Date(a.created_at);
                          if (userModalSortBy === "OLDEST") return new Date(a.created_at) - new Date(b.created_at);
                          if (userModalSortBy === "AMOUNT_DESC") return b.amount - a.amount;
                          if (userModalSortBy === "AMOUNT_ASC") return a.amount - b.amount;
                          if (userModalSortBy === "MARGIN_DESC") return b.cheepper_margin_amount - a.cheepper_margin_amount;
                          return 0;
                        })
                        .map(tx => (
                        <tr key={tx.id} style={{ borderBottom: '1px solid #0F172A' }}>
                          <td style={{ padding: '10px' }}>
                            <div style={{ fontWeight: 'bold', color: '#FFF' }}>{new Date(tx.created_at).toLocaleString()}</div>
                            <div style={{ fontSize: '10px', color: '#06B6D4' }}>Ref: {tx.reference}</div>
                            {tx.provider_reference !== 'N/A' && (
                              <div style={{ fontSize: '10px', color: '#64748B' }}>Gateway Ref: {tx.provider_reference}</div>
                            )}
                          </td>

                          <td style={{ padding: '10px' }}>
                            <div style={{ color: '#F8FAFC', fontWeight: 'bold' }}>{tx.product_name}</div>
                            <div style={{ fontSize: '11px', color: '#94A3B8' }}>Acc/Phone: {tx.account_number}</div>
                          </td>

                          <td style={{ padding: '10px' }}>
                            <div style={{ fontWeight: 'bold' }}>₦{tx.amount.toLocaleString()}</div>
                            <div style={{ fontSize: '10px', color: '#94A3B8' }}>Fee: ₦{tx.fee.toLocaleString()}</div>
                          </td>

                          <td style={{ padding: '10px' }}>
                            <div style={{ color: '#8B5CF6' }}>Savings: ₦{tx.customer_discount_amount.toLocaleString()}</div>
                            <div style={{ color: '#10B981', fontSize: '11px' }}>Earned: +₦{tx.cashback_earned.toLocaleString()}</div>
                            {tx.cashback_used > 0 && (
                              <div style={{ color: '#F59E0B', fontSize: '11px' }}>Used: -₦{tx.cashback_used.toLocaleString()}</div>
                            )}
                          </td>

                          <td style={{ padding: '10px', color: '#10B981', fontWeight: 'bold' }}>
                            ₦{tx.cheepper_margin_amount.toLocaleString()}
                          </td>

                          <td style={{ padding: '10px', fontWeight: 'bold', color: '#FFF' }}>
                            ₦{tx.final_amount.toLocaleString()}
                          </td>

                          <td style={{ padding: '10px' }}>
                            <span style={{ background: tx.status === 'SUCCESS' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: tx.status === 'SUCCESS' ? '#10B981' : '#EF4444', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
}
