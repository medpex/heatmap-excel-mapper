import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Building2, TrendingUp, Filter, Download, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import MapComponent from './MapComponent';
import FilterPanel from './FilterPanel';

export interface DataRow {
  'Geändert am'?: string;
  'Zugriffsdatum'?: string;
  'Sparte': string;
  'Ort': string;
  'PLZ': string;
  'Strasse': string;
  'Haus-Nr': string;
  'Ort, Strasse Haus-Nr': string;
  'Datum'?: string;
  'Notiz'?: string;
  'KW-Zahl'?: number | string;
  'Art': string;
  latitude?: number;
  longitude?: number;
  _table: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const TABLES = [
  'Gefilterte_Adressen_Geesthacht',
  'Gefilterte_Adressen_Gülzow',
  'Gefilterte_Adressen_Hamwarde',
  'Gefilterte_Adressen_Kollow',
  'Gefilterte_Adressen_Wiershop',
  'Gefilterte_Adressen_Worth',
];

function getYear(dateStr?: string) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).getFullYear().toString();
  } catch {
    return '';
  }
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr.filter(Boolean)));
}

function toCSV(rows: DataRow[]): string {
  if (!rows.length) return '';
  const keys = Object.keys(rows[0]);
  const csv = [keys.join(',')].concat(
    rows.map(row => keys.map(k => `"${(row as any)[k] ?? ''}"`).join(','))
  );
  return csv.join('\n');
}

const DataVisualizationTool = () => {
  const [allGeoData, setAllGeoData] = useState<DataRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [ortFilter, setOrtFilter] = useState<string[]>([]);
  const [plzFilter, setPlzFilter] = useState<string[]>([]);
  const [jahrRange, setJahrRange] = useState<[number, number]>([2000, 2024]);
  const [artFilter, setArtFilter] = useState<string[]>([]);
  const [kwRange, setKwRange] = useState<[number, number]>([0, 100]);
  const [layer, setLayer] = useState<'heatmap' | 'cluster' | 'marker'>('heatmap');
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const loadAllTables = async () => {
      setIsLoading(true);
      let allData: DataRow[] = [];
      for (const table of TABLES) {
        try {
          const res = await fetch(`${API_URL}/data/${table}`);
          if (!res.ok) throw new Error('Fehler beim Laden der Daten');
          const json: DataRow[] = await res.json();
          allData = allData.concat(json.map(row => ({ ...row, _table: table })));
        } catch (error) {
          toast({ title: `Fehler bei ${table}`, description: 'Konnte keine Daten laden', variant: 'destructive' });
        }
      }
      setAllGeoData(allData);
      setIsLoading(false);
      toast({ title: 'Daten geladen', description: `${allData.filter(d => d.latitude && d.longitude).length} Datensätze mit Koordinaten` });
    };
    loadAllTables();
  }, [toast]);

  // Filteroptionen berechnen
  const ortOptions = unique(allGeoData.map(d => d.Ort));
  const jahrOptions = unique(allGeoData.map(d => getYear(d.Datum))).map(Number).filter(Boolean).sort((a, b) => a - b);
  const artOptions = unique(allGeoData.map(d => d.Art));
  const kwValues = allGeoData.map(d => typeof d['KW-Zahl'] === 'number' ? d['KW-Zahl'] : parseFloat(d['KW-Zahl'] as string)).filter(v => !isNaN(v));
  const kwMinValue = kwValues.length ? Math.min(...kwValues) : 0;
  const kwMaxValue = kwValues.length ? Math.max(...kwValues) : 100;
  const jahrMinValue = jahrOptions.length ? Math.min(...jahrOptions) : 2000;
  const jahrMaxValue = jahrOptions.length ? Math.max(...jahrOptions) : 2024;

  // Gefilterte Daten für die Map
  const geoData = allGeoData.filter(d =>
    d.latitude && d.longitude &&
    (ortFilter.length === 0 || ortFilter.includes(d.Ort)) &&
    (artFilter.length === 0 || artFilter.includes(d.Art)) &&
    (typeof d['KW-Zahl'] === 'undefined' || isNaN(Number(d['KW-Zahl'])) || (Number(d['KW-Zahl']) >= kwRange[0] && Number(d['KW-Zahl']) <= kwRange[1])) &&
    (getYear(d.Datum) === '' || (Number(getYear(d.Datum)) >= jahrRange[0] && Number(getYear(d.Datum)) <= jahrRange[1])) &&
    (search === '' || d['Ort, Strasse Haus-Nr'].toLowerCase().includes(search.toLowerCase()))
  );

  // Statistiken
  const stats = {
    count: geoData.length,
    sumKW: geoData.reduce((sum, d) => sum + (Number(d['KW-Zahl']) || 0), 0),
    topArt: (() => {
      const counts: Record<string, number> = {};
      geoData.forEach(d => { counts[d.Art] = (counts[d.Art] || 0) + 1; });
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
    })(),
    uniqueOrte: new Set(geoData.map(d => d.Ort)).size,
  };

  const handleReset = () => {
    setOrtFilter([]);
    setPlzFilter([]);
    setJahrRange([jahrMinValue, jahrMaxValue]);
    setArtFilter([]);
    setKwRange([kwMinValue, kwMaxValue]);
    setLayer('heatmap');
    setSearch('');
  };

  const handleExport = () => {
    const csv = toCSV(geoData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'geodaten.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header with Stats */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Geografische Datenanalyse</h1>
              <p className="text-muted-foreground">Interaktive Kartenvisualisierung und Datenfilterung</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filter {showFilters ? 'ausblenden' : 'anzeigen'}
              </Button>
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Zurücksetzen
              </Button>
              <Button onClick={handleExport} className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-700">{stats.count.toLocaleString()}</p>
                    <p className="text-sm text-blue-600 font-medium">Anschlüsse</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-purple-700">{stats.topArt}</p>
                    <p className="text-sm text-purple-600 font-medium">Häufigste Art</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-700">{stats.uniqueOrte}</p>
                    <p className="text-sm text-orange-600 font-medium">Standorte</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="shadow-medium">
            <CardContent className="p-6">
              <FilterPanel
                ortFilter={ortFilter}
                setOrtFilter={setOrtFilter}
                ortOptions={ortOptions}
                jahrRange={jahrRange}
                setJahrRange={setJahrRange}
                jahrMinValue={jahrMinValue}
                jahrMaxValue={jahrMaxValue}
                kwRange={kwRange}
                setKwRange={setKwRange}
                kwMinValue={kwMinValue}
                kwMaxValue={kwMaxValue}
                artFilter={artFilter}
                setArtFilter={setArtFilter}
                artOptions={artOptions}
                search={search}
                setSearch={setSearch}
                layer={layer}
                setLayer={setLayer}
              />
            </CardContent>
          </Card>
        )}

        {/* Map */}
        <Card className="shadow-xl border border-border overflow-hidden">
          <CardHeader className="bg-gradient-header text-white">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Kartenansicht
              <span className="text-sm font-normal text-white/80 ml-auto">
                {geoData.length} Datenpunkte
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <MapComponent data={geoData} layer={layer} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataVisualizationTool;