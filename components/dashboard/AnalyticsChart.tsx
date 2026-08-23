'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Eye, ExternalLink, BarChart3, PlatformIcon } from '@/components/ui/Icons';
import { AnalyticsSummary } from '@/types';

interface AnalyticsChartProps {
  analytics: AnalyticsSummary;
}

export function AnalyticsChart({ analytics }: AnalyticsChartProps) {
  const maxClicks = Math.max(...analytics.clicksByLink.map((l) => l.clicks), 1);

  return (
    <div className="w-full flex flex-col gap-6 text-neutral-900 font-sans">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 text-neutral-900">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          Statistiques & Analytics
        </h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Suivez la fréquentation et la popularité de vos liens en temps réel
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-neutral-500 uppercase font-bold tracking-wider">
              Vues totales du profil
            </span>
            <div className="text-3xl font-black text-neutral-900">{analytics.totalViews}</div>
          </div>
        </div>

        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <ExternalLink className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-neutral-500 uppercase font-bold tracking-wider">
              Clics totaux sur les liens
            </span>
            <div className="text-3xl font-black text-neutral-900">{analytics.totalClicks}</div>
          </div>
        </div>
      </div>

      {/* Graphique d'évolution des vues */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
        <h3 className="text-sm font-bold text-neutral-800">Évolution des visites (7 derniers jours)</h3>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.viewsByDate} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '12px',
                  color: '#0f172a',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  fontWeight: 'bold',
                }}
              />
              <Area
                type="monotone"
                dataKey="views"
                name="Vues"
                stroke="#4f46e5"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#viewsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Classement des Clics par Lien */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
        <h3 className="text-sm font-bold text-neutral-800">
          Classement des liens les plus cliqués
        </h3>

        {analytics.clicksByLink.length === 0 ? (
          <div className="p-6 text-center text-xs text-neutral-500 border border-dashed border-neutral-200 rounded-xl bg-slate-50">
            Aucun clic enregistré pour le moment.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {analytics.clicksByLink.map((link, idx) => {
              const percentage = Math.round((link.clicks / maxClicks) * 100);
              return (
                <div key={link.id} className="flex flex-col gap-1.5 p-2 rounded-xl hover:bg-slate-50 transition">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="font-extrabold text-neutral-400 w-5">{idx + 1}.</span>
                      <PlatformIcon name={link.platform || 'website'} className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="font-bold text-neutral-900 truncate max-w-[220px]">
                        {link.label}
                      </span>
                    </div>
                    <span className="font-mono text-indigo-600 font-extrabold">{link.clicks} clics</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
