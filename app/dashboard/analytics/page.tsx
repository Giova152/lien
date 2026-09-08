'use client';

import React, { useEffect, useState } from 'react';
import { AnalyticsChart } from '@/components/dashboard/AnalyticsChart';
import { Profile, LinkItem, AnalyticsSummary } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from '@/components/ui/Icons';

import { useDashboard } from '@/lib/context/DashboardContext';

export default function AnalyticsPage() {
  const { profile, links = [] } = useDashboard();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    totalViews: 0,
    totalClicks: 0,
    viewsByDate: [],
    clicksByLink: [],
  });

  useEffect(() => {
    async function loadAnalytics() {
      if (!profile) return;

      try {
        setLoading(true);

        // 1. Fetch Views (with device & country data)
        const { data: viewsData, count: totalViewsCount } = await supabase
          .from('profile_views')
          .select('viewed_at, device, referrer', { count: 'exact' })
          .eq('profile_id', profile.id);

        const totalViews = totalViewsCount || viewsData?.length || 0;

        // Group views by date (last 7 days)
        const last7Days: { [date: string]: number } = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
          last7Days[dateStr] = 0;
        }

        let mobileCount = 0;
        let desktopCount = 0;
        let tabletCount = 0;
        const countryCounts: { [code: string]: number } = {};

        if (viewsData) {
          viewsData.forEach((v) => {
            // Group by date
            const dateStr = new Date(v.viewed_at).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
            });
            if (last7Days[dateStr] !== undefined) {
              last7Days[dateStr] += 1;
            }

            // Parse device & country
            let devType: 'mobile' | 'desktop' | 'tablet' = 'desktop';
            let countryCode: string | null = null;

            if (v.device) {
              if (typeof v.device === 'string' && v.device.startsWith('{')) {
                try {
                  const parsed = JSON.parse(v.device);
                  if (parsed.type === 'mobile' || parsed.type === 'tablet' || parsed.type === 'desktop') {
                    devType = parsed.type;
                  }
                  if (parsed.country) {
                    countryCode = parsed.country;
                  }
                } catch {}
              } else {
                // Fallback for legacy rows with raw User-Agent
                const raw = String(v.device).toLowerCase();
                if (raw.includes('ipad') || (raw.includes('tablet') && !raw.includes('mobile'))) {
                  devType = 'tablet';
                } else if (raw.includes('mobile') || raw.includes('iphone') || raw.includes('android')) {
                  devType = 'mobile';
                } else {
                  devType = 'desktop';
                }
              }
            }

            if (devType === 'mobile') mobileCount++;
            else if (devType === 'tablet') tabletCount++;
            else desktopCount++;

            if (countryCode && countryCode.length === 2) {
              const upper = countryCode.toUpperCase();
              countryCounts[upper] = (countryCounts[upper] || 0) + 1;
            }
          });
        }

        const viewsByDate = Object.entries(last7Days).map(([date, views]) => ({ date, views }));

        // Device statistics
        const totalDevices = mobileCount + desktopCount + tabletCount;
        const deviceStats = {
          mobile: mobileCount,
          desktop: desktopCount,
          tablet: tabletCount,
          totalWithDevice: totalDevices,
          mobilePercentage: totalDevices > 0 ? Math.round((mobileCount / totalDevices) * 100) : 0,
          desktopPercentage: totalDevices > 0 ? Math.round((desktopCount / totalDevices) * 100) : 0,
          tabletPercentage: totalDevices > 0 ? Math.round((tabletCount / totalDevices) * 100) : 0,
        };

        // Country statistics
        const totalCountriesViews = Object.values(countryCounts).reduce((a, b) => a + b, 0);
        const topCountries = Object.entries(countryCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([code, count]) => {
            let name = code;
            try {
              const regionNames = new Intl.DisplayNames(['fr'], { type: 'region' });
              name = regionNames.of(code) || code;
            } catch {}

            let flag = '🌍';
            try {
              flag = String.fromCodePoint(...code.split('').map((c) => 127397 + c.charCodeAt(0)));
            } catch {}

            return {
              code,
              name,
              flag,
              views: count,
              percentage: totalCountriesViews > 0 ? Math.round((count / totalCountriesViews) * 100) : 0,
            };
          });

        // 2. Process Clicks by Link
        const totalClicks = links.reduce((acc, curr) => acc + (curr.click_count || 0), 0);

        const clicksByLink = [...links]
          .sort((a, b) => (b.click_count || 0) - (a.click_count || 0))
          .map((l) => ({
            id: l.id,
            label: l.label,
            url: l.url,
            platform: l.platform,
            clicks: l.click_count || 0,
          }));

        setAnalytics({
          totalViews,
          totalClicks,
          viewsByDate,
          clicksByLink,
          deviceStats,
          topCountries,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [profile, links]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-neutral-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-2" />
        <p className="text-xs">Chargement des statistiques...</p>
      </div>
    );
  }

  return <AnalyticsChart analytics={analytics} />;
}
