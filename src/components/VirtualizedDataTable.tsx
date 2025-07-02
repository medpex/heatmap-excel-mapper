import { useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DataRow } from './DataVisualizationTool';

interface VirtualizedDataTableProps {
  data: DataRow[];
}

const VirtualizedDataTable = ({ data }: VirtualizedDataTableProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 10,
  });

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
        <h3 className="text-lg font-semibold">Datentabelle (Virtualisiert)</h3>
        <Badge variant="secondary">
          {data.length} Einträge
        </Badge>
      </div>
      
      <div 
        ref={parentRef}
        className="h-[500px] w-full border rounded-md overflow-auto"
      >
        {/* Header */}
        <div className="grid grid-cols-9 gap-4 p-4 border-b bg-muted/50 sticky top-0 z-10">
          <div className="font-medium text-sm">ID</div>
          <div className="font-medium text-sm">Sparte</div>
          <div className="font-medium text-sm">Ort</div>
          <div className="font-medium text-sm">PLZ</div>
          <div className="font-medium text-sm">Adresse</div>
          <div className="font-medium text-sm">Art</div>
          <div className="font-medium text-sm">KW-Zahl</div>
          <div className="font-medium text-sm">Datum</div>
          <div className="font-medium text-sm">Notiz</div>
        </div>

        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const row = data[virtualItem.index];
            return (
              <div
                key={virtualItem.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                className="grid grid-cols-9 gap-4 p-4 border-b hover:bg-muted/50 items-center"
              >
                <div className="font-medium text-sm">{virtualItem.index + 1}</div>
                <div>
                  <Badge className={getSparteColor(row.Sparte)}>
                    {row.Sparte}
                  </Badge>
                </div>
                <div className="font-medium text-sm">{row.Ort}</div>
                <div className="text-sm">{row.PLZ}</div>
                <div className="text-sm truncate" title={row['Ort, Strasse Haus-Nr']}>
                  {row['Ort, Strasse Haus-Nr']}
                </div>
                <div>
                  <Badge variant="outline" className={getArtColor(row.Art)}>
                    {row.Art}
                  </Badge>
                </div>
                <div className="text-right text-sm">
                  {row['KW-Zahl'] ? (
                    <span className="font-mono bg-muted px-2 py-1 rounded text-xs">
                      {row['KW-Zahl']}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {row.Datum || '-'}
                </div>
                <div className="text-sm text-muted-foreground truncate" title={row.Notiz}>
                  {row.Notiz || '-'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VirtualizedDataTable;