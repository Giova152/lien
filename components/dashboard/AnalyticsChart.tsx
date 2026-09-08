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
import {
  Eye,
  ExternalLink,
  BarChart3,
  PlatformIcon,
  Sparkles,
  Smartphone,
  Laptop,
  Globe,
  Trophy,
  Tablet,
} from '@/components/ui/Icons';
import { AnalyticsSummary } from '@/types';
import { useDashboard } from '@/lib/context/DashboardContext';

interface AnalyticsChartProps {
  analytics: AnalyticsSummary;
}

export function AnalyticsChart({ analytics }: AnalyticsChartProps) {
  const { profile, openUpgradeModal } = useDashboard();
  const maxClicks = Math.max(...analytics.clicksByLink.map((l) => l.clicks), 1);

  const deviceStats = analytics.deviceStats || {
    mobile: 0,
    desktop: 0,
    tablet: 0,
    totalWithDevice: 0,
    mobilePercentage: 0,
    desktopPercentage: 0,
    tabletPercentage: 0,
  };

  const topCountries = analytics.topCountries || [];
  const topCountry = topCountries[0] || null;
  const maxCountryViews = Math.max(...topCountries.map((c) => c.views), 1);

  return (
    <div className="w-full flex flex-col gap-6 text-neutral-900 font-sans">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 text-neutral-900">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          Statistiques & Analytics
        </h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Suivez la fréquentation, les pays et les appareils de vos visiteurs en temps réel
        </p>
      </div>

      {/* Summary KPI Cards Grid (4 KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Vues totales */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-neutral-500 uppercase font-bold tracking-wider block">
              Vues totales
            </span>
            <div className="text-2xl font-black text-neutral-900">{analytics.totalViews}</div>
          </div>
        </div>

        {/* KPI 2 : Clics totaux */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <ExternalLink className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-neutral-500 uppercase font-bold tracking-wider block">
              Clics totaux
            </span>
            <div className="text-2xl font-black text-neutral-900">{analytics.totalClicks}</div>
          </div>
        </div>

        {/* KPI 3 : Mobile vs Ordi */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <span className="text-[11px] text-neutral-500 uppercase font-bold tracking-wider block">
              Part Mobile
            </span>
            <div className="text-2xl font-black text-neutral-900">
              {deviceStats.totalWithDevice > 0 ? `${deviceStats.mobilePercentage}%` : '—'}
            </div>
          </div>
        </div>

        {/* KPI 4 : Top Pays */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0 text-xl">
            {topCountry ? topCountry.flag : <Globe className="w-5 h-5 text-amber-600" />}
          </div>
          <div className="overflow-hidden">
            <span className="text-[11px] text-neutral-500 uppercase font-bold tracking-wider block">
              Top Pays
            </span>
            <div className="text-lg font-black text-neutral-900 truncate" title={topCountry?.name || 'En attente'}>
              {topCountry ? topCountry.name : 'En attente'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Analytics Grid: Appareils & Top Pays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CARD 1 : Répartition par Appareil */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 flex flex-col gap-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Smartphone className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900">Appareils des visiteurs</h3>
            </div>
            <span className="text-[11px] font-semibold text-neutral-400">
              {deviceStats.totalWithDevice} détecté{deviceStats.totalWithDevice > 1 ? 's' : ''}
            </span>
          </div>

          {/* Multi-segment visual bar */}
          <div className="w-full h-3 rounded-full bg-neutral-100 overflow-hidden flex">
            <div
              className="h-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${deviceStats.mobilePercentage}%` }}
              title={`Mobile: ${deviceStats.mobilePercentage}%`}
            />
            <div
              className="h-full bg-sky-500 transition-all duration-500"
              style={{ width: `${deviceStats.desktopPercentage}%` }}
              title={`Ordinateur: ${deviceStats.desktopPercentage}%`}
            />
            <div
              className="h-full bg-amber-400 transition-all duration-500"
              style={{ width: `${deviceStats.tabletPercentage}%` }}
              title={`Tablette: ${deviceStats.tabletPercentage}%`}
            />
          </div>

          {/* Device details list */}
          <div className="flex flex-col gap-2.5 pt-1">
            {/* Mobile / Smartphone */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50/70 border border-neutral-100 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <Smartphone className="w-4 h-4 text-neutral-600" />
                <span className="font-bold text-neutral-800">Mobile & Smartphone</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 font-medium">{deviceStats.mobile} vue{deviceStats.mobile > 1 ? 's' : ''}</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-black text-[11px]">
                  {deviceStats.mobilePercentage}%
                </span>
              </div>
            </div>

            {/* Ordinateur / Desktop */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50/70 border border-neutral-100 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <Laptop className="w-4 h-4 text-neutral-600" />
                <span className="font-bold text-neutral-800">Ordinateur (PC & Mac)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 font-medium">{deviceStats.desktop} vue{deviceStats.desktop > 1 ? 's' : ''}</span>
                <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-black text-[11px]">
                  {deviceStats.desktopPercentage}%
                </span>
              </div>
            </div>

            {/* Tablette (affiché si > 0) */}
            {deviceStats.tablet > 0 && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50/70 border border-neutral-100 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <Tablet className="w-4 h-4 text-neutral-600" />
                  <span className="font-bold text-neutral-800">Tablette (iPad, etc.)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500 font-medium">{deviceStats.tablet} vue{deviceStats.tablet > 1 ? 's' : ''}</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-black text-[11px]">
                    {deviceStats.tabletPercentage}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CARD 2 : Géolocalisation (Top Pays) */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 flex flex-col gap-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Globe className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900">Origine des visites (Pays)</h3>
            </div>
            {topCountry && (
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 text-[10px] font-bold flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-600" />
                <span>N°1 : {topCountry.name}</span>
              </span>
            )}
          </div>

          {topCountries.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-400 border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50 flex flex-col items-center justify-center gap-1.5 h-full min-h-[160px]">
              <Globe className="w-8 h-8 text-neutral-300 mb-1" />
              <p className="font-medium text-neutral-600">Aucun pays enregistré pour le moment</p>
              <p className="text-[11px] text-neutral-400 max-w-xs">
                Les pays de vos visiteurs seront automatiquement détectés dès les premières visites sur votre profil en ligne.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {topCountries.map((country, idx) => {
                const relativeWidth = Math.max(Math.round((country.views / maxCountryViews) * 100), 12);
                const isFirst = idx === 0;

                return (
                  <div
                    key={country.code}
                    className={`flex flex-col gap-1.5 p-2.5 rounded-xl border transition ${
                      isFirst
                        ? 'bg-amber-50/40 border-amber-200/70'
                        : 'bg-neutral-50/60 border-neutral-100 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-base">{country.flag}</span>
                        <span className="font-bold text-neutral-900 truncate">
                          {country.name}
                        </span>
                        {isFirst && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-400 text-amber-950 uppercase tracking-wider">
                            Top 1
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-500 font-medium">
                          {country.views} vue{country.views > 1 ? 's' : ''}
                        </span>
                        <span className="font-mono text-xs font-black text-neutral-800 w-10 text-right">
                          {country.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-neutral-200/80 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFirst
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                        }`}
                        style={{ width: `${relativeWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Graphique d'évolution des vues (7 jours) */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-2xs min-w-0 overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-800">Évolution des visites (7 derniers jours)</h3>
          <span className="text-xs text-neutral-400 font-medium">Mis à jour en temps réel</span>
        </div>

        <div className="h-64 w-full pt-2 min-w-0 overflow-hidden">
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
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 flex flex-col gap-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-800">
            Classement des liens les plus cliqués
          </h3>
          <span className="text-xs text-neutral-400 font-medium">
            Total : {analytics.totalClicks} clic{analytics.totalClicks > 1 ? 's' : ''}
          </span>
        </div>

        {analytics.clicksByLink.length === 0 ? (
          <div className="p-6 text-center text-xs text-neutral-500 border border-dashed border-neutral-200 rounded-xl bg-slate-50">
            Aucun clic enregistré pour le moment.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {analytics.clicksByLink.map((link, idx) => {
              const percentage = Math.round((link.clicks / maxClicks) * 100);
              return (
                <div key={link.id} className="flex flex-col gap-1.5 p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-neutral-200/60">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="font-extrabold text-neutral-400 w-5">{idx + 1}.</span>
                      <PlatformIcon name={link.platform || 'website'} className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="font-bold text-neutral-900 truncate max-w-[240px]">
                        {link.label}
                      </span>
                    </div>
                    <span className="font-mono text-indigo-600 font-extrabold">{link.clicks} clic{link.clicks > 1 ? 's' : ''}</span>
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

      {/* Subtle PRO banner if user is not PRO, without blocking data */}
      {!profile?.is_pro && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-900">Passez au statut PRO</h4>
              <p className="text-[11px] text-neutral-500">Débloquez le badge vert officiel, vos produits payants illimités et un support VIP.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openUpgradeModal?.()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 font-bold text-xs hover:scale-105 transition shadow-xs shrink-0 cursor-pointer"
          >
            Découvrir l'offre PRO
          </button>
        </div>
      )}
    </div>
  );
}
