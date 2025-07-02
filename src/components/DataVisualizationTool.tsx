import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Info, RefreshCw, Download, Search } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur border-b border-border shadow-sm flex items-center px-6 py-3 gap-4">
        <MapPin className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text text-transparent">GeoHeatmap Auswertung</h1>
        <div className="ml-auto flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-primary/10 transition" title="Info / Hilfe">
            <Info className="h-6 w-6 text-muted-foreground" />
          </button>
        </div>
      </header>
      <main className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-full max-w-xs bg-white/90 border-r border-border shadow-lg flex flex-col gap-6 p-6 sticky top-[64px] h-[calc(100vh-64px)] z-20">
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
          <div>
            <h2 className="text-lg font-semibold mb-2">Darstellung</h2>
            <select value={layer} onChange={e => setLayer(e.target.value as any)} className="border rounded px-2 py-1 w-full">
              <option value="heatmap">Heatmap</option>
              <option value="cluster">Cluster</option>
              <option value="marker">Marker</option>
            </select>
          </div>
          <button onClick={handleReset} className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-green-400 text-white font-semibold shadow hover:scale-105 transition">
            <RefreshCw className="h-5 w-5" />
            Filter & Ansicht zurücksetzen
          </button>
          <button onClick={handleExport} className="mt-2 flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold shadow hover:scale-105 transition" title="Gefilterte Daten als CSV exportieren">
            <Download className="h-5 w-5" />
            Export (CSV)
          </button>
          <div className="mt-auto text-xs text-muted-foreground text-center">
            <span>© {new Date().getFullYear()} GeoHeatmap</span>
          </div>
        </aside>
        {/* Map-Bereich */}
        <section className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-green-50 relative">
          {/* Dashboard-Kacheln */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl mx-auto mt-6 mb-2">
            <Card className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg border-0 py-6 px-2 rounded-2xl min-h-[120px]">
              <MapPin className="h-8 w-8 text-blue-600 mb-1" />
              <span className="text-2xl font-bold text-blue-700 tracking-tight leading-tight">{stats.count}</span>
              <span className="text-xs font-medium text-blue-700 mt-0.5">Adressen</span>
            </Card>
            <Card className="flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100 shadow-lg border-0 py-6 px-2 rounded-2xl min-h-[120px]">
              <span className="inline-block h-8 w-8 mb-1 rounded-full bg-green-200 flex items-center justify-center"><span className="text-green-700 font-bold text-base">kW</span></span>
              <span className="text-2xl font-bold text-green-700 tracking-tight leading-tight">{stats.sumKW}</span>
              <span className="text-xs font-medium text-green-700 mt-0.5">Summe KW</span>
            </Card>
            <Card className="flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100 shadow-lg border-0 py-6 px-2 rounded-2xl min-h-[120px]">
              <span className="inline-block h-8 w-8 mb-1 rounded-full bg-indigo-200 flex items-center justify-center"><span className="text-indigo-700 font-bold text-base">Art</span></span>
              <span className="text-lg font-bold text-indigo-700 tracking-tight leading-tight">{stats.topArt}</span>
              <span className="text-xs font-medium text-indigo-700 mt-0.5">Häufigste Art</span>
            </Card>
            <Card className="flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg border-0 py-6 px-2 rounded-2xl min-h-[120px]">
              <span className="inline-block h-8 w-8 mb-1 rounded-full bg-orange-200 flex items-center justify-center"><span className="text-orange-700 font-bold text-base">Ort</span></span>
              <span className="text-2xl font-bold text-orange-700 tracking-tight leading-tight">{stats.uniqueOrte}</span>
              <span className="text-xs font-medium text-orange-700 mt-0.5">Orte</span>
            </Card>
          </div>
          <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col">
            <Card className="shadow-2xl border-2 border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Karten-Ansicht
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <MapComponent data={geoData} layer={layer} />
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      {/* Platz für Onboarding/Info-Dialog (später) */}
    </div>
  );
};

export default DataVisualizationTool;