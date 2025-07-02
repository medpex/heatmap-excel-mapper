import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, MapPin, Zap, Calendar, TrendingUp, Users, Building, Target } from 'lucide-react';
import { DataRow } from './DataVisualizationTool';

interface DashboardStatsProps {
  data: DataRow[];
}

const DashboardStats = ({ data }: DashboardStatsProps) => {
  const stats = useMemo(() => {
    const totalEntries = data.length;
    const uniqueOrte = new Set(data.map(row => row.Ort)).size;
    const totalKW = data.reduce((sum, row) => sum + (Number(row['KW-Zahl']) || 0), 0);
    const avgKW = totalKW / Math.max(totalEntries, 1);
    
    // Sparten-Analysen
    const sparteStats = data.reduce((acc, row) => {
      acc[row.Sparte] = (acc[row.Sparte] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topSparte = Object.entries(sparteStats).reduce((a, b) => 
      sparteStats[a[0]] > sparteStats[b[0]] ? a : b, ['', 0]
    );

    // Art-Analysen
    const artStats = data.reduce((acc, row) => {
      acc[row.Art] = (acc[row.Art] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topArt = Object.entries(artStats).reduce((a, b) => 
      artStats[a[0]] > artStats[b[0]] ? a : b, ['', 0]
    );

    // Jahres-Analysen
    const currentYear = new Date().getFullYear();
    const currentYearData = data.filter(row => {
      const year = row.Datum ? new Date(row.Datum).getFullYear() : null;
      return year === currentYear;
    });

    return {
      totalEntries,
      uniqueOrte,
      totalKW,
      avgKW,
      topSparte: topSparte[0] || 'N/A',
      topSparteCount: topSparte[1] || 0,
      topArt: topArt[0] || 'N/A',
      topArtCount: topArt[1] || 0,
      currentYearEntries: currentYearData.length,
      spartenCount: Object.keys(sparteStats).length
    };
  }, [data]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('de-DE').format(Math.round(num));
  };

  const statsCards = [
    {
      title: "Gesamt Einträge",
      value: formatNumber(stats.totalEntries),
      description: "Datensätze geladen",
      icon: BarChart3,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-l-blue-500"
    },
    {
      title: "Unique Orte", 
      value: formatNumber(stats.uniqueOrte),
      description: "Verschiedene Städte",
      icon: MapPin,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-l-green-500"
    },
    {
      title: "Gesamt KW-Zahl",
      value: formatNumber(stats.totalKW),
      description: "Kilowatt gesamt",
      icon: Zap,
      color: "text-orange-600", 
      bgColor: "bg-orange-50",
      borderColor: "border-l-orange-500"
    },
    {
      title: "Ø KW pro Eintrag",
      value: formatNumber(stats.avgKW),
      description: "Durchschnittswert",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50", 
      borderColor: "border-l-purple-500"
    },
    {
      title: "Top Sparte",
      value: stats.topSparte,
      description: `${formatNumber(stats.topSparteCount)} Einträge`,
      icon: Building,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-l-indigo-500"
    },
    {
      title: "Top Art",
      value: stats.topArt,
      description: `${formatNumber(stats.topArtCount)} Einträge`,
      icon: Target,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      borderColor: "border-l-pink-500"
    },
    {
      title: "Dieses Jahr",
      value: formatNumber(stats.currentYearEntries),
      description: `${new Date().getFullYear()} Datensätze`,
      icon: Calendar,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      borderColor: "border-l-cyan-500"
    },
    {
      title: "Sparten Anzahl",
      value: formatNumber(stats.spartenCount),
      description: "Verschiedene Sparten",
      icon: Users,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-l-emerald-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className={`${stat.bgColor} border-l-4 ${stat.borderColor} shadow-soft hover:shadow-lg transition-all duration-200`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardStats;