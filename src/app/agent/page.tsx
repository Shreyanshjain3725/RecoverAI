"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Zap,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface AgentResult {
  caseId: string;
  caseNumber: string;
  customerName: string;
  amount: number;
  status: string;
  recoveryScore: number;
  recoverability: number;
  expectedRevenue: number;
  diagnosis: string;
  recommendedAction: string;
  policyDecision: string;
  policyReason: string;
  actionExecuted: string;
  paymentLinkUrl?: string;
  logs: Array<{
    step: string;
    status: string;
    message: string;
    timestamp: string;
  }>;
}

interface BatchSummary {
  totalRevenueAtRisk: number;
  totalRecovered: number;
  recoveryRate: number;
  actionsCount: number;
  escalationsCount: number;
  blockedCount: number;
}

export default function AgentConsolePage() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<AgentResult[]>([]);
  const [summary, setSummary] = useState<BatchSummary | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [logs, setLogs] = useState<string[]>([]);

  const handleRunAgentBatch = async () => {
    setIsRunning(true);
    setResults([]);
    setSummary(null);
    setLogs([]);
    setCurrentIndex(-1);

    try {
      const res = await fetch("/api/agent/run", { method: "POST" });
      const data = await res.json();

      if (data.success && data.results) {
        // Stream results visually for hackathon live demo effect
        for (let i = 0; i < data.results.length; i++) {
          setCurrentIndex(i);
          const r: AgentResult = data.results[i];
          setLogs((prev) => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] Case ${i + 1}/${data.results.length}: ${r.caseNumber} - ${r.customerName} (₹${r.amount})`,
            `  └─ AI Diagnosis: ${r.recommendedAction} (Score: ${r.recoveryScore}/100)`,
            `  └─ Policy Engine: ${r.policyDecision} (${r.policyReason})`,
            `  └─ Outcome: ${r.status}`,
          ]);
          setResults((prev) => [...prev, r]);
          await new Promise((resolve) => setTimeout(resolve, 400));
        }

        setSummary(data.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Agent Live Run Console
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono border border-amber-500/20">
              Autonomous Execution
            </span>
          </h1>
          <p className="text-xs text-[#8a99ad] mt-1">
            Watch RecoverAI autonomously process pending payment failures, execute policy checks, and verify revenue recovery.
          </p>
        </div>

        <button
          onClick={handleRunAgentBatch}
          disabled={isRunning}
          className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center space-x-2 border border-amber-400/40 disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Processing Batch...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Recovery Agent</span>
            </>
          )}
        </button>
      </div>

      {/* Batch Summary Card (Shows after completion) */}
      {summary && (
        <div className="rounded-xl bg-[#121721] border border-emerald-500/30 p-6 space-y-4 shadow-2xl relative overflow-hidden animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white tracking-wide">
                Agent Batch Execution Completed
              </h2>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
              100% Policy Compliant
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 pt-2">
            <div className="p-3 rounded-lg bg-[#090b0e] border border-[#1e2633]">
              <span className="text-[10px] text-[#6e7681] uppercase font-semibold">Revenue at Risk</span>
              <div className="text-lg font-mono font-bold text-amber-400">
                ₹{summary.totalRevenueAtRisk.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#090b0e] border border-[#1e2633]">
              <span className="text-[10px] text-[#6e7681] uppercase font-semibold">Recovered</span>
              <div className="text-lg font-mono font-bold text-emerald-400">
                ₹{summary.totalRecovered.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#090b0e] border border-[#1e2633]">
              <span className="text-[10px] text-[#6e7681] uppercase font-semibold">Recovery Rate</span>
              <div className="text-lg font-mono font-bold text-indigo-400">
                {summary.recoveryRate}%
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#090b0e] border border-[#1e2633]">
              <span className="text-[10px] text-[#6e7681] uppercase font-semibold">Actions</span>
              <div className="text-lg font-mono font-bold text-cyan-400">
                {summary.actionsCount}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#090b0e] border border-[#1e2633]">
              <span className="text-[10px] text-[#6e7681] uppercase font-semibold">Escalations</span>
              <div className="text-lg font-mono font-bold text-rose-400">
                {summary.escalationsCount}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#090b0e] border border-[#1e2633]">
              <span className="text-[10px] text-[#6e7681] uppercase font-semibold">Policy Blocked</span>
              <div className="text-lg font-mono font-bold text-amber-500">
                {summary.blockedCount}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Console & Step Trace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Terminal Output */}
        <div className="lg:col-span-2 rounded-xl bg-[#090b0e] border border-[#1e2633] p-5 space-y-4 font-mono text-xs shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1e2633] pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="text-xs font-semibold text-[#8a99ad] ml-2">
                recoverai-agent-cli ~ stdout
              </span>
            </div>
            {isRunning && (
              <span className="text-amber-400 animate-pulse font-sans text-xs flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Executing Pipeline...
              </span>
            )}
          </div>

          <div className="h-[420px] overflow-y-auto space-y-2 pr-2 text-[#c9d1d9]">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#6e7681] space-y-2">
                <Zap className="w-8 h-8 text-amber-500/40" />
                <p>Console ready. Click "Run Recovery Agent" to start batch execution.</p>
              </div>
            ) : (
              logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed ${
                    log.includes("RECOVERED")
                      ? "text-emerald-400 font-bold"
                      : log.includes("ESCALATED")
                      ? "text-rose-400 font-semibold"
                      : log.includes("APPROVED")
                      ? "text-amber-300"
                      : "text-[#8a99ad]"
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Transaction Execution Cards */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center justify-between">
            <span>Processed Transactions</span>
            <span className="text-xs text-[#8a99ad] font-mono">{results.length} total</span>
          </h3>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {results.map((res, i) => (
              <div
                key={res.caseId}
                className={`p-4 rounded-xl bg-[#121721] border transition-all ${
                  res.status === "RECOVERED"
                    ? "border-emerald-500/30"
                    : res.status === "ESCALATED"
                    ? "border-rose-500/30"
                    : "border-[#212a3a]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs font-bold text-amber-400">
                    {res.caseNumber}
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      res.status === "RECOVERED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : res.status === "ESCALATED"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    }`}
                  >
                    {res.status}
                  </span>
                </div>

                <div className="mt-2 text-xs font-semibold text-white">
                  {res.customerName}
                </div>
                <div className="text-xs font-mono text-[#8a99ad]">
                  Amount: ₹{res.amount.toLocaleString("en-IN")} | Score: {res.recoveryScore}/100
                </div>

                <div className="mt-2 text-[11px] text-[#8a99ad] bg-[#090b0e] p-2 rounded border border-[#1e2633]">
                  <div>
                    <strong className="text-amber-400">AI:</strong> {res.recommendedAction}
                  </div>
                  <div>
                    <strong className="text-emerald-400">Policy:</strong> {res.policyDecision}
                  </div>
                </div>

                <div className="mt-2 text-right">
                  <Link
                    href={`/cases/${res.caseId}`}
                    className="text-[11px] text-amber-400 font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    View Details <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
