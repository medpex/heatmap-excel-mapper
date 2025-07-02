import { Card, CardContent } from '@/components/ui/card';
import { Building2, Calendar, MapPin, TrendingUp } from 'lucide-react';

interface AnalyticsStatsProps {
  stats: {
    totalConnections: number;
    uniqueLocations: number;
    geoDataCount: number;
    avgPerLocation: number;
  };
}

export const AnalyticsStats = ({ stats }: AnalyticsStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{stats.totalConnections.toLocaleString()}</p>
              <p className="text-sm text-blue-600 font-medium">Gesamt Anschlüsse</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{stats.uniqueLocations}</p>
              <p className="text-sm text-green-600 font-medium">Standorte</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-700">{stats.avgPerLocation}</p>
              <p className="text-sm text-purple-600 font-medium">Ø pro Standort</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-700">{stats.geoDataCount}</p>
              <p className="text-sm text-orange-600 font-medium">Mit Koordinaten</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};