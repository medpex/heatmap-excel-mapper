import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FilterPanelProps {
  ortFilter: string[];
  setOrtFilter: (value: string[]) => void;
  ortOptions: string[];
  jahrRange: [number, number];
  setJahrRange: (value: [number, number]) => void;
  jahrMinValue: number;
  jahrMaxValue: number;
  artFilter: string[];
  setArtFilter: (value: string[]) => void;
  artOptions: string[];
  search: string;
  setSearch: (value: string) => void;
  layer: 'heatmap' | 'cluster' | 'marker';
  setLayer: (value: 'heatmap' | 'cluster' | 'marker') => void;
}

const FilterPanel = ({
  ortFilter,
  setOrtFilter,
  ortOptions,
  jahrRange,
  setJahrRange,
  jahrMinValue,
  jahrMaxValue,
  artFilter,
  setArtFilter,
  artOptions,
  search,
  setSearch,
  layer,
  setLayer,
}: FilterPanelProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Search */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Adresssuche</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Adresse suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Zeitraum */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">
          Zeitraum ({jahrRange[0]} - {jahrRange[1]})
        </Label>
        <div className="space-y-2">
          <Slider
            value={jahrRange}
            onValueChange={(value) => setJahrRange(value as [number, number])}
            min={jahrMinValue}
            max={jahrMaxValue}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{jahrMinValue}</span>
            <span>{jahrMaxValue}</span>
          </div>
        </div>
      </div>


      {/* Kartenansicht */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Kartenansicht</Label>
        <select 
          value={layer} 
          onChange={e => setLayer(e.target.value as any)} 
          className="w-full p-2.5 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="heatmap">Heatmap</option>
          <option value="cluster">Cluster</option>
          <option value="marker">Einzelne Marker</option>
        </select>
      </div>

      {/* Orte Filter */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">
            Orte ({ortFilter.length}/{ortOptions.length} ausgewählt)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-32 overflow-y-auto">
          {ortOptions.map((ort) => (
            <div key={ort} className="flex items-center space-x-2">
              <Checkbox
                id={`ort-${ort}`}
                checked={ortFilter.includes(ort)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setOrtFilter([...ortFilter, ort]);
                  } else {
                    setOrtFilter(ortFilter.filter(o => o !== ort));
                  }
                }}
              />
              <label
                htmlFor={`ort-${ort}`}
                className="text-sm text-foreground cursor-pointer hover:text-primary"
              >
                {ort}
              </label>
            </div>
          ))}
          {ortFilter.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOrtFilter([])}
              className="mt-2 h-7 text-xs"
            >
              Alle abwählen
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Anschlussart Filter */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">
            Anschlussart ({artFilter.length}/{artOptions.length} ausgewählt)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-32 overflow-y-auto">
          {artOptions.map((art) => (
            <div key={art} className="flex items-center space-x-2">
              <Checkbox
                id={`art-${art}`}
                checked={artFilter.includes(art)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setArtFilter([...artFilter, art]);
                  } else {
                    setArtFilter(artFilter.filter(a => a !== art));
                  }
                }}
              />
              <label
                htmlFor={`art-${art}`}
                className="text-sm text-foreground cursor-pointer hover:text-primary line-clamp-1"
              >
                {art}
              </label>
            </div>
          ))}
          {artFilter.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setArtFilter([])}
              className="mt-2 h-7 text-xs"
            >
              Alle abwählen
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FilterPanel;