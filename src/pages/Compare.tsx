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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Users, BarChart3, Target, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DataRow } from '@/components/DataVisualizationTool';

const API_URL = import.meta.env.VITE_API_URL || 'https://geoanalytics.home-ki.eu/api';
const TABLES = [
  'Gefilterte_Adressen_Geesthacht',
  'Gefilterte_Adressen_Gülzow',
  'Gefilterte_Adressen_Hamwarde',
  'Gefilterte_Adressen_Kollow',
  'Gefilterte_Adressen_Wiershop',
  'Gefilterte_Adressen_Worth',
];

const Compare = () => {
  const [allData, setAllData] = useState<DataRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [compareType, setCompareType] = useState<'orte' | 'sparten' | 'tabellen'>('orte');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
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

  const availableItems = useMemo(() => {
    switch (compareType) {
      case 'orte':
        return [...new Set(allData.map(row => row.Ort))].sort();
      case 'sparten':
        return [...new Set(allData.map(row => row.Sparte))].sort();
      case 'tabellen':
        return TABLES.map(table => table.replace('Gefilterte_Adressen_', ''));
      default:
        return [];
    }
  }, [allData, compareType]);

  const comparisonData = useMemo(() => {
    if (!selectedItems.length) return null;

    const stats = selectedItems.map(item => {
      let filteredData: DataRow[];
      
      switch (compareType) {
        case 'orte':
          filteredData = allData.filter(row => row.Ort === item);
          break;
        case 'sparten':
          filteredData = allData.filter(row => row.Sparte === item);
          break;
        case 'tabellen':
          filteredData = allData.filter(row => row._table === `Gefilterte_Adressen_${item}`);
          break;
        default:
          filteredData = [];
      }

      const uniqueArten = new Set(filteredData.map(row => row.Art).filter(art => art !== 'NaN')).size;
      const uniqueSparten = new Set(filteredData.map(row => row.Sparte)).size;

      return {
        name: item,
        anzahl: filteredData.length,
        uniqueArten,
        uniqueSparten: compareType !== 'sparten' ? uniqueSparten : 1,
      };
    });

    // Für Radar Chart normalisieren
    const maxValues = {
      anzahl: Math.max(...stats.map(s => s.anzahl)),
      uniqueArten: Math.max(...stats.map(s => s.uniqueArten)),
      uniqueSparten: Math.max(...stats.map(s => s.uniqueSparten))
    };

    const radarData = [
      { subject: 'Anzahl', ...Object.fromEntries(stats.map(s => [s.name, (s.anzahl / maxValues.anzahl) * 100])) },
      { subject: 'Arten', ...Object.fromEntries(stats.map(s => [s.name, (s.uniqueArten / maxValues.uniqueArten) * 100])) },
      { subject: 'Sparten', ...Object.fromEntries(stats.map(s => [s.name, (s.uniqueSparten / maxValues.uniqueSparten) * 100])) },
    ];

    return { stats, radarData };
  }, [allData, selectedItems, compareType]);

  const toggleItem = (item: string) => {
    setSelectedItems(prev => {
      if (prev.includes(item)) {
        return prev.filter(i => i !== item);
      } else if (prev.length < 5) {
        return [...prev, item];
      } else {
        toast({
          title: 'Maximum erreicht',
          description: 'Sie können maximal 5 Elemente vergleichen',
          variant: 'destructive'
        });
        return prev;
      }
    });
  };

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vergleichsanalyse</h1>
          <p className="text-muted-foreground">Vergleichen Sie verschiedene Orte, Sparten oder Tabellen</p>
        </div>

        <Select value={compareType} onValueChange={(value: any) => {
          setCompareType(value);
          setSelectedItems([]);
        }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Vergleichstyp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="orte">Orte vergleichen</SelectItem>
            <SelectItem value="sparten">Sparten vergleichen</SelectItem>
            <SelectItem value="tabellen">Tabellen vergleichen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Selection Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {compareType === 'orte' ? 'Orte' : compareType === 'sparten' ? 'Sparten' : 'Tabellen'} auswählen
            <Badge variant="outline">{selectedItems.length}/5</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {availableItems.map(item => (
              <Badge
                key={item}
                variant={selectedItems.includes(item) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleItem(item)}
              >
                {item}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {comparisonData && (
        <>
          {/* Statistik-Karten */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {comparisonData.stats.map((stat, index) => (
              <Card key={stat.name} className="border-l-4" style={{ borderLeftColor: colors[index] }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Anzahl:</span>
                    <span className="font-semibold">{stat.anzahl}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Arten:</span>
                    <span className="font-semibold">{stat.uniqueArten}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Vergleichschart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Anzahl Vergleich
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData.stats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="anzahl" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Performance Radar (Normalisiert)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={comparisonData.radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  {selectedItems.map((item, index) => (
                    <Radar
                      key={item}
                      name={item}
                      dataKey={item}
                      stroke={colors[index]}
                      fill={colors[index]}
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {!comparisonData && !isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Wählen Sie mindestens ein Element zum Vergleichen aus</p>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <span>Lade Vergleichsdaten...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Compare;