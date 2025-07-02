import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Building2, Calendar, MapPin, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
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

// Farben für Charts
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

function getYear(dateStr?: string) {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    return year >= 1900 && year <= new Date().getFullYear() ? year : null;
  } catch {
    return null;
  }
}

const Analytics = () => {
  const [allData, setAllData] = useState<DataRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
    
    toast({ 
      title: 'Daten geladen', 
      description: `${combinedData.length} Anschlüsse analysiert` 
    });
  };

  // Basis-Statistiken
  const stats = {
    totalConnections: allData.length,
    uniqueLocations: new Set(allData.map(d => d.Ort)).size,
    geoDataCount: allData.filter(d => d.latitude && d.longitude).length,
    avgPerLocation: Math.round(allData.length / new Set(allData.map(d => d.Ort)).size || 0),
  };

  // Anschlüsse nach Orten
  const connectionsByLocation = Object.entries(
    allData.reduce((acc, row) => {
      acc[row.Ort] = (acc[row.Ort] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([ort, count]) => ({ ort, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Anschlüsse nach Baujahren
  const connectionsByYear = Object.entries(
    allData.reduce((acc, row) => {
      const year = getYear(row.Datum);
      if (year) {
        acc[year] = (acc[year] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>)
  )
    .map(([year, count]) => ({ year: parseInt(year), count }))
    .sort((a, b) => a.year - b.year);

  // Anschlüsse nach Art
  const connectionsByType = Object.entries(
    allData.reduce((acc, row) => {
      acc[row.Art] = (acc[row.Art] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([art, count]) => ({ art: art.length > 20 ? art.substring(0, 20) + '...' : art, fullArt: art, count }))
    .sort((a, b) => b.count - a.count);

  // Anschlüsse nach Sparten
  const connectionsBySparte = Object.entries(
    allData.reduce((acc, row) => {
      acc[row.Sparte] = (acc[row.Sparte] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([sparte, count]) => ({ sparte, count }))
    .sort((a, b) => b.count - a.count);

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700">{stats.totalConnections.toLocaleString()}</p>
                  <p className="text-sm text-blue-600 font-medium">Gesamt Anschlüsse</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700">{stats.uniqueLocations}</p>
                  <p className="text-sm text-green-600 font-medium">Standorte</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-700">{stats.avgPerLocation}</p>
                  <p className="text-sm text-purple-600 font-medium">Ø pro Standort</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-700">{stats.geoDataCount}</p>
                  <p className="text-sm text-orange-600 font-medium">Mit Koordinaten</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Anschlüsse nach Baujahren - Linie */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Anschlüsse nach Baujahren
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={connectionsByYear}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>


          {/* Anschlüsse nach Art - Pie Chart */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Anschlüsse nach Art
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={connectionsByType.slice(0, 8)}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ art, percent }) => `${art} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {connectionsByType.slice(0, 8).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [value, props.payload.fullArt]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Anschlüsse nach Sparten */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Anschlüsse nach Sparten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={connectionsBySparte}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sparte" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Baujahr-Analyse Tabelle */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Detaillierte Baujahr-Analyse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {connectionsByYear.map(({ year, count }) => (
                <div key={year} className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-lg font-bold text-primary">{year}</p>
                  <p className="text-sm text-muted-foreground">{count} Anschlüsse</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;