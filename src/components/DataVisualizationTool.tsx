import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Upload, BarChart3, Filter, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import MapComponent from './MapComponent';
import DataTable from './DataTable';
import StatsCards from './StatsCards';

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
  'KW-Zahl'?: number;
  'Art': string;
  latitude?: number;
  longitude?: number;
}

const DataVisualizationTool = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [filteredData, setFilteredData] = useState<DataRow[]>([]);
  const [filters, setFilters] = useState({
    sparte: '',
    ort: '',
    art: '',
    plz: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as DataRow[];

      // Add geocoding for heatmap functionality
      const dataWithCoords = await Promise.all(
        jsonData.map(async (row) => {
          try {
            const address = `${row.Strasse} ${row['Haus-Nr']}, ${row.PLZ} ${row.Ort}, Deutschland`;
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
            const geocodeResult = await response.json();
            
            if (geocodeResult.length > 0) {
              return {
                ...row,
                latitude: parseFloat(geocodeResult[0].lat),
                longitude: parseFloat(geocodeResult[0].lon)
              };
            }
            return row;
          } catch (error) {
            console.warn('Geocoding failed for:', row.Ort, error);
            return row;
          }
        })
      );

      setData(dataWithCoords);
      setFilteredData(dataWithCoords);
      
      toast({
        title: "Datei erfolgreich hochgeladen",
        description: `${dataWithCoords.length} Datensätze importiert`,
      });
    } catch (error) {
      toast({
        title: "Fehler beim Laden der Datei",
        description: "Bitte überprüfen Sie das Dateiformat",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const applyFilters = useCallback(() => {
    let filtered = data;
    
    if (filters.sparte) {
      filtered = filtered.filter(row => 
        row.Sparte?.toLowerCase().includes(filters.sparte.toLowerCase())
      );
    }
    if (filters.ort) {
      filtered = filtered.filter(row => 
        row.Ort?.toLowerCase().includes(filters.ort.toLowerCase())
      );
    }
    if (filters.art) {
      filtered = filtered.filter(row => 
        row.Art?.toLowerCase().includes(filters.art.toLowerCase())
      );
    }
    if (filters.plz) {
      filtered = filtered.filter(row => 
        row.PLZ?.includes(filters.plz)
      );
    }
    
    setFilteredData(filtered);
  }, [data, filters]);

  const exportData = useCallback(() => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daten");
    XLSX.writeFile(wb, "gefilterte_daten.xlsx");
    
    toast({
      title: "Export erfolgreich",
      description: "Daten wurden als Excel-Datei gespeichert",
    });
  }, [filteredData, toast]);

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      <header className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="bg-gradient-primary p-3 rounded-lg shadow-medium">
            <MapPin className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Geodaten Visualisierung
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Importieren Sie Ihre Excel-Daten und visualisieren Sie sie als interaktive Karte mit Heatmap-Funktionalität
        </p>
      </header>

      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Datei-Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="max-w-md"
            />
            <Badge variant="secondary" className="whitespace-nowrap">
              {data.length} Datensätze
            </Badge>
            {data.length > 0 && (
              <Button 
                onClick={exportData} 
                variant="outline" 
                size="sm"
                className="ml-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {data.length > 0 && (
        <>
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Sparte filtern..."
                  value={filters.sparte}
                  onChange={(e) => setFilters({...filters, sparte: e.target.value})}
                  onBlur={applyFilters}
                />
                <Input
                  placeholder="Ort filtern..."
                  value={filters.ort}
                  onChange={(e) => setFilters({...filters, ort: e.target.value})}
                  onBlur={applyFilters}
                />
                <Input
                  placeholder="Art filtern..."
                  value={filters.art}
                  onChange={(e) => setFilters({...filters, art: e.target.value})}
                  onBlur={applyFilters}
                />
                <Input
                  placeholder="PLZ filtern..."
                  value={filters.plz}
                  onChange={(e) => setFilters({...filters, plz: e.target.value})}
                  onBlur={applyFilters}
                />
              </div>
            </CardContent>
          </Card>

          <StatsCards data={filteredData} />

          <Tabs defaultValue="map" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="map" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Karten-Ansicht
              </TabsTrigger>
              <TabsTrigger value="table" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Tabellen-Ansicht
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="map" className="mt-6">
              <Card className="shadow-medium">
                <CardContent className="p-0">
                  <MapComponent data={filteredData} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="table" className="mt-6">
              <Card className="shadow-medium">
                <CardContent className="p-6">
                  <DataTable data={filteredData} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default DataVisualizationTool;