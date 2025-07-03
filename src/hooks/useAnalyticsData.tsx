import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DataRow } from '@/components/DataVisualizationTool';

const API_URL = import.meta.env.VITE_API_URL || 'https://geoanalytics.home-ki.eu:4000/api';
const TABLES = [
  'Gefilterte_Adressen_Geesthacht',
  'Gefilterte_Adressen_Gülzow',
  'Gefilterte_Adressen_Hamwarde',
  'Gefilterte_Adressen_Kollow',
  'Gefilterte_Adressen_Wiershop',
  'Gefilterte_Adressen_Worth',
];

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

export const useAnalyticsData = () => {
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
      if (row.Art && row.Art !== 'NaN') {
        acc[row.Art] = (acc[row.Art] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([art, count]) => ({ art: art.length > 20 ? art.substring(0, 20) + '...' : art, fullArt: art, count }))
    .sort((a, b) => b.count - a.count);

  return {
    allData,
    isLoading,
    stats,
    connectionsByYear,
    connectionsByType,
  };
};