import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Search, Filter, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DashboardStats from '@/components/DashboardStats';
import DashboardCharts from '@/components/DashboardCharts';
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

const Dashboard = () => {
  const [allData, setAllData] = useState<DataRow[]>([]);
  const [filteredData, setFilteredData] = useState<DataRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTables, setSelectedTables] = useState<string[]>(TABLES);
  const { toast } = useToast();

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    // Anwenden von Suchfiltern und Tabellenfiltern
    let filtered = allData.filter(row => 
      selectedTables.includes(row._table)
    );

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(row =>
        row.Ort.toLowerCase().includes(query) ||
        row.Sparte.toLowerCase().includes(query) ||
        row.Art.toLowerCase().includes(query) ||
        row['Ort, Strasse Haus-Nr'].toLowerCase().includes(query)
      );
    }

    setFilteredData(filtered);
  }, [allData, searchQuery, selectedTables]);

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
      title: 'Dashboard aktualisiert', 
      description: `${combinedData.length} Datensätze geladen` 
    });
  };

  const toggleTable = (table: string) => {
    setSelectedTables(prev => 
      prev.includes(table) 
        ? prev.filter(t => t !== table)
        : [...prev, table]
    );
  };

  const exportData = () => {
    const csv = [
      Object.keys(filteredData[0] || {}).join(','),
      ...filteredData.map(row => 
        Object.values(row).map(val => `"${val || ''}"`).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Überblick über alle Datensätze und Analysen</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={loadAllData} 
            disabled={isLoading} 
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
          
          <Button 
            onClick={exportData} 
            disabled={filteredData.length === 0}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Suche
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Suchleiste */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suche nach Ort, Sparte, Art oder Adresse..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Tabellen-Filter */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Aktive Tabellen:</p>
            <div className="flex flex-wrap gap-2">
              {TABLES.map(table => (
                <Badge
                  key={table}
                  variant={selectedTables.includes(table) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTable(table)}
                >
                  {table.replace('Gefilterte_Adressen_', '')}
                </Badge>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Gesamt: {allData.length} Datensätze</span>
            <span>Gefiltert: {filteredData.length} Datensätze</span>
            <span>Aktive Tabellen: {selectedTables.length}/{TABLES.length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Statistiken */}
      <DashboardStats data={filteredData} />

      {/* Charts */}
      <DashboardCharts data={filteredData} />

      {/* Loading State */}
      {isLoading && (
        <Card className="shadow-soft">
          <CardContent className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Lade Daten...</span>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;