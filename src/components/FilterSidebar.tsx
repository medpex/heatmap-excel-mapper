import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, MapPin, Zap, Calendar, Layers } from 'lucide-react';

interface FilterSidebarProps {
  ortFilter: string[];
  setOrtFilter: (v: string[]) => void;
  ortOptions: string[];
  jahrRange: [number, number];
  setJahrRange: (v: [number, number]) => void;
  jahrMinValue: number;
  jahrMaxValue: number;
  artFilter: string[];
  setArtFilter: (v: string[]) => void;
  artOptions: string[];
  search: string;
  setSearch: (v: string) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  ortFilter, setOrtFilter, ortOptions,
  jahrRange, setJahrRange, jahrMinValue, jahrMaxValue,
  artFilter, setArtFilter, artOptions,
  search, setSearch
}) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Ort Filter */}
      <Card className="border-l-4 border-orange-400 rounded-xl p-3 shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-1 px-0 pt-0">
          <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-orange-100"><MapPin className="h-4 w-4 text-orange-600" /></span>
          <CardTitle className="text-xs font-semibold text-orange-700">Ort</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 px-0 pb-0">
          <div className="max-h-20 overflow-y-auto pr-1">
            {ortOptions.map(opt => (
              <label key={opt} className="flex items-center gap-1 text-xs cursor-pointer">
                <Checkbox checked={ortFilter.includes(opt)} onCheckedChange={v => {
                  if (v) setOrtFilter([...ortFilter, opt]);
                  else setOrtFilter(ortFilter.filter(o => o !== opt));
                }} id={`ort-${opt}`} className="h-3 w-3" />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Baujahr Filter */}
      <Card className="border-l-4 border-blue-400 rounded-xl p-3 shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-1 px-0 pt-0">
          <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-100"><Calendar className="h-4 w-4 text-blue-600" /></span>
          <CardTitle className="text-xs font-semibold text-blue-700">Baujahr</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 px-0 pb-0">
          <Slider min={jahrMinValue} max={jahrMaxValue} step={1} value={jahrRange} onValueChange={v => setJahrRange([v[0], v[1]])} className="mb-1" />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{jahrRange[0]}</span>
            <span>{jahrRange[1]}</span>
          </div>
        </CardContent>
      </Card>
      {/* Art Filter */}
      <Card className="border-l-4 border-indigo-400 rounded-xl p-3 shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-1 px-0 pt-0">
          <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-indigo-100"><Layers className="h-4 w-4 text-indigo-600" /></span>
          <CardTitle className="text-xs font-semibold text-indigo-700">Art</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 px-0 pb-0">
          <div className="max-h-20 overflow-y-auto pr-1">
            {artOptions.map(opt => (
              <label key={opt} className="flex items-center gap-1 text-xs cursor-pointer">
                <Checkbox checked={artFilter.includes(opt)} onCheckedChange={v => {
                  if (v) setArtFilter([...artFilter, opt]);
                  else setArtFilter(artFilter.filter(a => a !== opt));
                }} id={`art-${opt}`} className="h-3 w-3" />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Suche */}
      <Card className="border-l-4 border-gray-400 rounded-xl p-3 shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-1 px-0 pt-0">
          <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-gray-100"><Search className="h-4 w-4 text-gray-600" /></span>
          <CardTitle className="text-xs font-semibold text-gray-700">Adresse suchen</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="z.B. Musterstraße 1" className="text-xs h-8 px-2" />
        </CardContent>
      </Card>
    </div>
  );
};

export default FilterSidebar; 