"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  Play,
  User,
  ShoppingBag,
  CreditCard,
  History,
} from "lucide-react";
import DecisionCard from "@/components/agent/DecisionCard";

interface CaseDetail {
  id: string;
  caseNumber: string;
  amount: number;
  status: string;
  recoveryScore: number;
  recoverability: number;
  expectedRevenue: number;
  policyDecision?: string;
  policyReason?: string;
  escalationReason?: string;
  retryCount: number;
  createdAt: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    totalSpent: number;
    ordersCount: number;
    trustScore: number;
  };
  order: {
    orderNumber: string;
    status: string;
  };
  payment: {
    paymentId: string;
    paymentMethod: string;
    failureReason?: string;
    failureCategory: string;
  };
  decision?: {
    diagnosis: string;
    riskLevel: "low" | "medium" | "high";
    recoverability: number;
    recommendedAction: string;
    reason: string;
    confidence: number;
  };
  actions: Array<{
    id: string;
    actionType: string;
    razorpayLinkId?: string;
    razorpayLinkUrl?: string;
    status: string;
    createdAt: string;
  }>;
  auditEvents: Array<{
    id: string;
    event: string;
    actor: string;
    details?: string;
    timestamp: string;
  }>;
  escalation?: {
    reason: string;
    agentStoppingRule: string;
    recommendedHumanAction: string;
    status: string;
  };
}

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params.id as string;
  const [c, setC] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  const fetchCaseDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/cases/${caseId}`);
      const data = await res.json();
      if (data.success) setC(data.case);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (caseId) fetchCaseDetail();
  }, [caseId]);

  const handleRunAgentForCase = async () => {
    try {
      setIsRunning(true);
      const res = await fetch(`/api/agent/run/${caseId}`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await fetchCaseDetail();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

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

  if (loading) {
    return (
      <div className="py-24 text-center text-[#8a99ad] text-sm">
        Loading transaction detail record...
      </div>
    );
  }

  if (!c) {
    return (
      <div className="py-24 text-center space-y-4">
        <p className="text-[#8a99ad]">Recovery case record not found.</p>
        <Link href="/cases" className="text-amber-400 text-xs hover:underline">
          Return to Cases
        </Link>
      </div>
    );
  }

  const latestAction = c.actions[c.actions.length - 1];

  return (
    <div className="space-y-6 pb-12">
      {/* Back Link & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/cases"
            className="text-xs text-[#8a99ad] hover:text-white flex items-center gap-1.5 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cases Registry
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            Case {c.caseNumber}
            <span
              className={`text-xs px-3 py-1 rounded-full font-semibold ${
                c.status === "RECOVERED"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : c.status === "ESCALATED"
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
              }`}
            >
              {c.status}
            </span>
          </h1>
        </div>

        <button
          onClick={handleRunAgentForCase}
          disabled={isRunning || c.status === "RECOVERED"}
          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center space-x-2 disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isRunning ? "Running Agent..." : "Run Agent on This Case"}</span>
        </button>
      </div>

      {/* Overview Context Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Context */}
        <div className="rounded-xl bg-[#121721] border border-[#212a3a] p-5 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#8a99ad] uppercase tracking-wider">
            <User className="w-4 h-4 text-amber-400" />
            <span>Customer Profile</span>
          </div>
          <div>
            <div className="text-base font-bold text-white">{c.customer.name}</div>
            <div className="text-xs text-[#6e7681]">{c.customer.email}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#1e2633]">
            <div>
              <span className="text-[10px] text-[#6e7681]">Prior Spent</span>
              <div className="font-mono text-white font-semibold">
                ₹{c.customer.totalSpent.toLocaleString("en-IN")}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-[#6e7681]">Trust Score</span>
              <div className="font-mono text-emerald-400 font-semibold">
                {c.customer.trustScore}/100
              </div>
            </div>
          </div>
        </div>

        {/* Order & Payment Context */}
        <div className="rounded-xl bg-[#121721] border border-[#212a3a] p-5 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#8a99ad] uppercase tracking-wider">
            <ShoppingBag className="w-4 h-4 text-indigo-400" />
            <span>Order & Payment</span>
          </div>
          <div>
            <div className="text-base font-bold text-white font-mono">{c.order.orderNumber}</div>
            <div className="text-xs text-amber-400 font-semibold font-mono">
              Amount: ₹{c.amount.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="text-xs space-y-1 pt-2 border-t border-[#1e2633]">
            <div className="text-[#8a99ad]">
              <strong className="text-white">Method:</strong> {c.payment.paymentMethod}
            </div>
            <div className="text-[#8a99ad]">
              <strong className="text-white">Reason:</strong> {c.payment.failureReason}
            </div>
          </div>
        </div>

        {/* Recovery Score & Expected Revenue */}
        <div className="rounded-xl bg-[#121721] border border-[#212a3a] p-5 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#8a99ad] uppercase tracking-wider">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Score & Recoverability</span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono text-indigo-400">
              {c.recoveryScore}
            </span>
            <span className="text-xs text-[#8a99ad]">/ 100 Recovery Score</span>
          </div>
          <div className="pt-2 border-t border-[#1e2633] space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-[#8a99ad]">Recoverability Rate:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {Math.round(c.recoverability * 100)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8a99ad]">Expected Recoverable:</span>
              <span className="font-mono text-amber-400 font-semibold">
                ₹{c.expectedRevenue.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Decision Card */}
      {c.decision && (
        <DecisionCard
          diagnosis={c.decision.diagnosis}
          riskLevel={c.decision.riskLevel}
          recoverability={c.decision.recoverability}
          recommendedAction={c.decision.recommendedAction}
          reason={c.decision.reason}
          confidence={c.decision.confidence}
          policyDecision={c.policyDecision || "APPROVED"}
          policyReason={c.policyReason || "Policy verification cleared."}
        />
      )}

      {/* Recovery Action Card */}
      {latestAction && (
        <div className="rounded-xl bg-[#121721] border border-[#212a3a] p-6 space-y-3">
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-400" />
            Executed Recovery Action: {latestAction.actionType}
          </h3>

          {latestAction.razorpayLinkUrl && (
            <div className="p-4 rounded-lg bg-[#090b0e] border border-[#1e2633] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-[#6e7681] uppercase font-semibold">
                  Razorpay Recovery Payment Link
                </span>
                <p className="text-xs font-mono text-amber-400 break-all">
                  {latestAction.razorpayLinkUrl}
                </p>
              </div>
              <a
                href={latestAction.razorpayLinkUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/20 flex items-center space-x-1.5 shrink-0"
              >
                <span>Open Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Audit Timeline */}
      <div className="rounded-xl bg-[#121721] border border-[#212a3a] p-6 space-y-4">
        <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" />
          Audit & Execution Visual Timeline
        </h3>

        <div className="space-y-4 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#1e2633]">
          {c.auditEvents.map((evt, idx) => (
            <div key={evt.id || idx} className="flex items-start space-x-4 relative pl-8">
              <div className="w-6 h-6 rounded-full bg-[#0d1117] border border-amber-500/40 flex items-center justify-center absolute left-0 top-0.5 z-10 text-amber-400">
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 bg-[#090b0e] p-3 rounded-lg border border-[#1e2633] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white">
                    {evt.event}
                  </span>
                  <div className="flex items-center space-x-2">
                    {getActorBadge(evt.actor)}
                    <span className="text-[10px] text-[#6e7681] font-mono">
                      {new Date(evt.timestamp).toLocaleTimeString("en-IN")}
                    </span>
                  </div>
                </div>
                {evt.details && (
                  <p className="text-xs text-[#8a99ad] font-mono font-normal">
                    {evt.details}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
