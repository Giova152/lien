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
import { Eye, ExternalLink, BarChart3, PlatformIcon, Sparkles } from '@/components/ui/Icons';
import { AnalyticsSummary } from '@/types';

interface AnalyticsChartProps {
  analytics: AnalyticsSummary;
}

export function AnalyticsChart({ analytics }: AnalyticsChartProps) {
  const maxClicks = Math.max(...analytics.clicksByLink.map((l) => l.clicks), 1);

  return (
    <div className="w-full flex flex-col gap-6 text-white">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          Statistiques & Analytics
        </h2>
        <p className="text-xs text-neutral-400">
          Suivez la fréquentation et la popularité de vos liens en temps réel
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-neutral-400 uppercase font-semibold tracking-wider">
              Vues totales du profil
            </span>
            <div className="text-3xl font-black text-white">{analytics.totalViews}</div>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <ExternalLink className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-neutral-400 uppercase font-semibold tracking-wider">
              Clics totaux sur les liens
            </span>
            <div className="text-3xl font-black text-white">{analytics.totalClicks}</div>
          </div>
        </div>
      </div>

      {/* Graphique d'évolution des vues */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-neutral-300">Évolution des visites (7 derniers jours)</h3>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.viewsByDate} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="date" stroke="#737373" fontSize={12} tickLine={false} />
              <YAxis stroke="#737373" fontSize={12} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#171717',
                  borderColor: '#262626',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="views"
                name="Vues"
                stroke="#6366f1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#viewsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Classement des Clics par Lien */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-neutral-300">
          Classement des liens les plus cliqués
        </h3>

        {analytics.clicksByLink.length === 0 ? (
          <div className="p-6 text-center text-xs text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
            Aucun clic enregistré pour le moment.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {analytics.clicksByLink.map((link, idx) => {
              const percentage = Math.round((link.clicks / maxClicks) * 100);
              return (
                <div key={link.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="font-bold text-neutral-500 w-4">{idx + 1}.</span>
                      <PlatformIcon name={link.platform || 'website'} className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="font-medium text-white truncate max-w-[200px]">
                        {link.label}
                      </span>
                    </div>
                    <span className="font-mono text-indigo-400 font-bold">{link.clicks} clics</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
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
