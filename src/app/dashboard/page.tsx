"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  AlertOctagon,
  CheckCircle2,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  BarChart2,
  Search,
  Filter,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";

interface AnalyticsData {
  metrics: {
    totalRevenueAtRisk: number;
    totalRecoveredRevenue: number;
    recoveryRate: number;
    activeCases: number;
    escalatedCases: number;
    blockedCases: number;
  };
  recoveryByFailureType: Array<{
    category: string;
    totalAtRisk: number;
    recovered: number;
    recoveryRate: number;
  }>;
  recoveryByActionType: Array<{
    action: string;
    count: number;
    recoveredAmount: number;
  }>;
  timeSeriesData: Array<{
    time: string;
    atRisk: number;
    recovered: number;
  }>;
}

interface CaseItem {
  id: string;
  caseNumber: string;
  amount: number;
  status: string;
  recoveryScore: number;
  createdAt: string;
  customer: {
    name: string;
    email: string;
  };
  order: {
    orderNumber: string;
  };
  payment: {
    failureReason: string;
    failureCategory: string;
  };
  decision?: {
    recommendedAction: string;
  };
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, casesRes] = await Promise.all([
        fetch("/api/analytics"),
        fetch(`/api/cases?status=${statusFilter}&search=${encodeURIComponent(search)}`),
      ]);
      const analyticsJson = await analyticsRes.json();
      const casesJson = await casesRes.json();

      if (analyticsJson.success) setAnalytics(analyticsJson);
      if (casesJson.success) setCases(casesJson.cases);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, search]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RECOVERED":
        return (
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            RECOVERED
          </span>
        );
      case "ESCALATED":
        return (
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            ESCALATED
          </span>
        );
      case "BLOCKED":
        return (
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            BLOCKED
          </span>
        );
      case "ACTION_EXECUTED":
        return (
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            ACTION EXECUTED
          </span>
        );
      default:
        return (
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            {status}
          </span>
        );
    }
  };

  const getActionBadge = (action?: string) => {
    if (!action) return <span className="text-xs text-[#6e7681]">-</span>;
    return (
      <span className="text-xs font-mono font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
        {action}
      </span>
    );
  };

  const metrics = analytics?.metrics || {
    totalRevenueAtRisk: 18750,
    totalRecoveredRevenue: 11250,
    recoveryRate: 60,
    activeCases: 4,
    escalatedCases: 2,
    blockedCases: 1,
  };

  const chartTimeSeries = analytics?.timeSeriesData?.length ? analytics.timeSeriesData : [
    { time: "Mon", atRisk: 5000, recovered: 1000 },
    { time: "Tue", atRisk: 9500, recovered: 3500 },
    { time: "Wed", atRisk: 14000, recovered: 6800 },
    { time: "Thu", atRisk: 17500, recovered: 9200 },
    { time: "Fri", atRisk: 18750, recovered: 11250 },
  ];

  const chartFailureTypes = analytics?.recoveryByFailureType?.length ? analytics.recoveryByFailureType : [
    { category: "Timeout", recoveryRate: 85, totalAtRisk: 10000, recovered: 8500 },
    { category: "Auth Failed", recoveryRate: 62, totalAtRisk: 5000, recovered: 3100 },
    { category: "Ins. Funds", recoveryRate: 38, totalAtRisk: 2500, recovered: 950 },
    { category: "Fraud Risk", recoveryRate: 12, totalAtRisk: 1250, recovered: 150 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Revenue Recovery Dashboard
            <span className="text-xs font-normal text-[#8a99ad] px-2 py-0.5 rounded bg-[#161b22] border border-[#212a3a]">
              Real-time Analytics
            </span>
          </h1>
          <p className="text-xs text-[#8a99ad] mt-1">
            Detect revenue at risk, diagnose root causes, and track autonomous policy-bounded recovery.
          </p>
        </div>
      </div>

      {/* Top Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Revenue at Risk */}
        <div className="rounded-xl bg-[#121721] border border-[#212a3a] p-5 space-y-2 relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between text-xs text-[#8a99ad]">
            <span>Revenue at Risk</span>
            <AlertOctagon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-400">
            ₹{metrics.totalRevenueAtRisk.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-[#6e7681]">Across failed & abandoned checkout events</div>
        </div>

        {/* Metric 2: Recovered Revenue */}
        <div className="rounded-xl bg-[#121721] border border-[#212a3a] p-5 space-y-2 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between text-xs text-[#8a99ad]">
            <span>Recovered Revenue</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400">
            ₹{metrics.totalRecoveredRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-emerald-500/80 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Autonomous recovery conversion
          </div>
        </div>

        {/* Metric 3: Recovery Rate */}
        <div className="rounded-xl bg-[#121721] border border-[#212a3a] p-5 space-y-2 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between text-xs text-[#8a99ad]">
            <span>Recovery Rate</span>
            <BarChart2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-indigo-400">
            {metrics.recoveryRate}%
          </div>
          <div className="text-[11px] text-[#6e7681]">Batch success performance</div>
        </div>

        {/* Metric 4: Active Cases */}
        <div className="rounded-xl bg-[#121721] border border-[#212a3a] p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[#8a99ad]">
            <span>Active Cases</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-cyan-400">
            {metrics.activeCases}
          </div>
          <div className="text-[11px] text-[#6e7681]">In agent recovery pipeline</div>
        </div>

        {/* Metric 5: Escalated Cases */}
        <div className="rounded-xl bg-[#121721] border border-[#212a3a] p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[#8a99ad]">
            <span>Escalated Cases</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-rose-400">
            {metrics.escalatedCases}
          </div>
          <div className="text-[11px] text-[#6e7681]">Bounded by policy rules</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Revenue at Risk vs Recovered Over Time */}
        <div className="lg:col-span-2 rounded-xl bg-[#121721] border border-[#212a3a] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Revenue Trajectory (Risk vs Recovered)
              </h3>
              <p className="text-xs text-[#8a99ad]">Cumulative recovery timeline (INR)</p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> At Risk
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Recovered
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartTimeSeries}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#6e7681" fontSize={11} />
                <YAxis stroke="#6e7681" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d1117",
                    borderColor: "#212a3a",
                    color: "#f0f6fc",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="atRisk"
                  stroke="#F59E0B"
                  fillOpacity={1}
                  fill="url(#colorRisk)"
                />
                <Area
                  type="monotone"
                  dataKey="recovered"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorRecovered)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Recovery Rate by Failure Type */}
        <div className="rounded-xl bg-[#121721] border border-[#212a3a] p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Recovery by Failure Category
            </h3>
            <p className="text-xs text-[#8a99ad]">Conversion efficiency breakdown (%)</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartFailureTypes} layout="vertical">
                <XAxis type="number" stroke="#6e7681" fontSize={11} domain={[0, 100]} />
                <YAxis dataKey="category" type="category" stroke="#6e7681" fontSize={10} width={110} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d1117",
                    borderColor: "#212a3a",
                    color: "#f0f6fc",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="recoveryRate" fill="#6366F1" radius={[0, 4, 4, 0]}>
                  {chartFailureTypes.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.recoveryRate > 70 ? "#10B981" : entry.recoveryRate > 40 ? "#F59E0B" : "#F43F5E"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Recovery Cases Table */}
      <div className="rounded-xl bg-[#121721] border border-[#212a3a] overflow-hidden shadow-xl space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1e2633]">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Recent Recovery Cases
            </h3>
            <p className="text-xs text-[#8a99ad]">
              Click any case row to inspect full AI diagnosis, policy check, and audit timeline.
            </p>
          </div>

          {/* Table Filters */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#6e7681]" />
              <input
                type="text"
                placeholder="Search case, customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[#090b0e] border border-[#212a3a] text-white focus:outline-none focus:border-amber-500/50 w-44 sm:w-60"
              />
            </div>

            <div className="flex items-center space-x-1 bg-[#090b0e] border border-[#212a3a] p-1 rounded-lg">
              <Filter className="w-3.5 h-3.5 text-[#6e7681] ml-1" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-[#c9d1d9] focus:outline-none cursor-pointer pr-2"
              >
                <option value="ALL">All Statuses</option>
                <option value="DETECTED">DETECTED</option>
                <option value="RECOVERED">RECOVERED</option>
                <option value="ESCALATED">ESCALATED</option>
                <option value="BLOCKED">BLOCKED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1e2633] text-[#6e7681] font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Case #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Failure Reason</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Recommended Action</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2633]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#8a99ad]">
                    Loading cases...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#8a99ad]">
                    No recovery cases found. Click "Simulate Failed Batch" to populate demo scenarios!
                  </td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-[#161b22] transition-colors duration-150 cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-amber-400">
                      <Link href={`/cases/${c.id}`} className="hover:underline">
                        {c.caseNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{c.customer.name}</div>
                      <div className="text-[10px] text-[#6e7681]">{c.customer.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#c9d1d9]">
                      {c.order.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      ₹{c.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-[#8a99ad]">
                      <span className="px-1.5 py-0.5 rounded bg-[#161b22] border border-[#212a3a] text-[10px] text-amber-300/90 font-mono mr-1.5">
                        {c.payment.failureCategory}
                      </span>
                      {c.payment.failureReason}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                      {c.recoveryScore}/100
                    </td>
                    <td className="py-3.5 px-4">
                      {getActionBadge(c.decision?.recommendedAction)}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(c.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/cases/${c.id}`}
                        className="inline-flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 font-semibold group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>View</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
