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

        // 1. Fetch Views
        const { data: viewsData, count: totalViewsCount } = await supabase
          .from('profile_views')
          .select('viewed_at', { count: 'exact' })
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

        if (viewsData) {
          viewsData.forEach((v) => {
            const dateStr = new Date(v.viewed_at).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
            });
            if (last7Days[dateStr] !== undefined) {
              last7Days[dateStr] += 1;
            }
          });
        }

        const viewsByDate = Object.entries(last7Days).map(([date, views]) => ({ date, views }));

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
