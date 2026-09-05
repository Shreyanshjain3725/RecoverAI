"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Sparkles, RefreshCw, CheckCircle2 } from "lucide-react";

interface HeaderProps {
  onRunAgent?: () => void;
  onSimulateBatch?: () => void;
  isProcessing?: boolean;
}

export default function Header({ onRunAgent, onSimulateBatch, isProcessing }: HeaderProps) {
  const router = useRouter();
  const [isSimulating, setIsSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState<string | null>(null);

  const handleSimulateBatch = async () => {
    if (onSimulateBatch) {
      onSimulateBatch();
      return;
    }

    try {
      setIsSimulating(true);
      setSimMessage("Generating 10 payment scenarios...");
      const res = await fetch("/api/simulation/generate", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSimMessage("Generated 10 scenarios!");
        setTimeout(() => setSimMessage(null), 3000);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleRunAgent = () => {
    if (onRunAgent) {
      onRunAgent();
    } else {
      router.push("/agent");
    }
  };

  return (
    <header className="h-16 border-b border-[#1e2633] bg-[#0d1117]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search / Title Area */}
      <div className="flex items-center space-x-3">
        <h2 className="text-sm font-semibold text-[#8a99ad] uppercase tracking-wider hidden sm:block">
          Autonomous Revenue Recovery Platform
        </h2>
        {simMessage && (
          <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 animate-pulse">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {simMessage}
          </span>
        )}
      </div>

      {/* Action Controls & Badges */}
      <div className="flex items-center space-x-3">
        {/* Environment Badge */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#121721] border border-[#212a3a]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="text-xs font-mono font-semibold text-amber-400 tracking-wide">
            DEMO MODE
          </span>
          <span className="text-[10px] text-[#6e7681] border-l border-[#212a3a] pl-2 hidden md:inline">
            Razorpay Test Simulator Active
          </span>
        </div>

        {/* Simulate Failed Batch Button */}
        <button
          onClick={handleSimulateBatch}
          disabled={isSimulating || isProcessing}
          className="px-3.5 py-2 rounded-lg bg-[#161b22] hover:bg-[#21262d] text-white text-xs font-medium border border-[#30363d] transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#8a99ad] ${isSimulating ? "animate-spin" : ""}`} />
          <span>Simulate Failed Batch</span>
        </button>

        {/* Primary Command Button: Run Recovery Agent */}
        <button
          onClick={handleRunAgent}
          disabled={isProcessing}
          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 flex items-center space-x-2 border border-amber-400/40 disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Processing Agent...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Recovery Agent</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
