import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Users, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { DataRow } from '@/components/DataVisualizationTool';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const TABLES = [
  'Gefilterte_Adressen_Geesthacht',
  'Gefilterte_Adressen_Gülzow',
  'Gefilterte_Adressen_Hamwarde', 
  'Gefilterte_Adressen_Kollow',
  'Gefilterte_Adressen_Wiershop',
  'Gefilterte_Adressen_Worth',
];

const Analytics = () => {
  const [allData, setAllData] = useState<DataRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState<'trend' | 'correlation' | 'distribution' | 'geographic'>('trend');
  const { toast } = useToast();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    let combinedData: DataRow[] = [];
    
    for (const table of TABLES) {
      try {
        const res = await fetch(`${API_URL}/data/${table}`);
        if (!res.ok) throw new Error('Fehler beim Laden der Daten');
        const json: DataRow[] = await res.json();
        combinedData = combinedData.concat(json.map(row => ({ ...row, _table: table })));
      } catch (error) {
        toast({ 
          title: `Fehler bei ${table}`, 
          description: 'Konnte keine Daten laden', 
          variant: 'destructive' 
        });
      }
    }
    
    setAllData(combinedData);
    setIsLoading(false);
  };

  const analytics = useMemo(() => {
    if (!allData.length) return null;

    // Trend-Analyse
    const yearlyTrend = allData.reduce((acc, row) => {
      if (row.Datum) {
        const year = new Date(row.Datum).getFullYear();
        if (year >= 2020 && year <= 2024) {
          acc[year] = (acc[year] || 0) + 1;
        }
      }
      return acc;
    }, {} as Record<number, number>);

    const trendData = Object.entries(yearlyTrend)
      .map(([year, count]) => ({ year: parseInt(year), count }))
      .sort((a, b) => a.year - b.year);

    // KW-Verteilungsanalyse
    const kwDistribution = allData.reduce((acc, row) => {
      const kw = Number(row['KW-Zahl']) || 0;
      const range = kw === 0 ? '0' : 
                   kw <= 10 ? '1-10' :
                   kw <= 50 ? '11-50' :
                   kw <= 100 ? '51-100' :
                   kw <= 500 ? '101-500' : '500+';
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const distributionData = Object.entries(kwDistribution)
      .map(([range, count]) => ({ range, count }));

    // Geografische Analyse (Orte-Performance)
    const geograficAnalysis = allData.reduce((acc, row) => {
      const ort = row.Ort;
      const kw = Number(row['KW-Zahl']) || 0;
      
      if (!acc[ort]) {
        acc[ort] = { ort, count: 0, totalKW: 0, avgKW: 0 };
      }
      
      acc[ort].count += 1;
      acc[ort].totalKW += kw;
      acc[ort].avgKW = acc[ort].totalKW / acc[ort].count;
      
      return acc;
    }, {} as Record<string, { ort: string; count: number; totalKW: number; avgKW: number }>);

    const geograficData = Object.values(geograficAnalysis)
      .sort((a, b) => b.totalKW - a.totalKW)
      .slice(0, 15);

    // Korrelationsanalyse (Sparte vs KW)
    const sparteKwAnalysis = allData.reduce((acc, row) => {
      const sparte = row.Sparte;
      const kw = Number(row['KW-Zahl']) || 0;
      
      if (!acc[sparte]) {
        acc[sparte] = { sparte, count: 0, totalKW: 0, avgKW: 0 };
      }
      
      acc[sparte].count += 1;
      acc[sparte].totalKW += kw;
      acc[sparte].avgKW = acc[sparte].totalKW / acc[sparte].count;
      
      return acc;
    }, {} as Record<string, { sparte: string; count: number; totalKW: number; avgKW: number }>);

    const correlationData = Object.values(sparteKwAnalysis)
      .sort((a, b) => b.avgKW - a.avgKW);

    // Wachstumsstatistiken
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    const currentYearCount = yearlyTrend[currentYear] || 0;
    const lastYearCount = yearlyTrend[lastYear] || 0;
    const growth = lastYearCount > 0 ? ((currentYearCount - lastYearCount) / lastYearCount) * 100 : 0;

    return {
      trendData,
      distributionData,
      geograficData,
      correlationData,
      growth,
      currentYearCount,
      lastYearCount
    };
  }, [allData]);

  const renderAnalysisContent = () => {
    if (!analytics) return null;

    switch (analysisType) {
      case 'trend':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Dieses Jahr</p>
                      <p className="text-2xl font-bold text-blue-700">{analytics.currentYearCount}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-green-50 to-green-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">Letztes Jahr</p>
                      <p className="text-2xl font-bold text-green-700">{analytics.lastYearCount}</p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className={`bg-gradient-to-r ${analytics.growth >= 0 ? 'from-emerald-50 to-emerald-100' : 'from-red-50 to-red-100'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${analytics.growth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>Wachstum</p>
                      <p className={`text-2xl font-bold ${analytics.growth >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                        {analytics.growth >= 0 ? '+' : ''}{analytics.growth.toFixed(1)}%
                      </p>
                    </div>
                    {analytics.growth >= 0 ? (
                      <TrendingUp className="h-8 w-8 text-emerald-600" />
                    ) : (
                      <TrendingDown className="h-8 w-8 text-red-600" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Zeitreihen-Entwicklung</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        );

      case 'distribution':
        return (
          <Card>
            <CardHeader>
              <CardTitle>KW-Verteilung</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.distributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      case 'geographic':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Geografische Analyse - Top Orte</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.geograficData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="ort" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="totalKW" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      case 'correlation':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Sparten-Performance (Ø KW)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.correlationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sparte" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgKW" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trends & Analysen</h1>
          <p className="text-muted-foreground">Erweiterte Datenanalysen und Trends</p>
        </div>

        <Select value={analysisType} onValueChange={(value: any) => setAnalysisType(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Analyse auswählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trend">Zeitreihen-Trends</SelectItem>
            <SelectItem value="distribution">Verteilungsanalyse</SelectItem>
            <SelectItem value="geographic">Geografische Analyse</SelectItem>
            <SelectItem value="correlation">Korrelationsanalyse</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Analysis Type Indicators */}
      <div className="flex gap-2">
        {[
          { key: 'trend', label: 'Trends', icon: TrendingUp },
          { key: 'distribution', label: 'Verteilung', icon: BarChart3 },
          { key: 'geographic', label: 'Geografisch', icon: Users },
          { key: 'correlation', label: 'Korrelation', icon: PieChart },
        ].map(({ key, label, icon: Icon }) => (
          <Badge
            key={key}
            variant={analysisType === key ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setAnalysisType(key as any)}
          >
            <Icon className="h-3 w-3 mr-1" />
            {label}
          </Badge>
        ))}
      </div>

      {renderAnalysisContent()}

      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <span>Lade Analysedaten...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Analytics;