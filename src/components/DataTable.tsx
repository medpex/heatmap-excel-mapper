import { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DataRow } from './DataVisualizationTool';

interface DataTableProps {
  data: DataRow[];
}

const DataTable = ({ data }: DataTableProps) => {
  const tableData = useMemo(() => {
    return data.map((row, index) => ({
      id: index,
      ...row
    }));
  }, [data]);

  const getSparteColor = (sparte: string) => {
    const colors = {
      'Energie': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Wasser': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      'Gas': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Strom': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Telekom': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    
    for (const [key, value] of Object.entries(colors)) {
      if (sparte.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getArtColor = (art: string) => {
    const colors = {
      'Installation': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Wartung': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Reparatur': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Kontrolle': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    
    for (const [key, value] of Object.entries(colors)) {
      if (art.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Keine Daten vorhanden. Bitte laden Sie eine Excel-Datei hoch.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Datentabelle</h3>
        <Badge variant="secondary">
          {data.length} Einträge
        </Badge>
      </div>
      
      <ScrollArea className="h-[500px] w-full border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Sparte</TableHead>
              <TableHead>Ort</TableHead>
              <TableHead>PLZ</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Art</TableHead>
              <TableHead>KW-Zahl</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead className="max-w-[200px]">Notiz</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{row.id + 1}</TableCell>
                <TableCell>
                  <Badge className={getSparteColor(row.Sparte)}>
                    {row.Sparte}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{row.Ort}</TableCell>
                <TableCell>{row.PLZ}</TableCell>
                <TableCell className="max-w-[250px] truncate" title={row['Ort, Strasse Haus-Nr']}>
                  {row['Ort, Strasse Haus-Nr']}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getArtColor(row.Art)}>
                    {row.Art}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {row['KW-Zahl'] ? (
                    <span className="font-mono bg-muted px-2 py-1 rounded text-sm">
                      {row['KW-Zahl']}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {row.Datum || '-'}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground" title={row.Notiz}>
                  {row.Notiz || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default DataTable;