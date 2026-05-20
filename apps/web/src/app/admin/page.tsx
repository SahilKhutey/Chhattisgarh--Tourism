"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from "recharts";
import { 
  Layers, TrendingUp, AlertTriangle, CheckCircle, XCircle, Clock, Compass, Trees, Award, Users, ShieldAlert, UserPlus, LogOut, BookOpen
} from "lucide-react";
import { useAuthStore } from "../../store/auth-store";

interface AdminUser { id: string; email: string; fullName: string; role: string; createdAt: string; }
interface AdminCreator { id: string; bio: string; instagram?: string; youtube?: string; user?: AdminUser; }
interface AdminFolklore { id: string; title: string; monument: string; location: string; description: string; author?: AdminUser; }

export default function AdminPage() {
  const { user, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"traffic" | "eco" | "approvals" | "creator_backlog" | "users" | "folklore">("traffic");

  // Recharts Simulated Telemetry Datasets
  const seasonalTrafficData = [
    { month: "Jan", visitorCount: 8400, forecastCount: 8800, revenueInr: 1250000 },
    { month: "Feb", visitorCount: 7900, forecastCount: 8200, revenueInr: 1100000 },
    { month: "Mar", visitorCount: 9200, forecastCount: 9500, revenueInr: 1450000 },
    { month: "Apr", visitorCount: 4200, forecastCount: 4600, revenueInr: 650000 },
    { month: "May", visitorCount: 3100, forecastCount: 3300, revenueInr: 450000 },
    { month: "Jun", visitorCount: 1800, forecastCount: 2200, revenueInr: 200000 },
    { month: "Jul", visitorCount: 12400, forecastCount: 13000, revenueInr: 1850000 },
    { month: "Aug", visitorCount: 14600, forecastCount: 15500, revenueInr: 2200000 },
    { month: "Sep", visitorCount: 13800, forecastCount: 14200, revenueInr: 2050000 },
    { month: "Oct", visitorCount: 11900, forecastCount: 12500, revenueInr: 1750000 },
    { month: "Nov", visitorCount: 9800, forecastCount: 10200, revenueInr: 1500000 },
    { month: "Dec", visitorCount: 10500, forecastCount: 11000, revenueInr: 1600000 }
  ];

  const ecologicalCarryingCapacity = [
    { location: "Chitrakote", currentLimit: 850, capacityCap: 1200, pressureIndex: 70 },
    { location: "Sirpur Complex", currentLimit: 140, capacityCap: 600, pressureIndex: 23 },
    { location: "Kanger Caves", currentLimit: 280, capacityCap: 300, pressureIndex: 93 },
    { location: "Tirathgarh", currentLimit: 420, capacityCap: 800, pressureIndex: 52 },
    { location: "Barnawapara", currentLimit: 190, capacityCap: 400, pressureIndex: 47 },
    { location: "Bhoramdeo", currentLimit: 110, capacityCap: 400, pressureIndex: 27 }
  ];

  const [pendingCreators, setPendingCreators] = useState<AdminCreator[]>([]);
  const [pendingFolklore, setPendingFolklore] = useState<AdminFolklore[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingCreators, setLoadingCreators] = useState(false);



  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`${API}/moderation/users`, {
        headers: { "x-admin-role": user?.role || "" }
      });
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchPendingCreators = async () => {
    setLoadingCreators(true);
    try {
      const res = await fetch(`${API}/moderation/creators/pending`, {
        headers: { "x-admin-role": user?.role || "" }
      });
      const data = await res.json();
      if (res.ok) setPendingCreators(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCreators(false);
    }
  };

  const fetchPendingFolklore = async () => {
    try {
      const res = await fetch(`${API}/moderation/folklore/pending`, {
        headers: { "x-admin-role": user?.role || "" }
      });
      const data = await res.json();
      if (res.ok) setPendingFolklore(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (token && user?.role && ['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(user.role)) {
      setTimeout(() => {
        fetchUsers();
        fetchPendingCreators();
        fetchPendingFolklore();
      }, 0);
    }
  }, [token, user]);

  const handleAppointRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`${API}/moderation/appoint/${userId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-role": user?.role || "" 
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerifyCreator = async (id: string) => {
    try {
      const res = await fetch(`${API}/moderation/creators/verify/${id}`, {
        method: "PATCH",
        headers: { "x-admin-role": user?.role || "" }
      });
      if (res.ok) {
        setPendingCreators(pendingCreators.filter(c => c.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerifyFolklore = async (id: string) => {
    try {
      const res = await fetch(`${API}/moderation/folklore/verify/${id}`, {
        method: "PATCH",
        headers: { "x-admin-role": user?.role || "" }
      });
      if (res.ok) {
        setPendingFolklore(pendingFolklore.filter(f => f.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectFolklore = async (id: string) => {
    try {
      const res = await fetch(`${API}/moderation/folklore/reject/${id}`, {
        method: "DELETE",
        headers: { "x-admin-role": user?.role || "" }
      });
      if (res.ok) {
        setPendingFolklore(pendingFolklore.filter(f => f.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!user || !['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(user.role)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0B0D0F]">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-sans font-bold text-red-500">Access Denied</h2>
        <p className="text-charcoal-stone/60 font-mono text-sm mt-2">Level 4 Sovereign Clearance Required.</p>
        <Link href="/" className="mt-6 px-6 py-2 bg-charcoal-stone text-sand-beige rounded-xl font-bold">Return to Base</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-charcoal-stone flex-1 flex flex-col gap-8 bg-sand-beige/25">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-charcoal-stone/10 pb-6">
        <div className="flex flex-col gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-forest-emerald/30 bg-forest-emerald/5 text-xs font-mono font-bold text-forest-emerald w-fit uppercase">
            <Layers className="w-3.5 h-3.5 text-tribal-terracotta" />
            Sovereign Command Center
          </span>
          <h1 className="text-3xl sm:text-5xl font-sans font-bold tracking-tight text-forest-emerald">
            Smart Governance Control Desk
          </h1>
          <p className="text-sm text-charcoal-stone/75 max-w-xl leading-relaxed">
            Manage user roles, verify creator studios, monitor ecological payload metrics, and forecast revenue.
          </p>
        </div>

        {/* Global Stats */}
        <div className="flex gap-4 shrink-0">
          <div className="px-4 py-3 rounded-xl bg-white border border-charcoal-stone/10 shadow-sm flex flex-col">
            <span className="text-[9px] font-mono text-charcoal-stone/40 uppercase">Pending Studios</span>
            <span className="text-lg font-sans font-bold text-tribal-terracotta">{pendingCreators.length} Backlog</span>
          </div>
          <div className="px-4 py-3 rounded-xl bg-white border border-charcoal-stone/10 shadow-sm flex flex-col">
            <span className="text-[9px] font-mono text-charcoal-stone/40 uppercase">Total Citizens</span>
            <span className="text-lg font-sans font-bold text-forest-emerald">{users.length} Active</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-charcoal-stone/10 gap-2 overflow-x-auto pb-1">
        {[
          { id: "traffic", label: "Traffic & Forecasting", icon: TrendingUp },
          { id: "eco", label: "Ecological Load Limits", icon: Trees },
          { id: "users", label: "User Management", icon: Users },
          { id: "creator_backlog", label: `Creator Studio Verification (${pendingCreators.length})`, icon: Award },
          { id: "folklore", label: `Folklore Verification (${pendingFolklore.length})`, icon: BookOpen }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "traffic" | "eco" | "approvals" | "creator_backlog" | "users" | "folklore")}
              className={`flex items-center gap-2 text-sm font-sans font-bold px-4 py-3.5 border-b-2 cursor-pointer transition-all shrink-0 ${
                activeTab === tab.id
                  ? "border-tribal-terracotta text-tribal-terracotta font-extrabold"
                  : "border-transparent text-charcoal-stone/60 hover:text-forest-emerald font-semibold"
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Traffic & Forecasting */}
      {activeTab === "traffic" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-white/60 flex flex-col gap-6 bg-white/70">
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-tribal-terracotta font-bold uppercase">12-Month Traffic Telemetry</span>
              <h3 className="font-sans font-bold text-lg text-forest-emerald">State Tourism Volume Graphs</h3>
            </div>
            <div className="w-full h-80 text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={seasonalTrafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0A3622" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0A3622" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorFore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B25329" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#B25329" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" stroke="#1E2229" />
                  <YAxis stroke="#1E2229" />
                  <Tooltip contentStyle={{ background: "#F4EBE1", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "8px" }} />
                  <Legend />
                  <Area name="Actual Visitors" type="monotone" dataKey="visitorCount" stroke="#0A3622" strokeWidth={2} fillOpacity={1} fill="url(#colorVis)" />
                  <Area name="AI Predicted Ingress" type="monotone" dataKey="forecastCount" stroke="#B25329" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorFore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Ecological Carrying Capacity */}
      {activeTab === "eco" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-white/60 flex flex-col gap-6 bg-white/70">
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-tribal-terracotta font-bold uppercase">Carrying Capacity Tiers</span>
              <h3 className="font-sans font-bold text-lg text-forest-emerald">Ecosystem carrying pressure bounds</h3>
            </div>
            <div className="w-full h-80 text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ecologicalCarryingCapacity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="location" stroke="#1E2229" />
                  <YAxis stroke="#1E2229" />
                  <Tooltip />
                  <Legend />
                  <Bar name="Live Visitor Load" dataKey="currentLimit" fill="#1A5E7A" radius={[4, 4, 0, 0]} />
                  <Bar name="Safety Limits" dataKey="capacityCap" fill="#0A3622" opacity={0.3} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: User Management */}
      {activeTab === "users" && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-white/60 bg-white/70 flex flex-col gap-6">
          <div className="flex flex-col gap-1 border-b border-charcoal-stone/10 pb-4">
            <span className="text-[9px] font-mono text-tribal-terracotta font-bold uppercase">Access Control & Role Appointment</span>
            <h3 className="font-sans font-bold text-lg text-forest-emerald">Citizen Identity Management</h3>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-charcoal-stone/20 text-charcoal-stone/50 font-mono uppercase tracking-wider">
                  <th className="py-3 px-4">Citizen Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Current Role</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Appoint Role Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-stone/10">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/40 transition-colors">
                    <td className="py-4 px-4 font-sans font-bold text-forest-emerald">{u.fullName}</td>
                    <td className="py-4 px-4 text-charcoal-stone/70">{u.email}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded uppercase font-mono text-[9px] font-bold ${
                        u.role === "SUPER_ADMIN" ? "bg-purple-100 text-purple-700" :
                        u.role === "ADMIN" ? "bg-red-100 text-red-700" : 
                        u.role === "MODERATOR" ? "bg-blue-100 text-blue-700" :
                        u.role === "CREATOR" ? "bg-orange-100 text-orange-700" :
                        "bg-gray-200 text-gray-700"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[10px] font-mono text-charcoal-stone/45">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && u.role !== 'SUPER_ADMIN' && u.id !== user?.id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleAppointRole(u.id, "MODERATOR")}
                            disabled={u.role === "MODERATOR"}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded text-[10px] font-bold transition-colors"
                          >
                            Make Moderator
                          </button>
                          {user?.role === 'SUPER_ADMIN' && (
                            <button
                              onClick={() => handleAppointRole(u.id, "ADMIN")}
                              disabled={u.role === "ADMIN"}
                              className="bg-red-600 hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded text-[10px] font-bold transition-colors"
                            >
                              Make Admin
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-charcoal-stone/40 font-mono">NO PRIVILEGE</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Creator Contribution Desk */}
      {activeTab === "creator_backlog" && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-white/60 bg-white/70 flex flex-col gap-6">
          <div className="flex flex-col gap-1 border-b border-charcoal-stone/10 pb-4">
            <span className="text-[9px] font-mono text-tribal-terracotta font-bold uppercase">Pending Content Creator Applications</span>
            <h3 className="font-sans font-bold text-lg text-forest-emerald">Creator Studio Verifications</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingCreators.map((creator) => (
              <div 
                key={creator.id}
                className="p-5 rounded-2xl bg-white border border-charcoal-stone/10 shadow flex flex-col gap-4 hover:scale-[1.005] transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-warm-orange"></div>
                
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-0.5">
                    <h4 className="font-sans font-bold text-base text-forest-emerald leading-tight">{creator.user?.fullName}</h4>
                    <span className="text-[10px] text-charcoal-stone/50 font-mono">Email: <strong className="text-tribal-terracotta">{creator.user?.email}</strong></span>
                  </div>
                  <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase">
                    Pending Verification
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-sand-beige/35 border border-charcoal-stone/5 flex flex-col gap-2">
                  <p className="text-[11px] text-charcoal-stone/75 leading-relaxed font-sans font-medium line-clamp-3">
                    {creator.bio || "No bio provided."}
                  </p>
                  <div className="flex flex-col gap-1 text-[10px] font-mono text-charcoal-stone/60 border-t border-charcoal-stone/5 pt-2 mt-1">
                    <span>Instagram: <strong className="text-charcoal-stone">{creator.instagram || "N/A"}</strong></span>
                    <span>YouTube: <strong className="text-charcoal-stone">{creator.youtube || "N/A"}</strong></span>
                  </div>
                </div>

                <div className="flex gap-2 justify-end border-t border-charcoal-stone/5 pt-4 mt-2">
                  <button
                    onClick={() => handleVerifyCreator(creator.id)}
                    className="inline-flex items-center gap-1.5 bg-forest-emerald hover:bg-emerald-800 text-sand-beige px-4 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Verify Creator Identity
                  </button>
                </div>
              </div>
            ))}

            {pendingCreators.length === 0 && (
              <div className="col-span-2 text-center py-20 border border-dashed border-charcoal-stone/20 rounded-2xl bg-white/30 text-charcoal-stone/40 flex flex-col items-center justify-center gap-3">
                <Clock className="w-12 h-12 text-charcoal-stone/30 animate-pulse" />
                <span className="font-sans text-sm font-bold">Studio Submissions Queue Empty</span>
                <span className="text-xs max-w-xs leading-normal">
                  All submitted creator portfolios have been verified.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: Folklore Moderation */}
      {activeTab === "folklore" && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-white/60 bg-white/70 flex flex-col gap-6">
          <div className="flex flex-col gap-1 border-b border-charcoal-stone/10 pb-4">
            <span className="text-[9px] font-mono text-purple-600 font-bold uppercase">Pending Folklore Submissions</span>
            <h3 className="font-sans font-bold text-lg text-forest-emerald">Folklore Verification Queue</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingFolklore.map((folklore) => (
              <div 
                key={folklore.id}
                className="p-5 rounded-2xl bg-white border border-charcoal-stone/10 shadow flex flex-col gap-4 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-purple-500"></div>
                
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-0.5">
                    <h4 className="font-sans font-bold text-base text-forest-emerald leading-tight">{folklore.title}</h4>
                    <span className="text-[10px] text-charcoal-stone/50 font-mono">By: <strong className="text-purple-600">{folklore.author?.fullName}</strong> ({folklore.author?.email})</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full uppercase">
                    Review Required
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 flex flex-col gap-2">
                  <div className="flex gap-2 text-[10px] font-mono font-bold text-charcoal-stone/70">
                    <span>Monument: {folklore.monument}</span>
                    <span>|</span>
                    <span>Loc: {folklore.location}</span>
                  </div>
                  <p className="text-[11px] text-charcoal-stone/75 leading-relaxed font-sans font-medium line-clamp-4 bg-white p-2 rounded border border-charcoal-stone/5">
                    {folklore.description}
                  </p>
                </div>

                <div className="flex gap-2 justify-end border-t border-charcoal-stone/5 pt-4 mt-2">
                  <button
                    onClick={() => handleRejectFolklore(folklore.id)}
                    className="inline-flex items-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-sm"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleVerifyFolklore(folklore.id)}
                    className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Verify & Publish
                  </button>
                </div>
              </div>
            ))}

            {pendingFolklore.length === 0 && (
              <div className="col-span-2 text-center py-20 border border-dashed border-charcoal-stone/20 rounded-2xl bg-white/30 text-charcoal-stone/40 flex flex-col items-center justify-center gap-3">
                <Clock className="w-12 h-12 text-charcoal-stone/30 animate-pulse" />
                <span className="font-sans text-sm font-bold">Folklore Queue Empty</span>
                <span className="text-xs max-w-xs leading-normal">
                  No new folklore submissions require verification at this time.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
