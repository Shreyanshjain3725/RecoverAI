"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, Search, Filter, ArrowUpRight } from "lucide-react";

interface AuditItem {
  id: string;
  caseId?: string;
  event: string;
  actor: string;
  details?: string;
  timestamp: string;
  case?: {
    caseNumber: string;
    amount: number;
    customer: {
      name: string;
    };
  };
}

export default function AuditTrailPage() {
  const [events, setEvents] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actorFilter, setActorFilter] = useState("ALL");

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/audit?actor=${actorFilter}&search=${encodeURIComponent(search)}`
      );
      const data = await res.json();
      if (data.success) setEvents(data.events);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [actorFilter, search]);

  const getActorBadge = (actor: string) => {
    switch (actor) {
      case "AI":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            AI
          </span>
        );
      case "POLICY":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            POLICY
          </span>
        );
      case "RAZORPAY":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            RAZORPAY
          </span>
        );
      case "HUMAN":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            HUMAN
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            SYSTEM
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
            <History className="w-6 h-6 text-indigo-400" />
            Audit Trail & Compliance Log
          </h1>
          <p className="text-xs text-[#8a99ad] mt-1">
            Complete, immutable log of system events, AI diagnoses, policy decisions, and payment API executions.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#121721] p-4 rounded-xl border border-[#212a3a]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#6e7681]" />
          <input
            type="text"
            placeholder="Search event, details, case..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-[#090b0e] border border-[#212a3a] text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#6e7681]" />
          <span className="text-xs text-[#8a99ad] font-medium">Actor Filter:</span>
          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="bg-[#090b0e] text-xs text-[#c9d1d9] border border-[#212a3a] px-3 py-2 rounded-lg focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Actors</option>
            <option value="SYSTEM">SYSTEM</option>
            <option value="AI">AI</option>
            <option value="POLICY">POLICY</option>
            <option value="RAZORPAY">RAZORPAY</option>
            <option value="HUMAN">HUMAN</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-[#121721] border border-[#212a3a] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1e2633] text-[#6e7681] font-semibold uppercase tracking-wider bg-[#0d1117]">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Event</th>
                <th className="py-3.5 px-4">Case #</th>
                <th className="py-3.5 px-4">Details</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2633] font-mono">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8a99ad]">
                    Loading audit events...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8a99ad]">
                    No audit records match the selected filter.
                  </td>
                </tr>
              ) : (
                events.map((e) => (
                  <tr key={e.id} className="hover:bg-[#161b22] transition-colors">
                    <td className="py-3.5 px-4 text-[#8a99ad]">
                      {new Date(e.timestamp).toLocaleTimeString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4">{getActorBadge(e.actor)}</td>
                    <td className="py-3.5 px-4 font-bold text-white">{e.event}</td>
                    <td className="py-3.5 px-4 text-amber-400">
                      {e.case?.caseNumber ? (
                        <Link href={`/cases/${e.caseId}`} className="hover:underline">
                          {e.case.caseNumber}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#8a99ad] max-w-md truncate font-sans text-xs">
                      {e.details || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans">
                      {e.caseId && (
                        <Link
                          href={`/cases/${e.caseId}`}
                          className="inline-flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                        >
                          <span>View decision</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
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
