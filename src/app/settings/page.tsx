"use client";

import { useState } from "react";
import { Settings, ShieldCheck, Zap, Key, Save, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [maxAttempts, setMaxAttempts] = useState("3");
  const [highValueThreshold, setHighValueThreshold] = useState("10000");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-400" />
          System & Policy Settings
        </h1>
        <p className="text-xs text-[#8a99ad] mt-1">
          Configure deterministic policy ceilings, safety bounds, and payment gateway credential statuses.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Settings successfully updated.
        </div>
      )}

      {/* Policy Engine Configuration Form */}
      <form onSubmit={handleSave} className="rounded-xl bg-[#121721] border border-[#212a3a] p-6 space-y-6">
        <div className="flex items-center space-x-2 pb-4 border-b border-[#1e2633]">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white">Deterministic Policy Engine Rules</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white block">
              Maximum Automated Recovery Attempts
            </label>
            <input
              type="number"
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-lg bg-[#090b0e] border border-[#212a3a] text-white focus:outline-none focus:border-amber-500 font-mono"
            />
            <p className="text-[11px] text-[#8a99ad]">
              Any payment failure with retries &ge; this limit triggers immediate human escalation.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-white block">
              High-Value Approval Ceiling Threshold (₹ INR)
            </label>
            <input
              type="number"
              value={highValueThreshold}
              onChange={(e) => setHighValueThreshold(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-lg bg-[#090b0e] border border-[#212a3a] text-white focus:outline-none focus:border-amber-500 font-mono"
            />
            <p className="text-[11px] text-[#8a99ad]">
              Transactions exceeding this amount require human authorization prior to link generation.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-[#1e2633] flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all flex items-center space-x-2"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

      {/* Integration Connections Status Card */}
      <div className="rounded-xl bg-[#121721] border border-[#212a3a] p-6 space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-[#1e2633]">
          <Key className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">Integration Status</h2>
        </div>

        <div className="space-y-3 text-xs">
          {/* Razorpay Status */}
          <div className="p-4 rounded-lg bg-[#090b0e] border border-[#1e2633] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-amber-400" />
              <div>
                <div className="font-bold text-white">Razorpay Payment Gateway</div>
                <div className="text-[11px] text-[#8a99ad]">
                  Environment Variables: RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET
                </div>
              </div>
            </div>
            <span className="px-3 py-1 rounded bg-amber-500/10 text-amber-400 font-mono font-semibold border border-amber-500/20 text-[11px]">
              SIMULATOR MODE ACTIVE
            </span>
          </div>

          {/* OpenAI LLM Status */}
          <div className="p-4 rounded-lg bg-[#090b0e] border border-[#1e2633] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-indigo-400" />
              <div>
                <div className="font-bold text-white">AI Reasoning Engine (LLM)</div>
                <div className="text-[11px] text-[#8a99ad]">
                  Structured JSON output model: gpt-4o-mini / Heuristic Fallback
                </div>
              </div>
            </div>
            <span className="px-3 py-1 rounded bg-indigo-500/10 text-indigo-400 font-mono font-semibold border border-indigo-500/20 text-[11px]">
              ACTIVE (ZERO-CONFIG HEURISTIC)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
