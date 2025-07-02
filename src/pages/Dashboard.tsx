import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, MapPin, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Willkommen bei GeoAnalytics Pro</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ihre professionelle Plattform für geografische Datenanalyse und Visualisierung. 
            Analysieren Sie Standortdaten mit fortschrittlichen Kartentools und Filter-Funktionen.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-medium transition-shadow cursor-pointer group">
            <Link to="/map">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary rounded-lg group-hover:bg-primary/90 transition-colors">
                    <MapPin className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-lg">Karten-Ansicht</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Interaktive Kartenvisualisierung mit Heatmaps, Clustern und Einzelmarkern.
                </p>
                <Button className="w-full">Zur Karte</Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-medium transition-shadow cursor-pointer group">
            <Link to="/compare">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-500 rounded-lg group-hover:bg-green-400 transition-colors">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">Datenvergleiche</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Vergleichen Sie verschiedene Datensätze und analysieren Sie Trends.
                </p>
                <Button variant="outline" className="w-full">Vergleichen</Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg text-blue-700">Analytics</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-blue-600 mb-4">
                Detaillierte Auswertungen und Statistiken zu Ihren Geodaten.
              </p>
              <Button variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50">
                Bald verfügbar
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-gradient-card shadow-medium">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Kartenvisualisierung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Heatmap-Darstellung</h4>
                    <p className="text-sm text-muted-foreground">Visualisierung der Datendichte mit Farbverläufen</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Cluster-Ansicht</h4>
                    <p className="text-sm text-muted-foreground">Gruppierung nahegelegener Datenpunkte</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Einzelmarker</h4>
                    <p className="text-sm text-muted-foreground">Detailansicht jeden einzelnen Standorts</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-medium">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Datenfilterung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Geografische Filter</h4>
                    <p className="text-sm text-muted-foreground">Filterung nach Orten und Postleitzahlen</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Zeitraum-Filter</h4>
                    <p className="text-sm text-muted-foreground">Analyse verschiedener Zeitperioden</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Kategorien-Filter</h4>
                    <p className="text-sm text-muted-foreground">Sortierung nach Anschlussart und KW-Bereichen</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;