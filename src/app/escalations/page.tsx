"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, XCircle, ShieldAlert, ArrowUpRight } from "lucide-react";

interface EscalationItem {
  id: string;
  caseId: string;
  reason: string;
  agentStoppingRule: string;
  recommendedHumanAction: string;
  status: string;
  createdAt: string;
  case: {
    caseNumber: string;
    amount: number;
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
  };
}

export default function EscalationsQueuePage() {
  const [escalations, setEscalations] = useState<EscalationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchEscalations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/escalations");
      const data = await res.json();
      if (data.success) setEscalations(data.escalations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalations();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      setActionMessage("Executing human approval override...");
      const res = await fetch(`/api/escalations/${id}/approve`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setActionMessage("Approved! Payment link generated and sent.");
        setTimeout(() => setActionMessage(null), 3000);
        await fetchEscalations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setActionMessage("Rejecting escalation...");
      const res = await fetch(`/api/escalations/${id}/reject`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setActionMessage("Escalation rejected and case closed.");
        setTimeout(() => setActionMessage(null), 3000);
        await fetchEscalations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
            Human Review & Escalation Queue
          </h1>
          <p className="text-xs text-[#8a99ad] mt-1">
            Cases bounded by policy rules requiring human compliance review before action execution.
          </p>
        </div>

        {actionMessage && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 animate-pulse">
            {actionMessage}
          </div>
        )}
      </div>

      {/* Escalation Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-[#8a99ad] text-sm">
          Loading escalation queue...
        </div>
      ) : escalations.length === 0 ? (
        <div className="rounded-xl bg-[#121721] border border-[#212a3a] p-12 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Escalation Queue is Empty</h3>
          <p className="text-xs text-[#8a99ad]">
            All cases are cleanly processed or within automatic policy bounds.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {escalations.map((esc) => (
            <div
              key={esc.id}
              className={`rounded-xl bg-[#121721] border p-6 space-y-4 shadow-xl relative overflow-hidden transition-all ${
                esc.status === "PENDING"
                  ? "border-rose-500/30"
                  : "border-[#212a3a] opacity-75"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm font-bold text-amber-400">
                    {esc.case.caseNumber}
                  </span>
                  <span className="text-xs text-[#8a99ad] font-mono">
                    ({esc.case.order.orderNumber})
                  </span>
                </div>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded font-semibold font-mono ${
                    esc.status === "PENDING"
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      : esc.status === "APPROVED"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                  }`}
                >
                  {esc.status}
                </span>
              </div>

              {/* Customer & Amount */}
              <div className="flex justify-between items-start bg-[#090b0e] p-3 rounded-lg border border-[#1e2633]">
                <div>
                  <div className="text-sm font-bold text-white">{esc.case.customer.name}</div>
                  <div className="text-xs text-[#6e7681]">{esc.case.customer.email}</div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] text-[#6e7681] uppercase block">Amount</span>
                  <span className="text-base font-bold text-amber-400">
                    ₹{esc.case.amount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Reason & Stopping Rule */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-rose-400 font-semibold uppercase flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    Why Agent Stopped
                  </span>
                  <p className="text-white font-medium mt-0.5">{esc.agentStoppingRule}</p>
                </div>

                <div className="p-2.5 rounded bg-[#161b22] border border-[#212a3a] text-[#c9d1d9]">
                  <strong className="text-amber-400 block text-[11px] uppercase">
                    Recommended Human Action
                  </strong>
                  <p className="mt-0.5 text-xs">{esc.recommendedHumanAction}</p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 border-t border-[#1e2633] flex items-center justify-between">
                <Link
                  href={`/cases/${esc.caseId}`}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>Inspect Case</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>

                {esc.status === "PENDING" && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleReject(esc.id)}
                      className="px-3 py-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 flex items-center space-x-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApprove(esc.id)}
                      className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-sm flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                      <span>Approve</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
