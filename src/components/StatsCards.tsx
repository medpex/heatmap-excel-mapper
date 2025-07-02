import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, MapPin, Zap, Calendar } from 'lucide-react';
import { DataRow } from './DataVisualizationTool';

interface StatsCardsProps {
  data: DataRow[];
}

const StatsCards = ({ data }: StatsCardsProps) => {
  const stats = useMemo(() => {
    const totalEntries = data.length;
    const uniqueOrte = new Set(data.map(row => row.Ort)).size;
    const totalKW = data.reduce((sum, row) => sum + (row['KW-Zahl'] || 0), 0);
    const sparteStats = data.reduce((acc, row) => {
      acc[row.Sparte] = (acc[row.Sparte] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topSparte = Object.entries(sparteStats).reduce((a, b) => 
      sparteStats[a[0]] > sparteStats[b[0]] ? a : b, ['', 0]
    );

    return {
      totalEntries,
      uniqueOrte,
      totalKW,
      topSparte: topSparte[0] || 'N/A',
      topSparteCount: topSparte[1] || 0
    };
  }, [data]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('de-DE').format(num);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="shadow-soft border-l-4 border-l-primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Gesamt Einträge
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatNumber(stats.totalEntries)}
          </div>
          <p className="text-xs text-muted-foreground">
            Datensätze geladen
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft border-l-4 border-l-accent">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Unique Orte
          </CardTitle>
          <MapPin className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatNumber(stats.uniqueOrte)}
          </div>
          <p className="text-xs text-muted-foreground">
            Verschiedene Städte
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft border-l-4 border-l-success">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Gesamt KW-Zahl
          </CardTitle>
          <Zap className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatNumber(stats.totalKW)}
          </div>
          <p className="text-xs text-muted-foreground">
            Kilowatt gesamt
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft border-l-4 border-l-warning">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Top Sparte
          </CardTitle>
          <Calendar className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground truncate">
            {stats.topSparte}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatNumber(stats.topSparteCount)} Einträge
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;