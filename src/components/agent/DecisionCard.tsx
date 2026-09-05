"use client";

import { CheckCircle, ShieldAlert, Sparkles, AlertCircle } from "lucide-react";

interface DecisionCardProps {
  diagnosis: string;
  riskLevel: "low" | "medium" | "high";
  recoverability: number;
  recommendedAction: string;
  reason: string;
  confidence: number;
  policyDecision?: string;
  policyReason?: string;
  evidenceList?: string[];
}

export default function DecisionCard({
  diagnosis,
  riskLevel,
  recoverability,
  recommendedAction,
  reason,
  confidence,
  policyDecision = "APPROVED",
  policyReason = "First failure, attempt_count=1, amount below policy threshold.",
  evidenceList = [
    "First time payment authorization decline",
    "Customer completed prior orders successfully",
    "Amount below policy approval ceiling",
    "No suspicious velocity behavior detected",
  ],
}: DecisionCardProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "medium":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "high":
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      default:
        return "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
    }
  };

  return (
    <div className="rounded-xl bg-[#121721] border border-[#212a3a] p-6 space-y-6 shadow-xl relative overflow-hidden">
      {/* Header Accent Glow */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500" />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Why did RecoverAI choose this?
            </h3>
            <p className="text-xs text-[#8a99ad]">
              Autonomous reasoning & deterministic policy decision record
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider border ${getRiskColor(
              riskLevel
            )}`}
          >
            Risk: {riskLevel}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {Math.round(confidence * 100)}% Confidence
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AI Diagnosis Block */}
        <div className="p-4 rounded-lg bg-[#090b0e] border border-[#1e2633] space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6e7681]">
            AI Diagnosis
          </span>
          <p className="text-sm font-medium text-white leading-relaxed">{diagnosis}</p>
          <p className="text-xs text-[#8a99ad] italic">"{reason}"</p>
        </div>

        {/* Action Recommendation & Policy Approval */}
        <div className="p-4 rounded-lg bg-[#090b0e] border border-[#1e2633] space-y-3">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6e7681]">
              Recommended Action
            </span>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-sm font-bold text-amber-400 font-mono tracking-wide px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20">
                {recommendedAction}
              </span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                Recoverability: {Math.round(recoverability * 100)}%
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#1e2633]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6e7681]">
              Policy Engine Decision
            </span>
            <div className="mt-1 flex items-center space-x-2">
              {policyDecision === "APPROVED" ? (
                <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  POLICY APPROVED
                </span>
              ) : (
                <span className="text-xs font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {policyDecision}
                </span>
              )}
            </div>
            <p className="text-xs text-[#8a99ad] mt-1">{policyReason}</p>
          </div>
        </div>
      </div>

      {/* Supporting Evidence List */}
      <div className="p-4 rounded-lg bg-[#161b22] border border-[#212a3a] space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6e7681] flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          Supporting Heuristic Evidence Signals
        </span>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-[#c9d1d9]">
          {evidenceList.map((ev, i) => (
            <li key={i} className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span>{ev}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
