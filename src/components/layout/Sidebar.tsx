"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Bot,
  History,
  AlertTriangle,
  Settings,
  ShieldCheck,
  Zap,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Recovery Cases", href: "/cases", icon: Briefcase },
  { name: "Agent Live Run", href: "/agent", icon: Bot },
  { name: "Audit Trail", href: "/audit", icon: History },
  { name: "Escalations", href: "/escalations", icon: AlertTriangle },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0d1117] border-r border-[#1e2633] flex flex-col justify-between h-screen sticky top-0 z-30">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-[#1e2633]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-black font-bold shadow-lg shadow-amber-500/20">
              <Zap className="w-5 h-5 text-black fill-current" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white tracking-wide flex items-center gap-1.5">
                RecoverAI
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono border border-amber-500/20">
                  v1.0
                </span>
              </h1>
              <p className="text-[11px] text-[#8a99ad] truncate max-w-[150px]">
                AI Revenue Recovery
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-semibold text-[#6e7681] uppercase tracking-wider">
            Platform Menu
          </div>
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm"
                    : "text-[#8a99ad] hover:text-white hover:bg-[#161b22]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-[#8a99ad]"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Safety Engine Footer */}
      <div className="p-4 border-t border-[#1e2633] bg-[#090b0e]">
        <div className="p-3 rounded-lg bg-[#121721] border border-[#1e2633] space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Policy Engine Active
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-[11px] text-[#8a99ad] leading-tight">
            Bounded automation. Policy threshold: ₹10,000 max.
          </p>
        </div>
      </div>
    </aside>
  );
}
