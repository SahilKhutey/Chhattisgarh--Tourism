import Link from "next/link";
import { ReactNode } from "react";
import { Home, Compass, AlertTriangle, ShieldCheck, Siren } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-teal-500/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <ShieldCheck className="w-6 h-6 text-teal-400 mr-2" />
          <h1 className="font-semibold tracking-wide text-sm text-slate-200">
            ATIS <span className="text-slate-500">COMMAND</span>
          </h1>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          <Link href="/admin" className="flex items-center px-4 py-3 rounded-xl bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-all">
            <Home className="w-5 h-5 mr-3 opacity-70" />
            <span className="text-sm font-medium">Mission Control</span>
          </Link>
          <Link href="/admin/discoveries" className="flex items-center px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all">
            <Compass className="w-5 h-5 mr-3 opacity-70" />
            <span className="text-sm font-medium">AI Discoveries</span>
          </Link>
          <Link href="/admin/flags" className="flex items-center px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all">
            <AlertTriangle className="w-5 h-5 mr-3 opacity-70" />
            <span className="text-sm font-medium">System Flags</span>
          </Link>
          <Link href="/admin/emergency" className="flex items-center px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all">
            <Siren className="w-5 h-5 mr-3 opacity-70" />
            <span className="text-sm font-medium">Emergency Network</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-3"></div>
            <span className="text-xs text-slate-400">System Online</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md">
          <h2 className="text-sm font-medium text-slate-400">Autonomous Tourism Intelligence System</h2>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xs text-teal-400 hover:text-teal-300">View Public Site</Link>
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs border border-slate-700">
              AD
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
