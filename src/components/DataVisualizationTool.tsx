import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Building2, Navigation, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MapComponent from './MapComponent';
import FilterSidebar from './FilterSidebar';

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
  // KW-Zahl Bereich
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

  // Statistik-Karten
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

  // Reset-Handler für Filter und Map
  const handleReset = () => {
    setOrtFilter([]);
    setPlzFilter([]);
    setJahrRange([jahrMinValue, jahrMaxValue]);
    setArtFilter([]);
    setKwRange([kwMinValue, kwMaxValue]);
    setLayer('heatmap');
    setSearch('');
  };

  // Export-Handler
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
    <div className="min-h-screen bg-background font-corporate">
      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Professional Sidebar */}
        <aside className="w-80 bg-card border-r border-border shadow-strong flex flex-col">
          <div className="p-6 border-b border-border bg-gradient-header">
            <h2 className="text-lg font-semibold text-white mb-1">Datenfilter</h2>
            <p className="text-sm text-white/80">Konfigurieren Sie Ihre Analyse</p>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto">
            <FilterSidebar
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
            />
            
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground mb-3">Kartenansicht</h3>
              <select 
                value={layer} 
                onChange={e => setLayer(e.target.value as any)} 
                className="w-full p-2.5 border border-border rounded-md bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="heatmap">Heatmap</option>
                <option value="cluster">Cluster</option>
                <option value="marker">Einzelne Marker</option>
              </select>
            </div>
          </div>
          
          <div className="p-6 border-t border-border bg-muted/30 space-y-3">
            <button 
              onClick={handleReset} 
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-md font-medium text-sm hover:bg-secondary/80 transition-colors"
            >
              <Navigation className="h-4 w-4" />
              Filter zurücksetzen
            </button>
            <button 
              onClick={handleExport} 
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-md font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              <TrendingUp className="h-4 w-4" />
              CSV Export
            </button>
          </div>
        </aside>

        {/* Map Area */}
        <main className="flex-1 bg-muted/30">
          {/* Stats Overview */}
          <div className="p-6 bg-card border-b border-border">
            <div className="grid grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-soft">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 bg-blue-500 rounded-lg">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-700">{stats.count.toLocaleString()}</p>
                    <p className="text-sm font-medium text-blue-600">Anschlüsse</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-soft">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 bg-green-500 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-700">{stats.sumKW.toLocaleString()}</p>
                    <p className="text-sm font-medium text-green-600">Gesamt kW</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-soft">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 bg-purple-500 rounded-lg">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-purple-700">{stats.topArt}</p>
                    <p className="text-sm font-medium text-purple-600">Häufigste Art</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-soft">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 bg-orange-500 rounded-lg">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-700">{stats.uniqueOrte}</p>
                    <p className="text-sm font-medium text-orange-600">Standorte</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Map Container */}
          <div className="p-6">
            <Card className="shadow-xl border border-border overflow-hidden">
              <CardHeader className="bg-gradient-header text-white p-6">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                  <MapPin className="h-5 w-5" />
                  Geografische Datenanalyse
                  <span className="text-sm font-normal text-white/80 ml-auto">
                    {geoData.length} Datenpunkte angezeigt
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <MapComponent data={geoData} layer={layer} />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DataVisualizationTool;