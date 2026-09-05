"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, Filter, Briefcase } from "lucide-react";

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

export default function CasesListPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/cases?status=${statusFilter}&search=${encodeURIComponent(search)}`
      );
      const data = await res.json();
      if (data.success) setCases(data.cases);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
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

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-amber-400" />
            Recovery Cases Registry
          </h1>
          <p className="text-xs text-[#8a99ad] mt-1">
            Complete database of detected revenue risk events and recovery intervention histories.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#121721] p-4 rounded-xl border border-[#212a3a]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#6e7681]" />
          <input
            type="text"
            placeholder="Search by case #, customer, order..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-[#090b0e] border border-[#212a3a] text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#6e7681]" />
          <span className="text-xs text-[#8a99ad] font-medium">Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#090b0e] text-xs text-[#c9d1d9] border border-[#212a3a] px-3 py-2 rounded-lg focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Cases</option>
            <option value="DETECTED">DETECTED</option>
            <option value="ACTION_EXECUTED">ACTION EXECUTED</option>
            <option value="RECOVERED">RECOVERED</option>
            <option value="ESCALATED">ESCALATED</option>
            <option value="BLOCKED">BLOCKED</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-[#121721] border border-[#212a3a] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1e2633] text-[#6e7681] font-semibold uppercase tracking-wider bg-[#0d1117]">
                <th className="py-3.5 px-4">Case #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Order</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Score</th>
                <th className="py-3.5 px-4">Recommendation</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2633]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#8a99ad]">
                    Loading recovery cases...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#8a99ad]">
                    No recovery cases found.
                  </td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-[#161b22] transition-colors duration-150 group"
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
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#161b22] border border-[#212a3a] text-[10px] text-amber-300 font-mono">
                        {c.payment.failureCategory}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                      {c.recoveryScore}/100
                    </td>
                    <td className="py-3.5 px-4 font-mono text-amber-400">
                      {c.decision?.recommendedAction || "-"}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(c.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/cases/${c.id}`}
                        className="inline-flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                      >
                        <span>Inspect</span>
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
