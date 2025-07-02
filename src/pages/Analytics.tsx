import { BarChart3 } from 'lucide-react';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { AnalyticsStats } from '@/components/AnalyticsStats';
import { AnalyticsCharts } from '@/components/AnalyticsCharts';

const Analytics = () => {
  const { isLoading, stats, connectionsByYear, connectionsByType } = useAnalyticsData();


  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 animate-pulse text-primary" />
          <span className="text-lg font-medium">Analysiere Daten...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Detaillierte Auswertung aller Anschlussdaten und Baujahr-Analysen</p>
        </div>

        {/* Key Metrics */}
        <AnalyticsStats stats={stats} />

        {/* Charts Grid */}
        <AnalyticsCharts 
          connectionsByYear={connectionsByYear} 
          connectionsByType={connectionsByType} 
        />
      </div>
    </div>
  );
};

export default Analytics;